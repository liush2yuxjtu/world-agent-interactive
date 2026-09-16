import test from "node:test";
import assert from "node:assert/strict";
import { projectRunOutput } from "../eve-app/lib/world/projection.ts";

test("projects real Eve run output into typed business state", () => {
  const projected = projectRunOutput({
    runId: "run_1",
    status: "complete",
    calibrated: false,
    scenarios: [
      { id: "a", price: 6, conversion: 31.2, units: 100, repeatRate: 20, socialReach: 1000, revenue: 600, netContribution: 210 },
      { id: "b", price: 8, conversion: 25.4, units: 90, repeatRate: 18, socialReach: 900, revenue: 720, netContribution: 260 },
    ],
    winner: { id: "b", price: 8, conversion: 25.4, units: 90, repeatRate: 18, socialReach: 900, revenue: 720, netContribution: 260 },
  });
  assert.ok(projected);
  assert.equal(projected.runId, "run_1");
  assert.equal(projected.scenarios.length, 2);
  assert.equal(projected.winner.price, 8);
  assert.equal(projected.scenarios[0].conversion, 31.2);
  assert.equal(projected.calibrated, false);
});

test("rejects malformed run output", () => {
  assert.equal(projectRunOutput({ scenarios: [] }), null);
  assert.equal(projectRunOutput(null), null);
});
