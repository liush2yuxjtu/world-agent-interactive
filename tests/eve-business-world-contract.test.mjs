import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Chinese Eve Business World product contract is present", () => {
  const shell = read("eve-app/components/business-world-app.tsx");
  const panel = read("eve-app/components/eve/eve-operator-panel.tsx");
  const layout = read("eve-app/app/layout.tsx");
  const css = read("eve-app/app/globals.css");
  const home = read("eve-app/app/page.tsx");
  const assistant = read("eve-app/app/assistant/page.tsx");
  const ci = read(".github/workflows/ci.yml");
  const pkg = JSON.parse(read("eve-app/package.json"));

  assert.match(shell, /商业世界/);
  assert.match(shell, /世界模型/);
  assert.match(shell, /场景推演/);
  assert.match(shell, /实验/);
  assert.match(shell, /证据/);
  assert.match(panel, /模型内结果 · 未校准/);
  assert.match(panel, /useEveAgent/);
  assert.match(panel, /Conversation/);
  assert.match(panel, /Confirmation/);
  assert.match(panel, /Tool/);
  assert.match(panel, /PromptInput/);
  assert.match(panel, /agent\.respond/);
  assert.match(panel, /approval-requested/);
  assert.doesNotMatch(panel, /from ["'].*run_experiment/);
  assert.equal(pkg.dependencies.chat, "4.40.0");
  assert.match(layout, /lang="zh-CN"/);
  assert.match(css, /@media\s*\(max-width:\s*760px\)/);
  assert.match(css, /state-observed/);
  assert.match(css, /state-inferred/);
  assert.match(css, /state-simulated/);
  assert.match(home, /BusinessWorldApp/);
  assert.match(assistant, /redirect\("\/"\)/);
  assert.match(ci, /working-directory:\s*eve-app/);
  assert.match(ci, /npm run typecheck/);
  assert.match(ci, /npm run build/);
});
