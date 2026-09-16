"use client";

// Adapted from the current Vercel AI Elements Conversation registry component.
import { cn } from "@/lib/utils";
import type { ComponentProps } from "react";
import { useEffect, useRef } from "react";

export type ConversationProps = ComponentProps<"div">;
export const Conversation = ({ className, ...props }: ConversationProps) => (
  <div className={cn("ai-conversation", className)} role="log" {...props} />
);

export type ConversationContentProps = ComponentProps<"div">;
export const ConversationContent = ({ className, ...props }: ConversationContentProps) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "end" }); });
  return (
    <div className={cn("ai-conversation-content", className)} {...props}>
      {props.children}
      <span ref={ref} aria-hidden="true" />
    </div>
  );
};

export type ConversationEmptyStateProps = ComponentProps<"div"> & { title?: string; description?: string };
export const ConversationEmptyState = ({ title = "暂无消息", description, className, ...props }: ConversationEmptyStateProps) => (
  <div className={cn("ai-conversation-empty", className)} {...props}>
    <strong>{title}</strong>{description ? <p>{description}</p> : null}
  </div>
);
