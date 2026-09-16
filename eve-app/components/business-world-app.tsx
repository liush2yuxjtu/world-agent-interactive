"use client";
import { EveOperatorPanel } from "@/components/eve/eve-operator-panel";
import { AppSidebar } from "@/components/shell/app-sidebar";
import { ProductHeader } from "@/components/shell/product-header";
import { MetricStrip } from "@/components/world/metric-strip";
import { ScenarioTabs } from "@/components/world/scenario-tabs";
import { WorldCanvas } from "@/components/world/world-canvas";
import type { ExperimentProjection } from "@/lib/world/types";
import { useState } from "react";

const routeMeta: Record<string,{title:string;eyebrow:string}> = {
  "/": { title:"商业世界 · 华东企业", eyebrow:"业务总览" },
  "/world": { title:"世界模型", eyebrow:"因果关系与业务状态" },
  "/scenarios": { title:"场景推演", eyebrow:"基准 / 增长 / 下行" },
  "/experiments": { title:"实验", eyebrow:"Eve durable sessions" },
  "/evidence": { title:"证据", eyebrow:"来源、可信度与模型边界" },
  "/history": { title:"历史", eyebrow:"实验与会话记录" },
};
export function BusinessWorldApp({ section = "/" }: { section?: string }) {
  const [projection, setProjection] = useState<ExperimentProjection | null>(null);
  const meta = routeMeta[section] ?? routeMeta["/"];
  return <main className="business-world-app"><AppSidebar active={section}/><section className="workspace"><ProductHeader {...meta}/><div className="workspace-toolbar"><div className="state-key"><span className="state-observed">已观测</span><span className="state-inferred">模型推断</span><span className="state-simulated">场景模拟</span></div><ScenarioTabs/></div><MetricStrip projection={projection}/><WorldCanvas projection={projection}/><section className="analysis-strip"><div><small>当前关注</small><strong>商机覆盖低于目标 0.4×</strong><p>这是演示基准，用于展示世界模型交互；Eve 实验结果只采用实际工具返回值。</p></div><div><small>证据边界</small><strong>模型内结果 · 未校准</strong><p>正式业务决策需要真实销售数据或 A/B 实验校准。</p></div></section></section><EveOperatorPanel onProjectionChange={setProjection}/></main>;
}
