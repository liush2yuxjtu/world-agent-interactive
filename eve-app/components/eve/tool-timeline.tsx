import type { EveMessagePart } from "eve/react";
const labels: Record<string,string> = { plan_experiment:"设计实验", run_experiment:"运行实验", get_run:"读取结果", check_reliability:"检查可信度" };
const states: Record<string,string> = { "approval-requested":"等待批准", "approval-responded":"已响应", "input-streaming":"准备中", "input-available":"运行中", "output-available":"完成", "output-denied":"已拒绝", "output-error":"错误" };
export function ToolTimeline({ parts }: { parts: Extract<EveMessagePart,{type:"dynamic-tool"}>[] }) {
  if (!parts.length) return <div className="tool-timeline-empty">等待实验任务</div>;
  return <ol className="tool-timeline">{parts.map((part,index) => <li data-state={part.state} key={`${part.toolName}-${index}`}><i>{part.state === "output-available" ? "✓" : index + 1}</i><span>{labels[part.toolName] ?? part.toolName}<small>{states[part.state] ?? part.state}</small></span></li>)}</ol>;
}
