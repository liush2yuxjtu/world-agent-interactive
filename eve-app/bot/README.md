# Business World Chat SDK boundary

This folder is the cross-platform channel boundary for the Business World agent. It uses Vercel's official `chat` package, but intentionally ships with no platform adapter credentials in this release.

Future official adapters (Slack, Teams, Telegram, Discord, Google Chat, etc.) should translate channel events into the same Eve business behavior. They must not duplicate or bypass `plan_experiment → approval → run_experiment → get_run → check_reliability`.

Feishu and WeCom are not represented as official Chat SDK adapters here; adding them requires an explicit adapter implementation and tests.
