import type { ExperimentProjection } from "@/lib/world/types";
export function ExperimentResult({ projection }: { projection: ExperimentProjection }) {
  return <section className="experiment-result"><div><small>模型内结果 · 未校准</small><strong>模型内优胜：¥{projection.winner.price}</strong></div><p>净贡献 ¥{projection.winner.netContribution.toFixed(0)}。这是合成业务模型中的结果，不等于现实市场预测；正式决策需要真实销售数据或 A/B 实验校准。</p></section>;
}
