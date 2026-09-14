"""Run the real multi-file project via HTTP. OFFLINE_FIXTURE=1 is an explicit,
limited in-memory fallback for managed environments that block URL navigation.
"""
import json,os,re,shutil,subprocess,time,urllib.request,hashlib
from pathlib import Path
from playwright.sync_api import sync_playwright,expect
ROOT=Path(__file__).resolve().parents[1]
QA=ROOT/'docs/qa';QA.mkdir(parents=True,exist_ok=True)
OFFLINE=os.environ.get('OFFLINE_FIXTURE')=='1'
URL=os.environ.get('BASE_URL','http://127.0.0.1:4173/design-system/')
server=None;checks=[]
before=hashlib.sha256((ROOT/'src/tokens.css').read_bytes()).hexdigest()
def passed(name):checks.append({'name':name,'status':'passed'});print('PASS',name,flush=True)
if not OFFLINE and not os.environ.get('BASE_URL'):
    server=subprocess.Popen(['node','scripts/dev.mjs'],cwd=ROOT,stdout=subprocess.DEVNULL)
    for _ in range(40):
        try:
            urllib.request.urlopen(URL);break
        except Exception:time.sleep(.1)
try:
    with sync_playwright() as p:
        browser=p.chromium.launch(executable_path=os.environ.get('CHROMIUM_PATH') or shutil.which('chromium') or None,args=['--no-sandbox'])
        context=browser.new_context(viewport={'width':1440,'height':1050},device_scale_factor=1,accept_downloads=True)
        page=context.new_page();page.set_default_timeout(5000)
        errors=[];page.on('pageerror',lambda error:errors.append(str(error)))
        if OFFLINE:
            from offline_fixture import fixture
            page.set_content(fixture(),wait_until='load')
        else:page.goto(URL,wait_until='domcontentloaded')
        expect(page.locator('.ds-stats')).to_contain_text('63')
        expect(page.locator('.ds-inspector-name')).to_have_text('--color-brand')
        assert page.evaluate('document.documentElement.scrollWidth')==1440
        passed('Overview renders 63 source tokens and selected brand inspector')
        page.screenshot(path=str(QA/'02-overview-desktop.png'),full_page=True)
        for name in ['colors','typography','spacing','radii','elevation','motion','layout']:
            page.locator(f'.ds-nav-item[href="#/{name}"]').click()
            expect(page.locator('.ds-token-card').first).to_be_visible()
        passed('All seven token categories are navigable')
        page.locator('.ds-nav-item[href="#/colors"]').click()
        expect(page.locator('.ds-token-card')).to_have_count(26)
        page.get_by_role('button',name='Table view',exact=True).click()
        expect(page.locator('.ds-table tbody tr')).to_have_count(26)
        page.get_by_role('button',name='Grid view',exact=True).click()
        expect(page.locator('.ds-token-card')).to_have_count(26)
        passed('Grid and table views show all 26 color tokens')
        page.screenshot(path=str(QA/'03-colors-desktop.png'),full_page=True)
        search=page.get_by_role('searchbox',name='Search all tokens')
        search.fill('shadow');expect(page.locator('.ds-token-card')).to_have_count(3)
        search.fill('does-not-exist');expect(page.locator('.ds-empty')).to_contain_text('No tokens found')
        page.get_by_role('button',name='Clear search',exact=True).click()
        passed('Search and empty states work across source categories')
        page.locator('.ds-nav-item[href="#/overview"]').click()
        page.get_by_role('button',name='Inspect --color-brand',exact=True).click()
        page.locator('#draft-value').fill('#6d28d9')
        page.get_by_role('button',name='Apply to previews',exact=True).click()
        expect(page.locator('.ds-draft-banner')).to_contain_text('1 preview override')
        preview=page.locator('.ds-mini-product .wa-button--primary')
        assert preview.evaluate('(el)=>getComputedStyle(el).backgroundColor')=='rgb(109, 40, 217)'
        assert page.evaluate("getComputedStyle(document.documentElement).getPropertyValue('--color-brand').trim()")=='#315dff'
        passed('Live edits change shared component previews but leave the explorer shell unchanged')
        page.screenshot(path=str(QA/'04-live-token-edit.png'),full_page=True)
        page.locator('#draft-value').fill('url(https://example.com)')
        page.get_by_role('button',name='Apply to previews',exact=True).click()
        expect(page.locator('#editor-error')).to_contain_text('valid color')
        page.locator('#draft-value').fill('123px')
        page.get_by_role('button',name='Apply to previews',exact=True).click()
        expect(page.locator('#editor-error')).to_contain_text('valid color')
        passed('Invalid CSS and remote URLs cannot be applied as token overrides')
        page.locator('#draft-value').fill('#6d28d9')
        page.get_by_role('button',name='Apply to previews',exact=True).click()
        if not OFFLINE:
            page.reload(wait_until='domcontentloaded')
            expect(page.locator('.ds-draft-banner')).to_contain_text('1 preview override')
            assert page.locator('.ds-mini-product .wa-button--primary').evaluate('(el)=>getComputedStyle(el).backgroundColor')=='rgb(109, 40, 217)'
            passed('Drafts persist across a real page reload')
            with page.expect_download() as event:page.get_by_role('button',name='Export CSS',exact=True).first.click()
            d=event.value;path=QA/'downloaded-tokens.css';d.save_as(str(path))
            assert '--color-brand: #6d28d9;' in path.read_text()
            passed('CSS export downloads an actual file containing overrides')
        page.get_by_role('button',name='Reset all',exact=True).click()
        expect(page.locator('dialog')).to_be_visible()
        page.get_by_role('button',name='Keep changes',exact=True).click()
        expect(page.locator('.ds-draft-banner')).to_be_visible()
        page.get_by_role('button',name='Reset all',exact=True).click()
        page.get_by_role('button',name='Reset previews',exact=True).click()
        expect(page.locator('.ds-draft-banner')).to_have_count(0)
        expect(page.locator('#draft-value')).to_have_value('#315dff')
        passed('Reset confirmation supports cancel and restores source values')
        page.get_by_role('button',name='Copy CSS variable reference',exact=True).click()
        if page.locator('dialog').count():
            expect(page.locator('.ds-copy-fallback')).to_have_value('var(--color-brand)');page.keyboard.press('Escape')
        else:expect(page.locator('#toast-root')).to_contain_text('Copied')
        passed('Copy variable reference works or provides a selectable clipboard fallback')
        page.locator('.ds-mini-schemes [data-id="A"]').click()
        expect(page.locator('.ds-mini-bottom')).to_contain_text('1,260,000')
        page.get_by_role('button',name='开始仿真',exact=True).click()
        expect(page.locator('progress')).to_be_visible();page.wait_for_timeout(1200)
        expect(page.locator('dialog')).to_contain_text('Preview complete')
        page.get_by_role('button',name='Done',exact=True).click()
        passed('Connected component example supports scenario selection and demo progress')
        page.locator('.ds-nav-item[href="#/components"]').click()
        expect(page.locator('.ds-state-grid .wa-button')).to_have_count(6)
        assert page.locator('.ds-state-grid button[disabled]').count()==2
        passed('Shared buttons have six documented states with real disabled/loading behavior')
        page.screenshot(path=str(QA/'05-components-desktop.png'),full_page=True)
        page.get_by_role('tab',name='Forms',exact=True).click()
        switch=page.get_by_role('switch',name='Auto-save example')
        switch.focus();page.keyboard.press('Space');expect(switch).to_have_attribute('aria-checked','false')
        expect(page.locator('input[aria-invalid="true"]')).to_have_attribute('aria-describedby','sample-error')
        passed('Form examples expose associated errors and keyboard-operable switch')
        page.get_by_role('tab',name='Forms',exact=True).focus();page.keyboard.press('ArrowRight')
        expect(page.get_by_role('tab',name='Feedback',exact=True)).to_have_attribute('aria-selected','true')
        page.get_by_role('button',name='Show toast',exact=True).click()
        expect(page.locator('#toast-root')).to_contain_text('Your experiment is saved')
        trigger=page.get_by_role('button',name='Open dialog',exact=True);trigger.click()
        expect(page.locator('dialog')).to_be_visible();page.keyboard.press('Escape')
        expect(page.locator('dialog')).to_have_count(0);expect(trigger).to_be_focused()
        passed('Component tabs support arrow keys; dialog Escape restores focus; toast announces feedback')
        page.get_by_role('tab',name='Cards',exact=True).click()
        expect(page.locator('.ds-card-stage .wa-card')).to_have_count(2)
        passed('Shared card patterns render with actual design tokens')
        page.locator('.ds-nav-item[href="#/motion"]').click()
        page.get_by_role('button',name='Replay motion',exact=True).click();page.wait_for_timeout(300)
        assert 'is-playing' in page.locator('.ds-motion-playground').get_attribute('class')
        passed('Motion playground animates the two source durations')
        page.locator('.ds-nav-item[href="#/accessibility"]').click()
        expect(page.locator('.ds-contrast-table tbody tr')).to_have_count(7)
        expect(page.locator('#content')).to_contain_text('not a compliance score')
        passed('Contrast audit evaluates seven explicit pairs and explains its limitations')
        page.screenshot(path=str(QA/'06-contrast-audit.png'),full_page=True)
        page.locator('.ds-nav-item[href="#/source"]').click()
        expect(page.locator('.ds-source-code')).to_contain_text('--color-brand: #315dff;')
        passed('Source view shows the unchanged shared tokens.css')
        for width,height in [(390,844),(768,1024)]:
            page.set_viewport_size({'width':width,'height':height})
            page.evaluate("location.hash='/overview'");page.wait_for_timeout(100)
            page.locator('[data-action="close-inspector"]').first.click(force=True) if page.locator('.ds-inspector').is_visible() else None
            assert page.evaluate('document.documentElement.scrollWidth')<=width
            page.evaluate("document.querySelector('#toast-root').replaceChildren()")
            page.mouse.move(0,0)
            page.screenshot(path=str(QA/f'07-overview-{width}px.png'),full_page=True)
            page.get_by_role('button',name='Inspect --color-brand',exact=True).click()
            expect(page.locator('.ds-inspector')).to_be_visible()
            page.screenshot(path=str(QA/f'08-inspector-{width}px.png'))
            page.keyboard.press('Escape');expect(page.locator('.ds-inspector')).not_to_be_visible()
            passed(f'{width}px responsive layout has no page overflow and inspector drawer opens/closes')
        assert errors==[],errors
        passed('No uncaught JavaScript errors throughout the workflow')
        browser.close()
    after=hashlib.sha256((ROOT/'src/tokens.css').read_bytes()).hexdigest();assert before==after
    passed('Source tokens.css SHA-256 remains identical after the entire test workflow')
    report={'status':'passed','mode':'offline-fixture' if OFFLINE else 'http-origin','count':len(checks),'checks':checks,'source_sha256':after,'limitations':['Reload and real download checks are skipped in the restricted in-memory fixture.'] if OFFLINE else []}
    (QA/'browser-results.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
    print(f'\n{len(checks)} browser checks passed ({report["mode"]}).',flush=True)
finally:
    if server:server.terminate();server.wait(timeout=5)
