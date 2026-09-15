"use client";

import { MessageResponse } from "@/components/ai-elements/message";
import { useEveAgent, type EveMessagePart } from "eve/react";
import { FormEvent, useMemo, useState } from "react";

type Scenario = {
  id: string;
  price: number;
  conversion: number;
  units: number;
  repeatRate: number;
  socialReach: number;
  revenue: number;
  netContribution: number;
};

type RunOutput = {
  runId: string;
  status: string;
  calibrated: false;
  scenarios: Scenario[];
  winner: Scenario;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseRunOutput(value: unknown): RunOutput | null {
  if (!isRecord(value) || !Array.isArray(value.scenarios) || !isRecord(value.winner)) return null;
  const scenarios = value.scenarios.filter(isRecord).map((item) => ({
    id: String(item.id ?? ""),
    price: Number(item.price ?? 0),
    conversion: Number(item.conversion ?? 0),
    units: Number(item.units ?? 0),
    repeatRate: Number(item.repeatRate ?? 0),
    socialReach: Number(item.socialReach ?? 0),
    revenue: Number(item.revenue ?? 0),
    netContribution: Number(item.netContribution ?? 0),
  }));
  const winner = value.winner;
  if (scenarios.length < 2) return null;
  return {
    runId: String(value.runId ?? ""),
    status: String(value.status ?? ""),
    calibrated: false,
    scenarios,
    winner: {
      id: String(winner.id ?? ""),
      price: Number(winner.price ?? 0),
      conversion: Number(winner.conversion ?? 0),
      units: Number(winner.units ?? 0),
      repeatRate: Number(winner.repeatRate ?? 0),
      socialReach: Number(winner.socialReach ?? 0),
      revenue: Number(winner.revenue ?? 0),
      netContribution: Number(winner.netContribution ?? 0),
    },
  };
}

function toolName(part: EveMessagePart) {
  return part.type === "dynamic-tool" ? part.toolName : "";
}

function toolLabel(name: string) {
  const labels: Record<string, string> = {
    plan_experiment: "设计实验",
    run_experiment: "运行实验",
    get_run: "读取结果",
    check_reliability: "检查可信度",
  };
  return labels[name] ?? name;
}

function toolStatusLabel(state: string) {
  const labels: Record<string, string> = {
    "approval-requested": "等待批准",
    "approval-responded": "已响应",
    "input-streaming": "准备中",
    "input-available": "运行中",
    "output-available": "完成",
    "output-denied": "已拒绝",
    "output-error": "错误",
  };
  return labels[state] ?? state;
}

export function EveChat() {
  const [draft, setDraft] = useState("白桃气泡水，¥6 还是 ¥8 更好？");
  const agent = useEveAgent({
    onError(error) {
      console.error("Eve error", error);
    },
  });

  const parts = useMemo(
    () => agent.data.messages.flatMap((message) => message.parts),
    [agent.data.messages],
  );

  const dynamicTools = parts.filter(
    (part): part is Extract<EveMessagePart, { type: "dynamic-tool" }> => part.type === "dynamic-tool",
  );

  const pendingPart = dynamicTools.find((part) => part.state === "approval-requested");
  const pendingRequest = pendingPart?.toolMetadata?.eve?.inputRequest;
  const runPart = dynamicTools.find(
    (part) => part.toolName === "run_experiment" && part.state === "output-available",
  );
  const getRunPart = dynamicTools.find(
    (part) => part.toolName === "get_run" && part.state === "output-available",
  );
  const reliabilityPart = dynamicTools.find(
    (part) => part.toolName === "check_reliability" && part.state === "output-available",
  );
  const results = parseRunOutput(getRunPart?.output ?? runPart?.output);

  const hasPlan = dynamicTools.some(
    (part) => part.toolName === "plan_experiment" && part.state === "output-available",
  );
  const runCompleted = Boolean(runPart);
  const reliabilityCompleted = Boolean(reliabilityPart);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  const stepState = [
    true,
    hasPlan,
    Boolean(pendingRequest) || runCompleted,
    runCompleted,
    reliabilityCompleted,
  ];

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = draft.trim();
    if (!message || isResuming) return;
    setDraft("");
    await agent.send(message, isBusy ? { turnPolicy: "steer" } : undefined);
  };

  const sendQuick = async (message: string) => {
    if (isResuming) return;
    await agent.send(message, isBusy ? { turnPolicy: "steer" } : undefined);
  };

  const approve = async (optionId: string) => {
    if (!pendingRequest || isResuming) return;
    await agent.respond([{ requestId: pendingRequest.requestId, optionId }]);
  };

  const latestTool = [...dynamicTools].reverse()[0];

  return (
    <main className="page-wrap">
      <header className="product-header">
        <div>
          <div className="eyebrow">Eve × Business World Model</div>
          <h1>聊天，就像在“委托一个实验”</h1>
          <p>Eve 负责设计、请示、运行、解释；世界模型负责发生。</p>
        </div>
        <div className="runtime-badge"><i />真实 Vercel Eve runtime</div>
      </header>

      <section className="product-shell" aria-label="Eve Business World Model">
        <section className="chat-pane">
          <header className="pane-head">
            <div className="brand"><span>E</span><b>Eve</b></div>
            <div className="agent-status"><i />{agent.status === "ready" ? "实验操作员" : agent.status}</div>
          </header>

          <div className="messages" role="log" aria-live="polite">
            {agent.data.messages.length === 0 ? (
              <div className="empty-chat">
                <div className="empty-orb">E</div>
                <h2>把一个商业决策交给 Eve</h2>
                <p>例如：白桃气泡水，¥6 还是 ¥8 更好？</p>
              </div>
            ) : null}

            {agent.data.messages.map((message) => (
              <article className={`message ${message.role === "user" ? "user" : "assistant"}`} key={message.id}>
                <div className="avatar">{message.role === "user" ? "你" : "E"}</div>
                <div className="message-body">
                  {message.parts.map((part, index) => {
                    if (part.type === "text") {
                      return <MessageResponse className="eve-markdown" key={index}>{part.text}</MessageResponse>;
                    }
                    if (part.type === "dynamic-tool") {
                      return (
                        <div className={`tool-event state-${part.state}`} key={index} data-tool={part.toolName}>
                          <span>{toolLabel(part.toolName)}</span>
                          <b>{toolStatusLabel(part.state)}</b>
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
              </article>
            ))}

            {pendingRequest ? (
              <section className="approval-card" aria-label="待批准实验">
                <small>Vercel Eve · 原生审批请求</small>
                <h3>{pendingRequest.prompt || "Eve 想运行这个实验"}</h3>
                <div className="scenario-pair">
                  <div><span>方案 A</span><b>¥6</b><em>其他条件相同</em></div>
                  <div><span>方案 B</span><b>¥8</b><em>其他条件相同</em></div>
                </div>
                <div className="approval-actions">
                  {pendingRequest.options?.map((option) => {
                    const positive = /approve|allow|yes|批准|允许/i.test(`${option.id} ${option.label}`);
                    return (
                      <button
                        className={positive ? "primary-button" : "secondary-button"}
                        key={option.id}
                        onClick={() => void approve(option.id)}
                        type="button"
                      >
                        {positive ? "批准并运行" : option.label}
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}
          </div>

          <form className="composer" onSubmit={submit}>
            <input
              aria-label="告诉 Eve 你想测试什么"
              disabled={isResuming}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="告诉 Eve 你想测试什么…"
              value={draft}
            />
            {isBusy ? (
              <button className="secondary-button" onClick={() => void agent.cancel()} type="button">停止</button>
            ) : (
              <button className="primary-button" disabled={!draft.trim() || isResuming} type="submit">发送</button>
            )}
          </form>
          <div className="quick-actions">
            <button onClick={() => void sendQuick("为什么要先审批？")} type="button">为什么要先审批？</button>
            <button onClick={() => void sendQuick("这等于真实市场预测吗？")} type="button">这是真实预测吗？</button>
            <button onClick={() => { agent.reset(); setDraft("白桃气泡水，¥6 还是 ¥8 更好？"); }} type="button">新实验</button>
          </div>
        </section>

        <section className="world-pane">
          <header className="pane-head">
            <b>实验世界</b>
            <span className="tool-trace">{latestTool ? `${toolName(latestTool)} · ${toolStatusLabel(latestTool.state)}` : "等待 Eve"}</span>
          </header>

          <div className="flow" aria-label="Eve 实验流程">
            {["理解", "设计", "批准", "运行", "检查"].map((label, index) => (
              <div className={`flow-step ${stepState[index] ? "done" : ""} ${index > 0 && stepState[index - 1] && !stepState[index] ? "active" : ""}`} key={label}>
                <i>{index + 1}</i><span>{label}</span>
              </div>
            ))}
          </div>

          <div className="world-stage">
            <section className="world-card">
              <div className="world-title"><h2>同一个世界，只改一个变量</h2><span>价格测试</span></div>
              <div className={`arena ${isBusy ? "running" : ""}`}>
                <div className="choice a"><span>方案 A</span><b>¥{results?.scenarios[0]?.price ?? 6}</b></div>
                <div className="choice b"><span>方案 B</span><b>¥{results?.scenarios[1]?.price ?? 8}</b></div>
                <div className="consumer-cloud" aria-hidden="true">
                  {Array.from({ length: 20 }, (_, index) => <i key={index} style={{ left: `${20 + (index * 13) % 61}%`, top: `${36 + (index * 17) % 48}%` }} />)}
                </div>
              </div>
            </section>

            {results ? (
              <section className="world-card results-card">
                <div className="world-title"><h2>真实工具返回的模型内结果</h2><span className="warning-pill">未校准</span></div>
                <div className="metrics">
                  {results.scenarios.slice(0, 2).map((scenario) => (
                    <div className="metric" key={scenario.id}>
                      <small>¥{scenario.price} · 转化</small>
                      <b>{scenario.conversion.toFixed(1)}%</b>
                      <em>净贡献 ¥{scenario.netContribution.toFixed(0)}</em>
                    </div>
                  ))}
                </div>
                <div className="decision-note">
                  <b>模型内优胜：¥{results.winner.price}</b>
                  <span>这不是现实市场预测；需真实销售或 A/B 数据校准。</span>
                </div>
              </section>
            ) : (
              <section className="world-card waiting-card">
                <div className="world-title"><h2>这里不会预先写死答案</h2><span>live</span></div>
                <p>发送问题后，右侧状态只根据 Eve 实际 tool stream 更新。批准前，`run_experiment` 不会执行。</p>
              </section>
            )}
          </div>
        </section>
      </section>

      <footer className="proof-strip">
        <span><i>1</i>你说目标</span><b>→</b><span><i>2</i>Eve 设计</span><b>→</b><span><i>3</i>你批准</span><b>→</b><span><i>4</i>世界运行</span><b>→</b><span><i>5</i>Eve 检查</span>
      </footer>
    </main>
  );
}
