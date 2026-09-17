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

test("command shortcut focuses the real Eve composer", () => {
  const header = read("eve-app/components/shell/product-header.tsx");

  assert.match(header, /metaKey \|\| event\.ctrlKey/);
  assert.match(header, /key\.toLowerCase\(\) === "k"/);
  assert.match(header, /告诉 Eve 你想测试什么/);
  assert.match(header, /focusEveComposer/);
});
