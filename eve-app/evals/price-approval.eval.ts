import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";

export default defineEval({
  description: "Price comparison must plan first, park at native Eve approval, then run, read, reliability-check, and disclose calibration limits.",
  timeoutMs: 120_000,
  async test(t) {
    const parked = await t.send("白桃气泡水，¥6 还是 ¥8 更好？请帮我先在 Business World Model 里比较。");
    parked.calledTool("plan_experiment", { status: "completed", count: 1 });
    parked.calledTool("run_experiment", { status: "pending", count: 1 });
    t.requireInputRequest({ toolName: "run_experiment" });

    const approved = await t.respondAll("approve");
    approved.expectOk();
    approved.calledTool("run_experiment", { status: "completed", count: 1 });
    approved.calledTool("get_run", { status: "completed", count: 1 });
    approved.calledTool("check_reliability", { status: "completed", count: 1 });
    approved.succeeded();
    t.check(t.reply, includes("真实"));
    t.check(t.reply, includes("校准"));
  },
});
