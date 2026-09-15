"""Real-origin browser capture and honest, unresized reference comparison."""
from pathlib import Path
from functools import partial
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from threading import Thread
import contextlib, hashlib, io, json, subprocess, tarfile, tempfile, time
import cv2
import numpy as np
from PIL import Image
from skimage.metrics import structural_similarity
from playwright.sync_api import sync_playwright

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'docs/qa/reference-v2'
OUT.mkdir(parents=True,exist_ok=True)
BASE='7905fad3f6b2777fbe1467e126d84e6e18a7ee55'
reference=ROOT/'references/world-agent-reference.png'
assert hashlib.sha256(reference.read_bytes()).hexdigest()=='33a09ea47412e39b91f7936b7f74c51126ccd92509c891f18e1309021539ac6d', 'Golden reference changed'
ASSETS={'hero-world.avif':(720,540),'peach-sparkling-water.avif':(360,480),'consumer-community.avif':(600,450),'mountain-cta.avif':(800,450)}
for name,size in ASSETS.items():
    p=ROOT/'dist/public/assets/visual-v2'/name
    with Image.open(p) as im:
        im.load()
        assert im.size==size, name

class QuietHandler(SimpleHTTPRequestHandler):
    def log_message(self,*args): pass

def serve(folder):
    server=ThreadingHTTPServer(('127.0.0.1',0),partial(QuietHandler,directory=str(folder)))
    Thread(target=server.serve_forever,daemon=True).start()
    return server, f'http://127.0.0.1:{server.server_port}'

def measures(ref,shot):
    assert ref.shape==shot.shape, 'Do not stretch screenshots to improve scores'
    diff=cv2.absdiff(ref,shot).astype(np.float32)/255
    rg=cv2.cvtColor(ref,cv2.COLOR_BGR2GRAY); sg=cv2.cvtColor(shot,cv2.COLOR_BGR2GRAY)
    re=cv2.Canny(rg,80,180)>0; se=cv2.Canny(sg,80,180)>0
    return {'normalized_mae':float(diff.mean()),'normalized_rmse':float(np.sqrt((diff**2).mean())), 'ssim':float(structural_similarity(rg,sg,data_range=255)), 'edge_iou':float(np.logical_and(re,se).sum()/max(1,np.logical_or(re,se).sum()))}

metadata={'baseline_commit':BASE,'review_input_commit':subprocess.check_output(['git','rev-parse','HEAD'],cwd=ROOT,text=True).strip(),'rendering':'Chromium, real local HTTP origins, device scale factor 1','method':'Reference split at x=800. Landing 800x1024 and dashboard 736x1024. No resize, alignment warp, masking, or score normalization beyond division by 255. All text and controls remain DOM; illustration differences remain.','captures':{},'checks':[]}
with tempfile.TemporaryDirectory() as temp:
    before=Path(temp)/'baseline'; before.mkdir()
    archive=subprocess.check_output(['git','archive',BASE],cwd=ROOT)
    with tarfile.open(fileobj=io.BytesIO(archive)) as t: t.extractall(before,filter='data')
    bs,bu=serve(before); after_server,au=serve(ROOT/'dist')
    try:
        with sync_playwright() as pw:
            browser=pw.chromium.launch(headless=True)
            for mode,url in [('before',bu),('after',au)]:
                for name,route,w,h in [('landing','/',800,1024),('app','/app/',736,1024),('landing-desktop','/',1440,1000),('app-desktop','/app/',1440,1000),('landing-mobile','/',390,844),('app-mobile','/app/',390,844)]:
                    page=browser.new_page(viewport={'width':w,'height':h},device_scale_factor=1,locale='zh-CN',reduced_motion='reduce')
                    errors=[]
                    page.on('pageerror',lambda e:errors.append(str(e)))
                    page.goto(url+route,wait_until='networkidle')
                    page.evaluate('document.fonts.ready')
                    for y in range(0,5000,450):
                        page.evaluate('(y)=>scrollTo(0,y)',y); page.wait_for_timeout(30)
                    page.evaluate('scrollTo(0,0)');page.wait_for_timeout(250)
                    info=page.evaluate('''() => ({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,height:document.documentElement.scrollHeight,images:[...document.images].map(i=>({src:i.getAttribute('src'),loaded:i.complete&&i.naturalWidth>0,width:i.naturalWidth,height:i.naturalHeight}))})''')
                    info['pageErrors']=errors
                    metadata['captures'][mode+'-'+name]=info
                    page.screenshot(path=str(OUT/f'{mode}-{name}.png'))
                    if mode=='after' and ('mobile' in name or 'desktop' in name):page.screenshot(path=str(OUT/f'{mode}-{name}-full.png'),full_page=True)
                    if mode=='after':
                        assert not errors, errors
                        assert info['scrollWidth']<=w, f'Horizontal overflow: {name}'
                        assert all(i['loaded'] for i in info['images']), f'Broken image: {name}'
                    page.close()
            page=browser.new_page(viewport={'width':1440,'height':1000},locale='zh-CN')
            page.goto(au+'/app/',wait_until='networkidle')
            old=page.locator('.kpi-grid strong').first.inner_text()
            page.locator('.scheme-card[data-scheme="A"]').click()
            assert page.locator('.kpi-grid strong').first.inner_text()!=old
            page.locator('[data-step="1"]').click()
            assert page.locator('[data-field="audience"]').count()==1
            page.locator('[data-step="4"]').click()
            assert page.locator('[data-action="duration"]').count()==1
            page.locator('[data-step="0"]').click()
            page.locator('[data-action="run"]').first.click()
            page.locator('[data-action="view-results"]').wait_for(state='visible')
            page.locator('[data-action="view-results"]').click()
            assert not page.locator('#run-dialog').is_visible()
            page.goto(au+'/',wait_until='networkidle')
            page.locator('.wa-hero-actions a').first.click()
            page.wait_for_url('**/app/**')
            metadata['checks'] += ['All four shipped AVIFs decode at expected dimensions','No horizontal overflow at reference, desktop or mobile widths','No JavaScript page errors','Scenario selection changes example KPI','Audience and runtime steps open','Example-run dialog completes and closes','Landing CTA navigates to app over HTTP']
            page.close();browser.close()
    finally:
        bs.shutdown();after_server.shutdown()

ref=cv2.imread(str(reference)); assert ref.shape[:2]==(1024,1536)
panels={'landing':ref[:,:800], 'app':ref[:,800:]}
metrics={}
for name,target in panels.items():
    cv2.imwrite(str(OUT/f'reference-{name}.png'),target)
    metrics[name]={mode:measures(target,cv2.imread(str(OUT/f'{mode}-{name}.png'))) for mode in ['before','after']}
    shot=cv2.imread(str(OUT/f'after-{name}.png'))
    heat=cv2.applyColorMap(cv2.cvtColor(cv2.absdiff(target,shot),cv2.COLOR_BGR2GRAY),cv2.COLORMAP_TURBO)
    cv2.imwrite(str(OUT/f'{name}-heatmap.png'),heat)
    cv2.imwrite(str(OUT/f'{name}-overlay.png'),cv2.addWeighted(target,.5,shot,.5,0))
    assert metrics[name]['after']['normalized_mae']<metrics[name]['before']['normalized_mae'], f'{name}: aggregate error did not improve'
metadata['metrics']=metrics
(OUT/'metrics.json').write_text(json.dumps(metadata,ensure_ascii=False,indent=2))
composite=np.concatenate([cv2.imread(str(OUT/'after-landing.png')),cv2.imread(str(OUT/'after-app.png'))],axis=1)
cv2.imwrite(str(OUT/'after-composite.png'),composite)
rows=''.join(f'<tr><td>{name}</td><td>{m["before"]["normalized_mae"]:.4f}</td><td>{m["after"]["normalized_mae"]:.4f}</td><td>{m["before"]["ssim"]:.4f}</td><td>{m["after"]["ssim"]:.4f}</td></tr>' for name,m in metrics.items())
sections=''.join(f'<h2>{name}</h2><div class="grid">'+''.join(f'<figure><figcaption>{label}</figcaption><a href="{file}"><img src="{file}" alt="{name} {label}" loading="lazy"></a></figure>' for label,file in [('Reference',f'reference-{name}.png'),('Before',f'before-{name}.png'),('After',f'after-{name}.png'),('Absolute difference heatmap',f'{name}-heatmap.png')])+'</div>' for name in panels)
html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>World Agent visual review v2</title><style>body{font:16px/1.6 system-ui;margin:28px;background:#f5f7fb;color:#15233c}main{max-width:1500px;margin:auto}a{color:#255cec}.grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px}figure{margin:0;background:white;padding:10px;border:1px solid #dde5ef;border-radius:8px}img{width:100%;height:auto}figcaption{font-weight:600;margin:0 0 8px}table{border-collapse:collapse;background:white}td,th{padding:9px 18px;border:1px solid #dfe6f2}@media(max-width:800px){.grid{grid-template-columns:1fr 1fr}body{margin:15px}}</style><main><h1>World Agent: reference alignment v2</h1><p><a href="../../../index.html">Open landing</a> · <a href="../../../app/">Open dashboard</a> · <a href="metrics.json">Raw measurements</a></p><p>Real Chromium screenshots over HTTP. Reference panels are evaluated independently at 800×1024 and 736×1024, without resizing. This is a working DOM interface, not a screenshot overlay. Smaller error is better; these metrics are not percentages of design fidelity.</p><table><tr><th>Panel</th><th>MAE before</th><th>MAE after</th><th>SSIM before</th><th>SSIM after</th></tr>'''+rows+'</table>'+sections+'''<h2>Remaining differences</h2><p>Generated globe, people and mountain artwork are not identical to the golden image. Text rendering, product proportions and dynamic controls also differ. Customer endorsements and unvalidated accuracy claims were intentionally not copied. The interaction demo loads explicitly labeled example data; this review does not claim a calibrated consumer model or a live simulation backend.</p><h2>Responsive snapshots</h2><p><a href="after-landing-desktop-full.png">Desktop landing</a> · <a href="after-app-desktop-full.png">Desktop dashboard</a> · <a href="after-landing-mobile-full.png">Mobile landing</a> · <a href="after-app-mobile-full.png">Mobile dashboard</a></p></main></html>'''
(OUT/'index.html').write_text(html)
print(json.dumps(metadata,ensure_ascii=False,indent=2))
