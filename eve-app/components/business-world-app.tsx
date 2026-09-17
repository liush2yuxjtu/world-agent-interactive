"use client";

import { EveOperatorPanel } from "@/components/eve/eve-operator-panel";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { ProductHeader } from "@/components/shell/product-header";
import { MetricStrip } from "@/components/world/metric-strip";
import { ScenarioTabs, type ScenarioName } from "@/components/world/scenario-tabs";
import { WorldCanvas, nodeDetails, type WorldNodeTitle } from "@/components/world/world-canvas";
import type { ExperimentProjection } from "@/lib/world/types";
import { useState } from "react";

const routeMeta: Record<string, { title: string; eyebrow: string }> = {
  "/": { title: "商业世界 · 华东企业", eyebrow: "业务总览" },
  "/world": { title: "世界模型", eyebrow: "因果关系与业务状态" },
  "/scenarios": { title: "场景推演", eyebrow: "基准 / 增长 / 下行" },
  "/experiments": { title: "实验", eyebrow: "Eve durable sessions" },
  "/evidence": { title: "证据", eyebrow: "来源、可信度与模型边界" },
  "/history": { title: "历史", eyebrow: "实验与会话记录" },
};

const scenarioDescriptions: Record<ScenarioName, string> = {
  基准: "当前演示基准，不改变业务假设。",
  增长: "模拟商机覆盖和成交概率改善后的增长场景。",
  下行: "模拟商机覆盖和成交概率走弱后的下行情景。",
};

export function BusinessWorldApp({ section = "/" }: { section?: string }) {
  const [projection, setProjection] = useState<ExperimentProjection | null>(null);
  const [scenario, setScenario] = useState<ScenarioName>("基准");
  const [selectedNode, setSelectedNode] = useState<WorldNodeTitle | null>("商机覆盖");
  const meta = routeMeta[section] ?? routeMeta["/"];

  return (
    <main className="business-world-app">
      <AppSidebar active={section} />
      <section className="workspace">
        <ProductHeader {...meta} />
        <div className="workspace-toolbar">
          <div className="state-key">
            <span className="state-observed">已观测</span>
            <span className="state-inferred">模型推断</span>
            <span className="state-simulated">场景模拟</span>
          </div>
          <ScenarioTabs value={scenario} onChange={setScenario} />
        </div>
        <MetricStrip projection={projection} scenario={scenario} />
        <WorldCanvas
          onSelectNode={setSelectedNode}
          projection={projection}
          scenario={scenario}
          selectedNode={selectedNode}
        />
        <section className="analysis-strip" aria-live="polite">
          <div>
            <small>{selectedNode ? "已选择世界节点" : "当前场景"}</small>
            <strong>{selectedNode ?? `${scenario}场景`}</strong>
            <p>{selectedNode ? nodeDetails[selectedNode] : scenarioDescriptions[scenario]}</p>
          </div>
          <div>
            <small>当前场景</small>
            <strong>{scenario} · {projection ? "Eve 实验结果已覆盖场景指标" : "演示模拟"}</strong>
            <p>{projection ? "上方指标优先显示真实 Eve 工具返回值。" : scenarioDescriptions[scenario]}</p>
          </div>
          <div>
            <small>证据边界</small>
            <strong>模型内结果 · 未校准</strong>
            <p>正式业务决策需要真实销售数据或 A/B 实验校准。</p>
          </div>
        </section>
      </section>
      <EveOperatorPanel onProjectionChange={setProjection} />
    </main>
  );
}
