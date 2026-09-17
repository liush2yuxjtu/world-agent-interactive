import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("Business World scenario controls drive shared world state", () => {
  const app = read("eve-app/components/business-world-app.tsx");
  const tabs = read("eve-app/components/world/scenario-tabs.tsx");
  const metrics = read("eve-app/components/world/metric-strip.tsx");

  assert.match(app, /useState<ScenarioName>/);
  assert.match(app, /ScenarioTabs value=\{scenario\} onChange=\{setScenario\}/);
  assert.match(app, /MetricStrip projection=\{projection\} scenario=\{scenario\}/);
  assert.match(tabs, /aria-pressed=\{value === label\}/);
  assert.match(metrics, /scenarioMetrics\[scenario\]/);
});

test("Business World nodes are selectable and explain themselves", () => {
  const app = read("eve-app/components/business-world-app.tsx");
  const canvas = read("eve-app/components/world/world-canvas.tsx");

  assert.match(app, /selectedNode/);
  assert.match(app, /onSelectNode=\{setSelectedNode\}/);
  assert.match(canvas, /role="button"/);
  assert.match(canvas, /onKeyDown/);
  assert.match(canvas, /nodeDetails/);
});

test("command shortcut focuses the rendered Eve composer", () => {
  const header = read("eve-app/components/shell/product-header.tsx");
  const panel = read("eve-app/components/eve/eve-operator-panel.tsx");

  assert.match(header, /metaKey \|\| event\.ctrlKey/);
  assert.match(header, /key\.toLowerCase\(\) === "k"/);
  assert.match(header, /告诉 Eve 你想推演什么/);
  assert.match(panel, /aria-label="告诉 Eve 你想推演什么"/);
  assert.match(header, /focusEveComposer/);
});

test("mobile navigation keeps every primary route reachable", () => {
  const css = read("eve-app/app/globals.css");

  assert.doesNotMatch(css, /\.nav-items a:nth-child\(n\+4\)\{display:none\}/);
  assert.match(css, /\.nav-items\{display:flex;gap:2px;overflow-x:auto/);
  assert.match(css, /\.nav-items a\{padding:7px;flex:0 0 auto\}/);
});

test("tool output preserves valid falsy results", () => {
  const tool = read("eve-app/components/ai-elements/tool.tsx");

  assert.match(tool, /output === undefined && errorText === undefined/);
  assert.doesNotMatch(tool, /!\(output \|\| errorText\)/);
});
