import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const source = readFileSync(new URL("../eve-app/bot/business-bot.ts", import.meta.url), "utf8");
test("Chat SDK boundary uses official chat package without platform secrets", () => {
  assert.match(source, /from ["']chat["']/);
  assert.match(source, /createBusinessBot/);
  assert.doesNotMatch(source, /(SLACK_TOKEN|TELEGRAM_TOKEN|DISCORD_TOKEN|TEAMS_SECRET)/);
});
