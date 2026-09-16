import type { ExperimentProjection } from "@/lib/world/types";

const nodes = [
  ["已观测", "合格商机", "¥7,240 万", "state-observed"],
  ["已观测", "销售产能", "148 AEs", "state-observed"],
  ["模型推断 · 91%", "商机覆盖", "3.1×", "state-inferred"],
  ["模型推断 · 86%", "成交概率", "27.8%", "state-inferred"],
  ["已观测", "续费基数", "¥1,890 万", "state-observed"],
  ["结果", "Q4 收入", "¥3.46 亿", "state-outcome"],
];

export function WorldCanvas({ projection }: { projection: ExperimentProjection | null }) {
  return <section className="world-panel">
    <header className="world-panel-head"><div><small>BUSINESS WORLD</small><h2>业务因果世界</h2></div><div className="state-legend"><span className="state-observed">已观测</span><span className="state-inferred">模型推断</span><span className="state-simulated">场景模拟</span></div></header>
    <div className="world-canvas">
      <svg viewBox="0 0 900 430" aria-hidden="true" className="world-edges"><path d="M150 110 C260 110 260 100 365 100"/><path d="M150 315 C250 315 270 190 365 190"/><path d="M490 100 C610 100 600 175 735 175"/><path d="M490 190 C610 190 610 175 735 175"/><path d="M490 300 C610 300 620 190 735 190"/></svg>
      {nodes.map(([kind, title, value, state], index) => <article className={`world-node ${state} n${index+1}`} key={title}><small>{kind}</small><strong>{title}</strong><b>{value}</b></article>)}
      {projection ? <article className="experiment-overlay state-simulated"><small>真实 Eve 工具输出 · 场景模拟</small><strong>价格实验完成</strong><div className="experiment-choices">{projection.scenarios.slice(0,2).map((s) => <span key={s.id}>¥{s.price}<b>{s.conversion.toFixed(1)}%</b></span>)}</div><p>模型内优胜：¥{projection.winner.price}</p></article> : null}
    </div>
  </section>;
}
