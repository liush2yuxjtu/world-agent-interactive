"""Browser acceptance for ui.html.

This is the handoff gate for the Business World Agent single-page UI artifact.
It deliberately clicks through every primary surface and representative secondary
interactions, and fails on uncaught JavaScript or console errors.
"""
import os, shutil, subprocess, time, urllib.request
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

ROOT=Path(__file__).resolve().parents[1]
BASE=os.environ.get("BASE_URL","http://127.0.0.1:4173/")
URL=BASE.rstrip("/")+"/ui.html"
server=None

def wait_server(url):
    for _ in range(60):
        try:
            urllib.request.urlopen(url, timeout=1)
            return
        except Exception:
            time.sleep(.1)
    raise RuntimeError(f"server did not become ready: {url}")

if not os.environ.get("BASE_URL"):
    server=subprocess.Popen(["node","scripts/dev.mjs"],cwd=ROOT,stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL)
    wait_server(URL)

try:
    with sync_playwright() as p:
        browser=p.chromium.launch(
            executable_path=os.environ.get("CHROMIUM_PATH") or shutil.which("chromium") or None,
            args=["--no-sandbox"],
        )
        context=browser.new_context(viewport={"width":1440,"height":1000},accept_downloads=True)
        page=context.new_page()
        page.set_default_timeout(5000)
        errors=[]
        page.on("pageerror",lambda e: errors.append("pageerror: "+str(e)))
        page.on("console",lambda m: errors.append("console: "+m.text) if m.type=="error" else None)

        page.goto(URL,wait_until="domcontentloaded")
        expect(page.locator("#landing")).to_be_visible()
        expect(page.locator("#app")).to_have_class(lambda c:"hidden" in c)
        assert page.evaluate("location.hash")=="" 
        print("PASS landing starts clean without an app hash",flush=True)

        page.locator("#appMode").click()
        expect(page.locator("#app")).to_be_visible()
        assert page.evaluate("location.hash")=="#world"
        print("PASS App mode establishes World Builder route",flush=True)

        routes=[
            ("overview","经营总览"),
            ("persona","Persona Studio"),
            ("world","商业世界模型"),
            ("content","内容策略工作台"),
            ("live","直播漏斗"),
            ("growth","投放优化中心"),
            ("product","商品组合表现"),
            ("experiment","模拟实验"),
            ("report","报告中心"),
        ]
        for route,marker in routes:
            page.locator(f'.navbtn[data-view="{route}"]').click()
            assert page.evaluate("location.hash")==f"#{route}"
            expect(page.locator(f"#view-{route}")).to_have_class(lambda c:"active" in c)
            expect(page.locator(f'.navbtn[data-view="{route}"]')).to_have_class(lambda c:"active" in c)
            expect(page.locator(f"#view-{route}")).to_contain_text(marker)
        print("PASS all 9 primary routes click through with matching active state",flush=True)

        # Overview: cross-surface channel card
        page.locator('.navbtn[data-view="overview"]').click()
        page.locator('[data-jump="content"]').first.click()
        assert page.evaluate("location.hash")=="#content"
        expect(page.locator("#view-content")).to_be_visible()
        print("PASS Overview channel card deep-links to Content",flush=True)

        # Persona: card detail + segmented toggle
        page.locator('.navbtn[data-view="persona"]').click()
        page.locator(".persona-card").first.click()
        expect(page.locator("#detailModal")).to_be_visible()
        expect(page.locator("#detailTitle")).to_contain_text("新手妈妈")
        page.locator("#closeDetail").click()
        persona_tabs=page.locator("#view-persona .seg button")
        persona_tabs.nth(1).click()
        expect(persona_tabs.nth(1)).to_have_class(lambda c:"active" in c)
        print("PASS Persona card and mode tabs are interactive",flush=True)

        # World Builder: scenario + entity inspector
        page.locator('.navbtn[data-view="world"]').click()
        baseline=page.locator("#graphGmv").inner_text()
        page.locator('#scenarioSeg button[data-scenario="growth"]').click()
        assert page.locator("#graphGmv").inner_text()!=baseline
        page.locator('.node[data-entity="ads"]').click()
        expect(page.locator("#inspector")).to_contain_text("广告效率")
        print("PASS World Builder scenario and node inspector work",flush=True)

        # Content: bubble opens detail; CTA opens prototype action
        page.locator('.navbtn[data-view="content"]').click()
        page.locator(".bubble").first.click()
        expect(page.locator("#detailModal")).to_be_visible()
        expect(page.locator("#detailEyebrow")).to_have_text("CONTENT OPPORTUNITY")
        page.locator("#closeDetail").click()
        page.get_by_role("button",name="生成 brief",exact=True).click()
        expect(page.locator("#detailModal")).to_be_visible()
        page.locator("#closeDetail").click()
        print("PASS Content opportunity and Brief actions click through",flush=True)

        # Live: external-style action must stop at approval
        page.locator('.navbtn[data-view="live"]').click()
        page.get_by_role("button",name="去执行",exact=True).first.click()
        expect(page.locator("#detailModal")).to_be_visible()
        expect(page.locator("#detailEyebrow")).to_have_text("HUMAN APPROVAL")
        expect(page.locator("#detailBody")).to_contain_text("需要人工确认")
        page.locator("#closeDetail").click()
        print("PASS Live action enforces human approval boundary",flush=True)

        # Growth: tabs and row detail
        page.locator('.navbtn[data-view="growth"]').click()
        growth_tabs=page.locator("#view-growth .seg button")
        growth_tabs.nth(1).click()
        expect(growth_tabs.nth(1)).to_have_class(lambda c:"active" in c)
        page.locator("#view-growth .deep-table tbody tr").first.click()
        expect(page.locator("#detailModal")).to_be_visible()
        expect(page.locator("#detailTitle")).to_have_text("记录详情")
        page.locator("#closeDetail").click()
        print("PASS Growth tabs and campaign rows click through",flush=True)

        # Product: audience cross-link
        page.locator('.navbtn[data-view="product"]').click()
        page.locator('#view-product [data-jump="persona"]').first.click()
        assert page.evaluate("location.hash")=="#persona"
        print("PASS Product audience cross-links to Persona",flush=True)

        # Experiment: run modeled result, then route to Report
        page.locator('.navbtn[data-view="experiment"]').click()
        page.locator("#expChange").fill("10")
        page.locator("#expRun").click()
        expect(page.locator("#expResult")).to_contain_text("模拟完成")
        page.locator('#view-experiment [data-jump="report"]').click()
        assert page.evaluate("location.hash")=="#report"
        print("PASS Experiment runs and routes modeled result to Report",flush=True)

        # Report: create action + real download
        page.locator('[data-demo="newreport"]').click()
        expect(page.locator("#detailModal")).to_be_visible()
        page.locator("#closeDetail").click()
        with page.expect_download() as dl:
            page.locator("#downloadReport").click()
        assert dl.value.suggested_filename=="business-world-report.txt"
        print("PASS Report create action and download work",flush=True)

        # Search navigation
        search=page.locator("#searchInput")
        search.fill("投放")
        expect(page.locator("#searchResults")).to_be_visible()
        page.locator('#searchResults [data-go="growth"]').click()
        assert page.evaluate("location.hash")=="#growth"
        print("PASS global search navigates to a matching surface",flush=True)

        # Source modal and refresh
        page.locator("#sourceBtn").click()
        expect(page.locator("#sourceModal")).to_be_visible()
        page.locator("#cancelSource").click()
        expect(page.locator("#sourceModal")).to_have_class(lambda c:"hidden" in c)
        page.locator("#refreshBtn").click()
        expect(page.locator("#toast")).to_contain_text("已刷新")
        print("PASS source modal and refresh feedback work",flush=True)

        # Keyboard shortcut / Escape
        page.keyboard.press("Control+K")
        expect(search).to_be_focused()
        page.locator(".metric").first.click()
        expect(page.locator("#detailModal")).to_be_visible()
        page.keyboard.press("Escape")
        expect(page.locator("#detailModal")).to_have_class(lambda c:"hidden" in c)
        print("PASS keyboard search and Escape close overlays",flush=True)

        # Basic overflow check after dense routes
        assert page.evaluate("document.documentElement.scrollWidth")<=1440
        assert errors==[],errors
        print("PASS no uncaught browser errors across the full UI workflow",flush=True)
        browser.close()
finally:
    if server:
        server.terminate()
        server.wait(timeout=5)
