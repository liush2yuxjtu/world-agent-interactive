"use client";

// MessageResponse keeps the Vercel AI Elements + Streamdown CJK rendering pattern.
import { cn } from "@/lib/utils";
import { cjk } from "@streamdown/cjk";
import { code } from "@streamdown/code";
import { math } from "@streamdown/math";
import { mermaid } from "@streamdown/mermaid";
import type { ComponentProps } from "react";
import { memo } from "react";
import { Streamdown } from "streamdown";

export type MessageProps = ComponentProps<"article"> & { from?: "user" | "assistant" };
export const Message = ({ from = "assistant", className, ...props }: MessageProps) => (
  <article className={cn("ai-message", `ai-message-${from}`, className)} {...props} />
);

export type MessageContentProps = ComponentProps<"div">;
export const MessageContent = ({ className, ...props }: MessageContentProps) => (
  <div className={cn("ai-message-content", className)} {...props} />
);

export type MessageResponseProps = ComponentProps<typeof Streamdown>;
export const MessageResponse = memo(
  ({ className, ...props }: MessageResponseProps) => (
    <Streamdown className={cn("ai-message-response", className)} plugins={{ code, mermaid, math, cjk }} {...props} />
  ),
  (prevProps, nextProps) => prevProps.children === nextProps.children,
);
MessageResponse.displayName = "MessageResponse";
