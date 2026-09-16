# China Eve Business World Design

## Goal

Turn the existing `eve-app` into a real Chinese-first Vercel product built around a durable Eve business agent. The product must combine Business World Model state, explicit experiment approval, inspectable tool execution, and persistent conversation in one application while leaving the existing static production routes unchanged.

## Product thesis

The product is **not a chatbot for business data**. It is a business operating workspace where Eve can inspect and operate a world model under user control.

Chinese product name: **商业世界**. Eve is presented as **业务实验操作员**.

The center of gravity is the business world state, not the chat transcript.

## Architecture

The new application remains under `eve-app/` and keeps the existing Eve tool contract. Next.js 16 App Router renders the Chinese product workspace. Eve owns durable sessions, turn resume, approval requests, tool lifecycle, and agent identity. AI SDK remains the model/tool plumbing behind Eve. AI Elements renders AI-native conversation, markdown, tool, and confirmation states. Chat SDK is introduced as a channel abstraction for future Slack/Teams/Telegram/etc. adapters; the web UI does not use Chat SDK as its browser chat implementation.

### Ownership boundaries

**Eve owns**
- durable session state
- conversation transcript
- approval lifecycle
- tool execution lifecycle
- interruption/resume
- experiment orchestration

**Business world projection owns**
- typed scenario results
- observed/inferred/simulated semantic state
- KPI values shown in the workspace
- evidence/reliability presentation

**React UI owns only ephemeral state**
- selected navigation item
- selected world node
- mobile Eve drawer state
- canvas zoom/pan affordances
- composer draft

Business facts must never be stored only in React local state.

## Required experiment contract

Preserve the current audited sequence:

1. `plan_experiment`
2. Eve-native approval request
3. `run_experiment` only after explicit approval
4. `get_run`
5. `check_reliability`
6. Chinese explanation of the model-internal outcome and its limitations

The UI must never call `run_experiment` directly. It may only send an Eve turn or respond to an Eve approval request.

The uncalibrated boundary must remain visible in the product UI:

> 模型内结果 · 未校准
>
> 这是合成业务模型中的结果，不等于现实市场预测。正式决策需要真实销售数据或 A/B 实验校准。

## Information architecture

Primary routes:

- `/` — overview and main world workspace
- `/world` — full world-model inspection
- `/scenarios` — baseline/growth/downside comparison
- `/experiments` — recent experiment/session history shell
- `/evidence` — evidence and source-health shell
- `/assistant` — compatibility redirect to `/`

A future `/history/[sessionId]` route may deep-link durable Eve sessions after persistent account/session identity is introduced. It is not required for the first merge-ready release.

## Desktop layout

At >= 1280px use a three-zone application shell:

1. left product navigation: 184–208px
2. center world workspace: flexible, minimum usable width 720px
3. right Eve operator panel: 360–420px

The business workspace is visually dominant. Eve is a persistent operator sidecar, not a 50/50 chat split.

At 1024–1279px the left navigation collapses to an icon rail and the Eve panel may reduce width.

At <= 760px the world workspace becomes single-column and Eve becomes an in-page/bottom-sheet style panel; the page must not horizontally overflow at 390px.

## Chinese UX conventions

- locale: `zh-CN`
- primary currency formatting: `¥`, `万`, `亿`
- percentage-point changes use `pt` or `个百分点`, never confuse with `%`
- dates use Chinese month/day/time conventions
- Chinese terms are primary; English technical terms are secondary or omitted
- important numeric tables use tabular numerals
- minimum normal Chinese body size is 13px; avoid 9–10px English-dashboard typography for core content

## Visual system

### Semantic colors

- ink / navigation: neutral near-black
- observed data: blue
- inferred/model data: violet only as a semantic state color
- simulated/scenario state: dashed treatment plus restrained violet
- positive business result: green
- negative business result: red
- insufficient evidence / waiting approval: amber
- Eve active/runtime state: cyan/teal accent

Do not use purple gradients or glow as a generic “AI” identity.

### Surfaces

Use one coherent workspace canvas with separators. Do not put every KPI into an isolated floating card. Cards are reserved for information with a real state/action boundary, especially approval, reliability, standalone result, evidence source, and scenario objects.

### Typography

Prefer Geist Sans followed by system CJK fonts (`PingFang SC`, `Microsoft YaHei`, `Noto Sans CJK SC`, `system-ui`). Use tabular numerals for business numbers.

## Main overview

The initial workspace includes:

- context header: `华东企业业务世界 · Q4`
- source freshness line
- four-metric strip
- causal world canvas
- scenario selector
- visible state legend: `已观测 / 模型推断 / 场景模拟`
- Eve panel with prompt input and quick business questions

The world canvas initially projects the existing business model vocabulary:

- Qualified pipeline / 合格商机
- Sales capacity / 销售产能
- Pipeline coverage / 商机覆盖
- Win probability / 成交概率
- Renewal base / 续费基数
- Q4 revenue / Q4 收入

When an experiment tool produces result data, the central workspace must reflect the actual Eve tool output instead of pre-written result copy.

## Eve panel

Use AI Elements where it maps cleanly to the product:

- `Conversation` for scrolling transcript behavior
- `Message` / `MessageResponse` for human/assistant text
- `Tool` for inspectable tool lifecycle
- `Confirmation` for Eve approval requests
- `PromptInput` for the composer

Business outcome visualization remains custom world UI, not chat bubbles.

Default quick prompts are Chinese business questions such as:

- `白桃气泡水，¥6 还是 ¥8 更好？`
- `如果成交率下降 3 个百分点，Q4 收入会怎样？`
- `为什么这个实验需要先批准？`

## Result presentation

A completed experiment shows:

- scenario A/B values returned by tools
- conversion and net-contribution metrics when present
- model-internal winner from tool output
- reliability result
- uncalibrated warning

Do not manufacture Q4 revenue or causal-attribution numbers if the existing experiment tool does not return them.

## Chat SDK boundary

Add the current `chat` package and a small `bot/` integration boundary that can construct a Chat SDK bot when platform adapters are added. The merge-ready release does not require external Slack/Teams/Telegram credentials. The module exists to prove the project is using the official Chat SDK architecture rather than mixing future channel code into React components.

Chinese enterprise adapters such as Feishu/WeCom are future work and must not be represented as official adapters unless implemented and tested.

## Template references

Architecture reference: Vercel `personal-agent-template` / Eve examples — durable sessions, one agent across surfaces, agent runtime separated from UI concerns.

Channel reference: Vercel Chat SDK (`npm i chat`) — one event model across multiple chat platforms.

AI UI reference: current AI Elements components (`Conversation`, `Message`, `Tool`, `Confirmation`, `PromptInput`).

Mobbin was requested as a design source, but the connected Mobbin account currently gates screen search behind a paid plan. No unverifiable Mobbin screen URLs may be cited or copied. The design therefore uses the existing project design rules plus the Vercel references above.

## Implementation constraints

- preserve existing `agent/tools/*` behavior unless a test proves a required change
- preserve the existing native Eve approval gate
- keep the old static `business-world-model/` untouched
- do not merge to `main` without explicit user approval
- deploy a separate Vercel preview
- preview must be a real Next.js/Eve application, not a static iframe or raw HTML wrapper
- no real-data claims for synthetic outputs

## Verification requirements

Before merge-ready status:

- `next build` succeeds on Vercel
- TypeScript build/type checking succeeds as part of build/CI
- existing Eve eval files remain present and compatible
- browser verifies the Chinese product UI renders as an application
- browser verifies the page is responsive at mobile width
- browser verifies an Eve interaction reaches a real runtime state when environment/model access is available
- the preview retains a visible uncalibrated disclaimer
- PR remains unmerged
