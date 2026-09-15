"""Visual + interaction acceptance for the Eve chat feature intent.

The committed intent HTML is the visual source of truth. The product route must
render the same initial, approved, and mobile states. This test stores both
snapshots plus a pixel diff in docs/qa/.
"""
import json, os, shutil, subprocess, time, urllib.request
from pathlib import Path
from PIL import Image, ImageChops
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'docs/qa'; QA.mkdir(parents=True,exist_ok=True)
base=os.environ.get('BASE_URL','http://127.0.0.1:4173/design-system/')
SITE=base.replace('/design-system/','/').rstrip('/')+'/'
INTENT=SITE+'intent/eve-price-experiment-chat/'
FEATURE=SITE+'assistant/'
server=None

def wait(url):
    for _ in range(60):
        try:
            urllib.request.urlopen(url,timeout=1); return
        except Exception: time.sleep(.1)
    raise RuntimeError(f'server did not become ready: {url}')

def diff_png(a,b,out):
    ia,ib=Image.open(a).convert('RGBA'),Image.open(b).convert('RGBA')
    assert ia.size==ib.size,(ia.size,ib.size)
    diff=ImageChops.difference(ia,ib)
    diff.save(out)
    bbox=diff.getbbox()
    if bbox is None: return 0,0.0
    pixels=diff.getdata(); changed=sum(1 for px in pixels if px != (0,0,0,0))
    return changed,changed/(ia.size[0]*ia.size[1])

if not os.environ.get('BASE_URL'):
    server=subprocess.Popen(['node','scripts/dev.mjs'],cwd=ROOT,stdout=subprocess.DEVNULL)
    wait(INTENT)

report={'status':'failed','source':'intent/eve-price-experiment-chat/index.html','feature':'assistant/index.html','checks':[]}
def passed(name): report['checks'].append({'name':name,'status':'passed'}); print('PASS',name,flush=True)

try:
  with sync_playwright() as p:
    browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
    context=browser.new_context(viewport={'width':1440,'height':1050},device_scale_factor=1,reduced_motion='reduce')
    page=context.new_page(); page.set_default_timeout(6000)
    errors=[]; page.on('pageerror',lambda error:errors.append(str(error)))

    page.goto(INTENT,wait_until='domcontentloaded')
    expect(page.get_by_role('heading',name='聊天，就像在“委托一个实验”')).to_be_visible()
    expect(page.get_by_role('button',name='批准并运行')).to_be_visible()
    assert page.evaluate('document.documentElement.scrollWidth')<=1440
    intent_initial=QA/'12-eve-intent-desktop.png'; page.screenshot(path=str(intent_initial),full_page=True)

    page.goto(FEATURE,wait_until='domcontentloaded')
    expect(page.get_by_role('heading',name='聊天，就像在“委托一个实验”')).to_be_visible()
    feature_initial=QA/'13-eve-feature-desktop.png'; page.screenshot(path=str(feature_initial),full_page=True)
    changed,ratio=diff_png(intent_initial,feature_initial,QA/'13-eve-feature-desktop-diff.png')
    assert changed==0,f'initial visual diff: {changed} pixels ({ratio:.6%})'
    passed('Desktop feature is pixel-identical to committed intent')

    page.get_by_role('button',name='批准并运行').click()
    expect(page.locator('#tooltrace')).to_have_text('run_experiment')
    page.wait_for_timeout(1000); expect(page.locator('#tooltrace')).to_have_text('get_run')
    page.wait_for_timeout(1000); expect(page.locator('#tooltrace')).to_have_text('check_reliability')
    page.wait_for_timeout(1000); expect(page.locator('#tooltrace')).to_have_text('实验完成')
    expect(page.locator('#results')).to_contain_text('现实销量仍需真实数据校准')
    feature_approved=QA/'14-eve-feature-approved.png'; page.screenshot(path=str(feature_approved),full_page=True)
    passed('Approval gates run_experiment → get_run → check_reliability and ends with calibration warning')

    page.goto(INTENT,wait_until='domcontentloaded'); page.get_by_role('button',name='批准并运行').click(); page.wait_for_timeout(3100)
    intent_approved=QA/'14-eve-intent-approved.png'; page.screenshot(path=str(intent_approved),full_page=True)
    changed,ratio=diff_png(intent_approved,feature_approved,QA/'14-eve-approved-diff.png')
    assert changed==0,f'approved visual diff: {changed} pixels ({ratio:.6%})'
    passed('Approved feature state is pixel-identical to committed intent')

    page.set_viewport_size({'width':390,'height':844})
    page.goto(INTENT,wait_until='domcontentloaded'); mobile_intent=QA/'15-eve-intent-mobile.png'; page.screenshot(path=str(mobile_intent),full_page=True)
    page.goto(FEATURE,wait_until='domcontentloaded'); mobile_feature=QA/'15-eve-feature-mobile.png'; page.screenshot(path=str(mobile_feature),full_page=True)
    assert page.evaluate('document.documentElement.scrollWidth')<=390
    changed,ratio=diff_png(mobile_intent,mobile_feature,QA/'15-eve-mobile-diff.png')
    assert changed==0,f'mobile visual diff: {changed} pixels ({ratio:.6%})'
    passed('390px mobile feature has no overflow and is pixel-identical to intent')

    page.get_by_role('button',name='为什么要先审批？').click()
    expect(page.locator('#messages')).to_contain_text('真正运行实验属于“行动”')
    page.get_by_role('button',name='这等于真实市场预测吗？').click()
    expect(page.locator('#messages')).to_contain_text('现实预测要用真实数据验证')
    passed('Follow-up explanations preserve approval and calibration boundaries')

    assert errors==[],errors
    passed('No uncaught JavaScript errors in Eve feature workflow')
    browser.close()

  report['status']='passed'; report['visual_diff_pixels']=0; report['visual_diff_ratio']=0
  (QA/'eve-chat-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf8')
  print(f"\n{len(report['checks'])} Eve feature checks passed.",flush=True)
finally:
  if server:
    server.terminate(); server.wait(timeout=5)
