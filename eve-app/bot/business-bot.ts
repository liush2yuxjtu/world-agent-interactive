import { Chat } from "chat";

/** Official Chat SDK boundary for future Slack/Teams/Telegram/etc. adapters. */
export type BusinessBotConfig = ConstructorParameters<typeof Chat>[0];
export function createBusinessBot(config: BusinessBotConfig) {
  return new Chat(config);
}
