"use client";

import { Conversation, ConversationContent, ConversationEmptyState } from "@/components/ai-elements/conversation";
import { Confirmation, ConfirmationAction, ConfirmationActions, ConfirmationRequest } from "@/components/ai-elements/confirmation";
import { Message, MessageContent, MessageResponse } from "@/components/ai-elements/message";
import { PromptInput, PromptInputSubmit, PromptInputTextarea } from "@/components/ai-elements/prompt-input";
import { Tool, ToolContent, ToolHeader, ToolInput, ToolOutput } from "@/components/ai-elements/tool";
import { ExperimentResult } from "@/components/eve/experiment-result";
import { ToolTimeline } from "@/components/eve/tool-timeline";
import { projectRunOutput } from "@/lib/world/projection";
import type { ExperimentProjection } from "@/lib/world/types";
import { useEveAgent, type EveMessagePart } from "eve/react";
import { useEffect, useMemo, useState } from "react";

export function EveOperatorPanel({ onProjectionChange }: { onProjectionChange?: (value: ExperimentProjection | null) => void }) {
  const [draft, setDraft] = useState("白桃气泡水，¥6 还是 ¥8 更好？");
  const agent = useEveAgent({ onError(error) { console.error("Eve error", error); } });
  const parts = useMemo(() => agent.data.messages.flatMap((message) => message.parts), [agent.data.messages]);
  const dynamicTools = parts.filter((part): part is Extract<EveMessagePart,{type:"dynamic-tool"}> => part.type === "dynamic-tool");
  const pendingPart = dynamicTools.find((part) => part.state === "approval-requested");
  const pendingRequest = pendingPart?.toolMetadata?.eve?.inputRequest;
  const runPart = [...dynamicTools].reverse().find((part) => part.toolName === "run_experiment" && part.state === "output-available");
  const getRunPart = [...dynamicTools].reverse().find((part) => part.toolName === "get_run" && part.state === "output-available");
  const projection = useMemo(() => projectRunOutput(getRunPart?.output ?? runPart?.output), [getRunPart?.output, runPart?.output]);
  useEffect(() => { onProjectionChange?.(projection); }, [projection, onProjectionChange]);
  const isBusy = agent.status === "submitted" || agent.status === "streaming";
  const isResuming = agent.status === "resuming";

  const send = async (text: string) => {
    const message = text.trim();
    if (!message || isResuming) return;
    setDraft("");
    await agent.send(message, isBusy ? { turnPolicy: "steer" } : undefined);
  };
  const approve = async (optionId: string) => {
    if (!pendingRequest || isResuming) return;
    await agent.respond([{ requestId: pendingRequest.requestId, optionId }]);
  };

  return <aside className="eve-panel" aria-label="Eve 业务实验操作员">
    <header className="eve-panel-head"><div><span className="eve-avatar">E</span><div><strong>Eve</strong><small>业务实验操作员</small></div></div><span className="runtime-status"><i />{agent.status === "ready" ? "在线" : agent.status}</span></header>
    <div className="eve-context"><span>实验控制</span><ToolTimeline parts={dynamicTools} /></div>
    <Conversation className="eve-conversation">
      <ConversationContent>
        {agent.data.messages.length === 0 ? <ConversationEmptyState title="把一个商业决策交给 Eve" description="Eve 会先设计实验，在真正运行前请求你的批准。" /> : null}
        {agent.data.messages.map((message) => <Message from={message.role === "user" ? "user" : "assistant"} key={message.id}>
          <span className="message-avatar">{message.role === "user" ? "你" : "E"}</span>
          <MessageContent>{message.parts.map((part,index) => {
            if (part.type === "text") return <MessageResponse key={index}>{part.text}</MessageResponse>;
            if (part.type === "dynamic-tool") return <Tool key={index} open={part.state === "approval-requested" || part.state === "output-error"}>
              <ToolHeader type="dynamic-tool" state={part.state} toolName={part.toolName} title={{plan_experiment:"设计实验",run_experiment:"运行实验",get_run:"读取结果",check_reliability:"检查可信度"}[part.toolName] ?? part.toolName} />
              <ToolContent><ToolInput input={part.input} /><ToolOutput output={part.output} errorText={part.errorText} /></ToolContent>
            </Tool>;
            return null;
          })}</MessageContent>
        </Message>)}
        {pendingRequest && pendingPart ? <Confirmation approval={{ id: pendingRequest.requestId }} state="approval-requested" className="approval-card">
          <ConfirmationRequest><small>Vercel Eve · 原生审批请求</small><h3>{pendingRequest.prompt || "Eve 想运行这个实验"}</h3><p>确认后才会执行 `run_experiment`。批准前世界状态不会被修改。</p></ConfirmationRequest>
          <ConfirmationActions>{pendingRequest.options?.map((option) => { const positive=/approve|allow|yes|批准|允许/i.test(`${option.id} ${option.label}`); return <ConfirmationAction className={positive ? "is-primary" : ""} key={option.id} onClick={() => void approve(option.id)}>{positive ? "确认并运行" : option.label}</ConfirmationAction>; })}</ConfirmationActions>
        </Confirmation> : null}
        {projection ? <ExperimentResult projection={projection} /> : <div className="uncalibrated-note"><strong>模型内结果 · 未校准</strong><span>所有实验输出默认来自合成模型，不等于现实市场预测。</span></div>}
      </ConversationContent>
    </Conversation>
    <div className="quick-prompts"><button type="button" onClick={() => void send("如果成交率下降 3 个百分点，Q4 收入会怎样？")}>成交率下降 3pt</button><button type="button" onClick={() => void send("为什么这个实验需要先批准？")}>为什么先审批？</button></div>
    <PromptInput onSubmit={async ({ text }) => void send(text)}>
      <PromptInputTextarea aria-label="告诉 Eve 你想推演什么" disabled={isResuming} onChange={(event) => setDraft(event.target.value)} placeholder="告诉 Eve 你想推演什么…" value={draft} />
      {isBusy ? <button className="ai-prompt-stop" onClick={() => void agent.cancel()} type="button">停止</button> : <PromptInputSubmit disabled={!draft.trim() || isResuming} status={agent.status}>发送</PromptInputSubmit>}
    </PromptInput>
  </aside>;
}
