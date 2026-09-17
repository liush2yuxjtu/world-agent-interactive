import type { ExperimentProjection } from "@/lib/world/types";
import type { ScenarioName } from "@/components/world/scenario-tabs";

export type WorldNodeTitle = "合格商机" | "销售产能" | "商机覆盖" | "成交概率" | "续费基数" | "Q4 收入";

const nodeDetails: Record<WorldNodeTitle, string> = {
  合格商机: "CRM 演示快照中的合格商机金额。",
  销售产能: "演示组织中的销售席位规模。",
  商机覆盖: "模型根据商机与目标收入推断的覆盖倍数。",
  成交概率: "模型根据演示特征推断的成交概率。",
  续费基数: "演示续费合同的当前基数。",
  "Q4 收入": "由当前业务状态与所选场景共同形成的模型结果。",
};

const baseline = [
  ["已观测", "合格商机", "¥7,240 万", "state-observed"],
  ["已观测", "销售产能", "148 AEs", "state-observed"],
  ["模型推断 · 91%", "商机覆盖", "3.1×", "state-inferred"],
  ["模型推断 · 86%", "成交概率", "27.8%", "state-inferred"],
  ["已观测", "续费基数", "¥1,890 万", "state-observed"],
  ["结果", "Q4 收入", "¥3.46 亿", "state-outcome"],
] as const;

const scenarioOverrides: Record<ScenarioName, Partial<Record<WorldNodeTitle, string>>> = {
  基准: {},
  增长: { 商机覆盖: "3.7×", 成交概率: "30.4%", "Q4 收入": "¥3.83 亿" },
  下行: { 商机覆盖: "2.6×", 成交概率: "24.1%", "Q4 收入": "¥3.08 亿" },
};

export function WorldCanvas({
  projection,
  scenario,
  selectedNode,
  onSelectNode,
}: {
  projection: ExperimentProjection | null;
  scenario: ScenarioName;
  selectedNode: WorldNodeTitle | null;
  onSelectNode: (node: WorldNodeTitle) => void;
}) {
  return <section className="world-panel">
    <header className="world-panel-head"><div><small>BUSINESS WORLD</small><h2>业务因果世界</h2></div><div className="state-legend"><span className="state-observed">已观测</span><span className="state-inferred">模型推断</span><span className="state-simulated">场景模拟</span></div></header>
    <div className="world-canvas">
      <svg viewBox="0 0 900 430" aria-hidden="true" className="world-edges"><path d="M150 110 C260 110 260 100 365 100"/><path d="M150 315 C250 315 270 190 365 190"/><path d="M490 100 C610 100 600 175 735 175"/><path d="M490 190 C610 190 610 175 735 175"/><path d="M490 300 C610 300 620 190 735 190"/></svg>
      {baseline.map(([kind, rawTitle, rawValue, state], index) => {
        const title = rawTitle as WorldNodeTitle;
        const value = scenarioOverrides[scenario][title] ?? rawValue;
        return <article
          aria-label={`${title} ${value}。${nodeDetails[title]}`}
          aria-pressed={selectedNode === title}
          className={`world-node ${state} n${index + 1}${selectedNode === title ? " is-selected" : ""}`}
          key={title}
          onClick={() => onSelectNode(title)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              onSelectNode(title);
            }
          }}
          role="button"
          tabIndex={0}
        ><small>{kind}</small><strong>{title}</strong><b>{value}</b></article>;
      })}
      {projection ? <article className="experiment-overlay state-simulated"><small>真实 Eve 工具输出 · 场景模拟</small><strong>价格实验完成</strong><div className="experiment-choices">{projection.scenarios.slice(0,2).map((s) => <span key={s.id}>¥{s.price}<b>{s.conversion.toFixed(1)}%</b></span>)}</div><p>模型内优胜：¥{projection.winner.price}</p></article> : null}
    </div>
  </section>;
}

export { nodeDetails };
