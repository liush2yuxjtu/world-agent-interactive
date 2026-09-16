"use client";

// API adapted from the current Vercel AI Elements Confirmation registry component.
import { cn } from "@/lib/utils";
import type { ToolUIPart } from "ai";
import type { ComponentProps, ReactNode } from "react";
import { createContext, useContext, useMemo } from "react";

type Approval = { id: string; approved?: boolean; reason?: string } | undefined;
type ContextValue = { approval: Approval; state: ToolUIPart["state"] };
const Context = createContext<ContextValue | null>(null);
const useConfirmation = () => {
  const value = useContext(Context);
  if (!value) throw new Error("Confirmation components must be used within Confirmation");
  return value;
};

export type ConfirmationProps = ComponentProps<"section"> & { approval?: Approval; state: ToolUIPart["state"] };
export const Confirmation = ({ approval, state, className, ...props }: ConfirmationProps) => {
  const value = useMemo(() => ({ approval, state }), [approval, state]);
  if (!approval || state === "input-streaming" || state === "input-available") return null;
  return <Context.Provider value={value}><section className={cn("ai-confirmation", className)} {...props} /></Context.Provider>;
};
export const ConfirmationRequest = ({ children }: { children?: ReactNode }) => useConfirmation().state === "approval-requested" ? children : null;
export type ConfirmationActionsProps = ComponentProps<"div">;
export const ConfirmationActions = ({ className, ...props }: ConfirmationActionsProps) => useConfirmation().state === "approval-requested" ? <div className={cn("ai-confirmation-actions", className)} {...props} /> : null;
export type ConfirmationActionProps = ComponentProps<"button">;
export const ConfirmationAction = ({ className, ...props }: ConfirmationActionProps) => <button className={cn("ai-confirmation-action", className)} type="button" {...props} />;
