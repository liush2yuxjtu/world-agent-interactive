"use client";

// API adapted from the current Vercel AI Elements Tool registry component.
import { cn } from "@/lib/utils";
import type { DynamicToolUIPart, ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";

export type ToolPart = ToolUIPart | DynamicToolUIPart;
export type ToolProps = ComponentProps<"details">;
export const Tool = ({ className, ...props }: ToolProps) => <details className={cn("ai-tool", className)} {...props} />;
export type ToolHeaderProps = { title?: string; className?: string } & (
  | { type: ToolUIPart["type"]; state: ToolUIPart["state"]; toolName?: never }
  | { type: DynamicToolUIPart["type"]; state: DynamicToolUIPart["state"]; toolName: string }
);
const statusLabels: Record<ToolPart["state"], string> = {
  "approval-requested": "等待批准", "approval-responded": "已响应", "input-available": "运行中", "input-streaming": "准备中", "output-available": "完成", "output-denied": "已拒绝", "output-error": "错误",
};
export const ToolHeader = ({ title, type, state, toolName, className }: ToolHeaderProps) => {
  const derived = type === "dynamic-tool" ? toolName : type.split("-").slice(1).join("-");
  return <summary className={cn("ai-tool-header", className)}><span>{title ?? derived}</span><b data-state={state}>{statusLabels[state]}</b></summary>;
};
export type ToolContentProps = ComponentProps<"div">;
export const ToolContent = ({ className, ...props }: ToolContentProps) => <div className={cn("ai-tool-content", className)} {...props} />;
export const ToolInput = ({ input }: { input: ToolPart["input"] }) => <pre className="ai-tool-code">{JSON.stringify(input, null, 2)}</pre>;
export const ToolOutput = ({ output, errorText }: { output: ToolPart["output"]; errorText?: string }) => {
  if (output === undefined && errorText === undefined) return null;
  const value: ReactNode = typeof output === "string" ? output : <pre>{JSON.stringify(output, null, 2)}</pre>;
  return <div className={cn("ai-tool-output", errorText && "is-error")}>{errorText ?? value}</div>;
};
