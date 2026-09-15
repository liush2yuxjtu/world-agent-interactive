import { defineEval } from "eve/evals";

export default defineEval({
  description: "Denying the experiment approval must prevent run_experiment from completing.",
  timeoutMs: 120_000,
  async test(t) {
    const parked = await t.send("比较白桃气泡水 ¥6 和 ¥8；先设计实验再运行。");
    parked.calledTool("plan_experiment", { status: "completed", count: 1 });
    parked.calledTool("run_experiment", { status: "pending", count: 1 });
    t.requireInputRequest({ toolName: "run_experiment" });
    const denied = await t.respondAll("deny");
    denied.expectOk();
    denied.calledTool("run_experiment", { status: "completed", count: 0 });
  },
});
