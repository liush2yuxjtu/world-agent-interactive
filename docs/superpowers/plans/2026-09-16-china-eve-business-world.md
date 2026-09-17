# China Eve Business World Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `eve-app` into a Chinese-first Business World product using durable Eve sessions, AI Elements, AI SDK, and a clean Chat SDK channel boundary, then produce a tested Vercel preview and merge-ready PR.

**Architecture:** Keep the existing Eve agent/tool contract as the source of truth. Split the current monolithic `EveChat` into a product shell, custom world projection, and Eve operator panel; AI Elements handles AI-native transcript/tool/confirmation UI while custom components render business state. Add Chat SDK only at the channel boundary, without requiring external platform credentials in this release.

**Tech Stack:** Next.js 16.2.6, React 19.2.6, Eve 0.31.x, AI SDK 7.0.58, AI Elements registry components, Chat SDK `chat` 4.40.0, TypeScript 5.9, Streamdown.

**Spec:** `docs/superpowers/specs/2026-09-16-china-eve-business-world-design.md`

## Global Constraints

- Default UI locale is `zh-CN`.
- Preserve `plan_experiment → approval → run_experiment → get_run → check_reliability`.
- UI must not directly execute `run_experiment`.
- Existing static `business-world-model/` is untouched.
- Synthetic output must remain visibly labelled `模型内结果 · 未校准`.
- No production merge without explicit user approval.
- Preview must be a real Next.js/Eve Vercel deployment.

---

### Task 1: Product contract tests

**Files:**
- Create: `tests/eve-business-world-contract.test.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: repository files under `eve-app/`
- Produces: source-level acceptance checks that protect required Chinese IA, AI Elements usage, Chat SDK dependency, and approval language.

- [ ] **Step 1: Write the failing test**

Create a Node test that reads the future shell/component files and asserts the presence of Chinese navigation labels, `模型内结果 · 未校准`, `useEveAgent`, AI Elements `Conversation` / `Confirmation` / `Tool` / `PromptInput`, and `chat` in `eve-app/package.json`.

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

test('Chinese Eve Business World product contract is present', () => {
  const shell = read('eve-app/components/business-world-app.tsx');
  const panel = read('eve-app/components/eve/eve-operator-panel.tsx');
  const pkg = JSON.parse(read('eve-app/package.json'));
  assert.match(shell, /商业世界/);
  assert.match(shell, /世界模型/);
  assert.match(shell, /场景推演/);
  assert.match(panel, /模型内结果 · 未校准/);
  assert.match(panel, /useEveAgent/);
  assert.match(panel, /Conversation/);
  assert.match(panel, /Confirmation/);
  assert.match(panel, /Tool/);
  assert.match(panel, /PromptInput/);
  assert.equal(pkg.dependencies.chat, '4.40.0');
});
```

- [ ] **Step 2: Run test and verify RED**

Run `node --test tests/eve-business-world-contract.test.mjs` and confirm it fails because the new product files do not exist.

- [ ] **Step 3: Add the test to root test discovery**

The existing root script already runs `node --test tests/*.test.mjs`; no extra runner is needed unless the script changed.

- [ ] **Step 4: Commit the red test**

Commit message: `test: define China Eve Business World contract`.

### Task 2: AI Elements and package foundation

**Files:**
- Modify: `eve-app/package.json`
- Create: `eve-app/components/ai-elements/conversation.tsx`
- Create: `eve-app/components/ai-elements/tool.tsx`
- Create: `eve-app/components/ai-elements/confirmation.tsx`
- Create: `eve-app/components/ai-elements/prompt-input.tsx`
- Modify: `eve-app/components/ai-elements/message.tsx` only if required for compatibility

**Interfaces:**
- Produces reusable AI-native primitives used by `EveOperatorPanel`.

- [ ] **Step 1: Pin Chat SDK**

Add `"chat": "4.40.0"`. Keep existing `ai`, `eve`, `next`, React and Streamdown versions.

- [ ] **Step 2: Add only needed AI Elements source**

Use the current AI Elements registry contracts for `conversation`, `tool`, `confirmation`, and `prompt-input`. Components must expose the names used by current docs, including `Conversation`, `ConversationContent`, `Tool`, `ToolHeader`, `Confirmation`, `ConfirmationRequest`, `ConfirmationActions`, `ConfirmationAction`, `PromptInput`, `PromptInputTextarea`, and `PromptInputSubmit`.

- [ ] **Step 3: Run contract test**

Expected result is still RED because the product shell and panel are not implemented, but import/source files must be present.

- [ ] **Step 4: Commit**

Commit message: `feat: add AI Elements and Chat SDK foundation`.

### Task 3: Business world projection

**Files:**
- Create: `eve-app/lib/world/types.ts`
- Create: `eve-app/lib/world/projection.ts`
- Create: `eve-app/components/world/metric-strip.tsx`
- Create: `eve-app/components/world/world-canvas.tsx`
- Create: `eve-app/components/world/scenario-tabs.tsx`
- Create: `tests/eve-world-projection.test.mjs`

**Interfaces:**
- `projectRunOutput(value: unknown): ExperimentProjection | null`
- `ExperimentProjection` contains normalized scenarios, winner, run id and `calibrated: false`.

- [ ] **Step 1: Write projection RED test**

Test a representative tool output and assert winner price, scenario count, conversion value, and `calibrated === false`. Test malformed output returns `null`.

- [ ] **Step 2: Verify RED**

Run `node --test tests/eve-world-projection.test.mjs`; expected failure is missing projection module.

- [ ] **Step 3: Implement minimal projection and world UI**

Move the safe unknown-to-number/string normalization currently embedded in `eve-chat.tsx` into `projection.ts`. Render baseline Chinese world metrics before a run and actual tool results after a run. Never invent unavailable revenue attribution from a price-experiment result.

- [ ] **Step 4: Verify GREEN**

Run the projection test and root tests.

- [ ] **Step 5: Commit**

Commit message: `feat: add typed business world projection`.

### Task 4: Eve operator panel

**Files:**
- Create: `eve-app/components/eve/eve-operator-panel.tsx`
- Create: `eve-app/components/eve/tool-timeline.tsx`
- Create: `eve-app/components/eve/experiment-result.tsx`
- Remove/replace: `eve-app/components/eve-chat.tsx`

**Interfaces:**
- `EveOperatorPanel` owns `useEveAgent()` and maps real Eve message parts into AI Elements.
- `onProjectionChange?: (projection: ExperimentProjection | null) => void` lets the world workspace consume actual tool output.

- [ ] **Step 1: Extend contract test for approval semantics**

Assert the operator panel contains `agent.respond`, handles `approval-requested`, and does not import/call `run_experiment` directly.

- [ ] **Step 2: Verify RED**

Run the contract test and confirm the new assertions fail.

- [ ] **Step 3: Implement operator panel**

Use `Conversation`/`MessageResponse` for transcript, `Tool` for tool state, `Confirmation` for approval requests and `PromptInput` for the composer. Preserve `agent.send`, `agent.respond`, `agent.cancel`, steering while busy, and reset behavior.

- [ ] **Step 4: Verify GREEN**

Run root contract tests.

- [ ] **Step 5: Commit**

Commit message: `feat: rebuild Eve as operator panel`.

### Task 5: Chinese product shell and routes

**Files:**
- Create: `eve-app/components/business-world-app.tsx`
- Create: `eve-app/components/shell/app-sidebar.tsx`
- Create: `eve-app/components/shell/product-header.tsx`
- Modify: `eve-app/app/page.tsx`
- Modify: `eve-app/app/assistant/page.tsx`
- Create: `eve-app/app/world/page.tsx`
- Create: `eve-app/app/scenarios/page.tsx`
- Create: `eve-app/app/experiments/page.tsx`
- Create: `eve-app/app/evidence/page.tsx`

**Interfaces:**
- `BusinessWorldApp` composes navigation, business workspace and `EveOperatorPanel`.

- [ ] **Step 1: Add route/source assertions to contract test**

Assert `/` renders `BusinessWorldApp`, `/assistant` redirects to `/`, and secondary route files exist.

- [ ] **Step 2: Verify RED**

Run contract test.

- [ ] **Step 3: Implement shell/routes**

Use Chinese navigation: `总览 / 世界模型 / 场景推演 / 实验 / 证据 / 历史`. Secondary routes may initially reuse the same shared world shell with route-specific title/content; do not duplicate agent state logic.

- [ ] **Step 4: Verify GREEN**

Run root tests.

- [ ] **Step 5: Commit**

Commit message: `feat: add Chinese Business World application shell`.

### Task 6: Responsive design system

**Files:**
- Replace: `eve-app/app/globals.css`
- Modify: `eve-app/app/layout.tsx`

**Interfaces:**
- CSS class contracts from shell/world/Eve components.

- [ ] **Step 1: Add source assertions**

Assert `lang="zh-CN"`, CSS contains 390px-safe responsive breakpoint and semantic selectors for observed/inferred/simulated state.

- [ ] **Step 2: Verify RED**

Run contract test.

- [ ] **Step 3: Implement CSS**

Create neutral enterprise shell, dark navigation, high-density Chinese metrics, 3-column desktop, collapsible/mobile single column, visible semantic state styles, restrained shadows, no generic AI gradients.

- [ ] **Step 4: Verify GREEN**

Run root tests.

- [ ] **Step 5: Commit**

Commit message: `feat: add Chinese-first responsive design system`.

### Task 7: Chat SDK channel boundary

**Files:**
- Create: `eve-app/bot/business-bot.ts`
- Create: `eve-app/bot/README.md`
- Create: `tests/eve-chat-sdk-boundary.test.mjs`

**Interfaces:**
- Export `createBusinessBot(options)` using `Chat` from `chat` without platform-specific credentials.
- The README defines how a future official adapter delegates business behavior to Eve rather than reimplementing experiment tools.

- [ ] **Step 1: Write RED test**

Assert `business-bot.ts` imports `Chat` from `chat`, exports `createBusinessBot`, and contains no Slack/Telegram secret names.

- [ ] **Step 2: Verify RED**

Run the test.

- [ ] **Step 3: Implement minimal boundary**

Keep it build-safe and credential-free. Do not add a fake platform adapter.

- [ ] **Step 4: Verify GREEN**

Run root tests.

- [ ] **Step 5: Commit**

Commit message: `feat: add Chat SDK business channel boundary`.

### Task 8: CI and merge readiness

**Files:**
- Modify: `.github/workflows/ci.yml`
- Modify: `README.md` or `docs/EVE_CHAT_FEATURE.md` with preview/app architecture note

**Interfaces:**
- CI includes an `eve-app` job that installs dependencies and runs `npm run typecheck` plus `npm run build` from `eve-app/`.

- [ ] **Step 1: Add CI expectation test/source assertion**

Ensure workflow text includes `working-directory: eve-app`, `npm install`, `npm run typecheck`, and `npm run build`.

- [ ] **Step 2: Verify RED**

Run contract test.

- [ ] **Step 3: Update CI/docs**

Keep the existing static-site CI behavior and add the Eve app job rather than replacing unrelated checks.

- [ ] **Step 4: Push branch and create draft PR**

PR base: `main`; head: `feature/china-eve-personal-agent`.

- [ ] **Step 5: Verify remote CI**

Inspect GitHub workflow runs and fix failures until green.

- [ ] **Step 6: Deploy Vercel preview**

Deploy `eve-app` as an isolated real Next.js/Eve project. Do not reuse the static iframe preview approach.

- [ ] **Step 7: Browser QA**

Verify desktop render, mobile render, visible Chinese navigation, visible uncalibrated warning, interactive prompt/approval surface, and no source-code/static wrapper rendering.

- [ ] **Step 8: Mark PR ready for review**

Only after CI/build/browser checks pass. Do not merge.
