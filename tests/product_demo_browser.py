"""Real-origin QA; only the isolated cancellation test uses a silent worker stub."""
import functools
import json
import os
from pathlib import Path
import threading
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright, expect

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'docs/qa/product-demo'
OUT.mkdir(parents=True, exist_ok=True)
server = None
base = os.environ.get('BASE_URL', '').rstrip('/')
if not base:
    handler = functools.partial(SimpleHTTPRequestHandler, directory=str(ROOT))
    server = ThreadingHTTPServer(('127.0.0.1', 0), handler)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{server.server_port}'
app = base + '/product-demo/'
checks = []

def passed(name):
    checks.append(name)
    print('PASS:', name)

def assert_page(page, view):
    expect(page.locator(f'[data-page="{view}"]')).to_have_count(1)
    for other in {'setup', 'results', 'consumer'} - {view}:
        expect(page.locator(f'[data-page="{other}"]')).to_have_count(0)

try:
    with sync_playwright() as p:
        launch = {'headless': True}
        if os.environ.get('CHROMIUM_EXECUTABLE'):
            launch['executable_path'] = os.environ['CHROMIUM_EXECUTABLE']
        browser = p.chromium.launch(**launch)
        context = browser.new_context(viewport={'width': 1440, 'height': 1000}, accept_downloads=True)
        page = context.new_page()
        errors = []
        page.on('pageerror', lambda error: errors.append(str(error)))
        page.goto(app)
        expect(page.get_by_role('heading', name='实验中心', exact=True)).to_be_visible()
        page.screenshot(path=str(OUT / 'desktop-experiments.png'), full_page=True)
        page.goto(app + '#/setup/1')
        assert_page(page, 'setup')
        page.locator('[data-field="product"]').fill('白桃气泡水 · 验收实验')
        page.reload()
        expect(page.locator('[data-field="product"]')).to_have_value('白桃气泡水 · 验收实验')
        page.screenshot(path=str(OUT / 'desktop-setup.png'), full_page=True)
        passed('draft survives a real browser reload; setup is a separate page')
        for step in [2, 3, 4, 5]:
            page.get_by_role('button', name='保存并继续 →').click()
            expect(page).to_have_url(app + f'#/setup/{step}')
        page.get_by_role('button', name='开始仿真 →').click()
        page.wait_for_url('**/#/results/*')
        assert_page(page, 'results')
        first_url = page.url
        first = page.evaluate('JSON.parse(localStorage.getItem("world-agent-product-demo-v1")).runs[0]')
        assert len(first['results']) == 3
        page.screenshot(path=str(OUT / 'desktop-results.png'), full_page=True)
        passed('five-step setup and real Web Worker calculation create an immutable report')
        page.get_by_role('button', name='转化率', exact=True).click()
        expect(page.locator('[data-metric="conversion"]')).to_have_attribute('aria-pressed', 'true')
        for action, suffix in [('csv', '.csv'), ('html', '.html')]:
            with page.expect_download() as d:
                page.locator(f'[data-action="{action}"]').click()
            download = d.value
            assert download.suggested_filename.endswith(suffix)
            saved = OUT / ('report' + suffix)
            download.save_as(str(saved))
            assert '白桃气泡水' in saved.read_text(encoding='utf-8-sig')
        passed('metric switching and CSV/HTML downloads contain actual report data')
        page.get_by_role('link', name='查看消费者详情 →').click()
        assert_page(page, 'consumer')
        page.screenshot(path=str(OUT / 'desktop-consumer.png'), full_page=True)
        page.reload()
        assert_page(page, 'consumer')
        page.go_back()
        assert_page(page, 'results')
        passed('consumer detail deep-link, reload and browser back work without fused pages')
        page.locator('[data-action="reuse"]').click()
        page.locator('[data-action="confirm"]').click()
        page.goto(app + '#/setup/4')
        page.locator('[data-field="price"][data-scheme="1"]').fill('16')
        page.goto(app + '#/setup/5')
        page.locator('[data-action="run"]').click()
        page.wait_for_url('**/#/results/*')
        second = page.evaluate('JSON.parse(localStorage.getItem("world-agent-product-demo-v1")).runs[0]')
        assert second['results'][1]['units'] < first['results'][1]['units']
        assert second['results'][0] == first['results'][0]
        assert second['results'][2] == first['results'][2]
        page.goto(first_url)
        assert page.evaluate('JSON.parse(localStorage.getItem("world-agent-product-demo-v1")).runs[1]') == first
        passed('changing B price changes B demand, preserves A/C and leaves old report unchanged')
        page.goto(app + '#/experiments')
        page.locator('#search').fill('不存在的实验')
        expect(page.get_by_role('heading', name='没有匹配的实验')).to_be_visible()
        page.locator('#search').fill('')
        page.locator('[data-delete]').first.click()
        page.locator('[data-action="dismiss"]').click()
        assert page.evaluate('JSON.parse(localStorage.getItem("world-agent-product-demo-v1")).runs.length') == 2
        passed('search works and canceling deletion preserves reports')
        page.locator('#import-file').set_input_files({'name':'invalid.json','mimeType':'application/json','buffer':b'{bad'})
        expect(page.locator('dialog')).to_be_visible()
        expect(page.locator('dialog')).to_contain_text('导入失败')
        page.locator('[data-action="dismiss"]').click()
        page.locator('#import-file').set_input_files({'name':'settings.json','mimeType':'application/json','buffer':json.dumps({'config':first['config']}).encode()})
        page.locator('[data-action="confirm"]').click()
        expect(page.locator('[data-field="product"]')).to_have_value(first['config']['product'])
        passed('invalid JSON import is rejected and validated configuration imports work')
        page.goto(app + '#/results/not-on-this-browser')
        expect(page.locator('[data-page="missing"]')).to_be_visible()
        passed('missing report shows an honest local-data empty state')
        # Cancellation uses a deliberately silent Worker to test the cancellation UI contract,
        # not the simulator. All calculation tests above used the real Worker implementation.
        cancel_context = browser.new_context()
        cancel_context.add_init_script('window.Worker=class {postMessage(){} terminate(){window.workerTerminated=true;}}')
        cancel_page = cancel_context.new_page()
        cancel_page.goto(app)
        cancel_page.locator('[data-action="sample"]').click()
        cancel_page.locator('[data-action="cancel-run"]').click()
        assert cancel_page.evaluate('window.workerTerminated') is True
        assert cancel_page.evaluate('localStorage.getItem("world-agent-product-demo-v1")') is None
        passed('cancel terminates worker and does not save a fabricated report (isolated worker stub)')
        cancel_context.close()
        state = context.storage_state()
        for width in [390, 768]:
            mobile = browser.new_context(viewport={'width':width,'height':844},storage_state=state)
            m = mobile.new_page()
            m.on('pageerror',lambda error: errors.append(str(error)))
            for route_name, route_hash in [('setup','#/setup/1'),('results',first_url.split(app)[1]),('consumer',f'#/consumer/{first["id"]}/B/0')]:
                m.goto(app + route_hash)
                assert_page(m,route_name)
                assert m.evaluate('document.documentElement.scrollWidth <= innerWidth'), (width, route_name)
                m.screenshot(path=str(OUT/f'{width}-{route_name}.png'),full_page=True)
            m.locator('#menu').click()
            expect(m.locator('#menu')).to_have_attribute('aria-expanded','true')
            m.locator('[data-nav="experiments"]').click()
            expect(m.locator('#menu')).to_have_attribute('aria-expanded','false')
            mobile.close()
        passed('390px and 768px layouts have no document overflow; mobile navigation works')
        page.goto(base+'/app/#pricing')
        expect(page).to_have_url(app+'#/setup/4')
        page.goto(base+'/')
        expect(page.locator('a[href="product-demo/"]').first).to_be_visible()
        page.goto(base+'/eli5/')
        expect(page.get_by_role('heading',name='三个房间，一次只进一个')).to_be_visible()
        page.screenshot(path=str(OUT/'eli5-zh.png'),full_page=True)
        passed('legacy app route, homepage CTA and Chinese HTML guide are connected')
        assert not errors, errors
        passed('no uncaught browser JavaScript errors')
        browser.close()
    (OUT/'results.json').write_text(json.dumps({'passed':len(checks),'checks':checks,'base_url':base,'calculation':'real browser worker; cancellation-only stub explicitly isolated'},ensure_ascii=False,indent=2))
finally:
    if server:
        server.shutdown()
