import type { ExperimentProjection } from "@/lib/world/types";
import type { ScenarioName } from "@/components/world/scenario-tabs";

const scenarioMetrics: Record<ScenarioName, Array<[string, string, string]>> = {
  基准: [
    ["Q4 收入示例", "¥3.46 亿", "演示基准"],
    ["商机覆盖", "3.1×", "目标 3.5×"],
    ["成交概率", "27.8%", "模型推断"],
    ["证据覆盖", "82%", "18 个演示来源"],
  ],
  增长: [
    ["Q4 收入示例", "¥3.83 亿", "场景模拟 +10.7%"],
    ["商机覆盖", "3.7×", "场景模拟"],
    ["成交概率", "30.4%", "场景模拟"],
    ["证据覆盖", "82%", "18 个演示来源"],
  ],
  下行: [
    ["Q4 收入示例", "¥3.08 亿", "场景模拟 -11.0%"],
    ["商机覆盖", "2.6×", "场景模拟"],
    ["成交概率", "24.1%", "场景模拟"],
    ["证据覆盖", "82%", "18 个演示来源"],
  ],
};

export function MetricStrip({
  projection,
  scenario,
}: {
  projection: ExperimentProjection | null;
  scenario: ScenarioName;
}) {
  if (projection) {
    const [a, b] = projection.scenarios;
    return <section className="metric-strip" aria-label="实验结果指标">
      <div><span>方案 A</span><strong>¥{a.price}</strong><small>转化 {a.conversion.toFixed(1)}%</small></div>
      <div><span>方案 B</span><strong>¥{b.price}</strong><small>转化 {b.conversion.toFixed(1)}%</small></div>
      <div><span>模型内优胜</span><strong>¥{projection.winner.price}</strong><small>净贡献 ¥{projection.winner.netContribution.toFixed(0)}</small></div>
      <div><span>模型状态</span><strong>未校准</strong><small>{projection.status || "完成"}</small></div>
    </section>;
  }

  return (
    <section className="metric-strip" aria-label={`${scenario}场景指标`}>
      {scenarioMetrics[scenario].map(([label, value, detail]) => (
        <div key={label}><span>{label}</span><strong>{value}</strong><small>{detail}</small></div>
      ))}
    </section>
  );
}
