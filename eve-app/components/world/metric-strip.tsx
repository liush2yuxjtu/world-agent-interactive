import type { ExperimentProjection } from "@/lib/world/types";

export function MetricStrip({ projection }: { projection: ExperimentProjection | null }) {
  if (projection) {
    const [a, b] = projection.scenarios;
    return <section className="metric-strip" aria-label="实验结果指标">
      <div><span>方案 A</span><strong>¥{a.price}</strong><small>转化 {a.conversion.toFixed(1)}%</small></div>
      <div><span>方案 B</span><strong>¥{b.price}</strong><small>转化 {b.conversion.toFixed(1)}%</small></div>
      <div><span>模型内优胜</span><strong>¥{projection.winner.price}</strong><small>净贡献 ¥{projection.winner.netContribution.toFixed(0)}</small></div>
      <div><span>模型状态</span><strong>未校准</strong><small>{projection.status || "完成"}</small></div>
    </section>;
  }
  return <section className="metric-strip" aria-label="业务基准指标">
    <div><span>Q4 收入示例</span><strong>¥3.46 亿</strong><small>演示基准</small></div>
    <div><span>商机覆盖</span><strong>3.1×</strong><small>目标 3.5×</small></div>
    <div><span>成交概率</span><strong>27.8%</strong><small>模型推断</small></div>
    <div><span>证据覆盖</span><strong>82%</strong><small>18 个演示来源</small></div>
  </section>;
}
