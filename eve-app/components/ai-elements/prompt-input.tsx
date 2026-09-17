"use client";

// Focused adaptation of Vercel AI Elements PromptInput for text-only Eve turns.
import { cn } from "@/lib/utils";
import type { ComponentProps, FormEvent } from "react";

export type PromptInputMessage = { text: string; files: [] };
export type PromptInputProps = Omit<ComponentProps<"form">, "onSubmit"> & {
  onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void | Promise<void>;
};
export const PromptInput = ({ onSubmit, className, ...props }: PromptInputProps) => (
  <form
    className={cn("ai-prompt-input", className)}
    onSubmit={(event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const text = String(form.get("message") ?? "").trim();
      if (text) void onSubmit({ text, files: [] }, event);
    }}
    {...props}
  />
);
export type PromptInputTextareaProps = ComponentProps<"textarea">;
export const PromptInputTextarea = ({ className, ...props }: PromptInputTextareaProps) => <textarea className={cn("ai-prompt-textarea", className)} name="message" rows={2} {...props} />;
export type PromptInputSubmitProps = ComponentProps<"button"> & { status?: string };
export const PromptInputSubmit = ({ className, status, children, ...props }: PromptInputSubmitProps) => <button className={cn("ai-prompt-submit", className)} type="submit" {...props}>{children ?? (status === "streaming" || status === "submitted" ? "停止" : "发送")}</button>;
