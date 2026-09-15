# Business World Model · DESIGN.md

This file is the visual source of truth for Business World Model product UI. AI coding and design agents must read it before editing any user-facing interface.

The implementation source of truth for current token values remains `src/tokens.css`. Shared component behavior lives in `src/components.css` and `src/components.mjs`. Detailed token governance, accessibility rules, and component contracts live in `docs/DESIGN_SYSTEM.md`.

Design direction: **analytical workspace, calm intelligence, visible causality**. The product should feel like an instrument for understanding a living business, not a generic SaaS dashboard, a crypto terminal, or an AI-chat wrapper.

Reference lineage: the document structure follows the `awesome-design-md` pattern. Product inspiration is blended rather than copied: Airtable for legible data-dense workspaces, Supabase for technical clarity and inspectability, and Vercel for visual restraint and hierarchy. Do not reproduce their logos, proprietary assets, exact layouts, or brand styling.

---

## 1. Visual Theme & Atmosphere

### Core idea

A Business World Model represents entities, relationships, state, evidence, decisions, simulations, and outcomes. The interface must make those layers understandable at a glance.

Use these qualities:

- **Calm, precise, consequential.** Important changes should feel meaningful, not theatrical.
- **Dense where evidence demands density.** Tables, graphs, timelines, and inspectors may carry substantial information, but every region needs a clear hierarchy.
- **Model before decoration.** The world model itself is the visual protagonist. Chrome stays quiet.
- **Causality is visible.** Users should be able to understand why a metric changed, what evidence supports a claim, and what a proposed action could affect.
- **Uncertainty is explicit.** Forecasts, inferred relationships, stale facts, and simulated results must never look identical to observed facts.
- **Human control remains obvious.** AI suggestions are proposals with provenance and confidence, not magical commands from a glowing oracle.

### Product atmosphere

Prefer white and very light cool surfaces, dark navy ink, restrained blue action color, thin borders, compact radii, and shallow elevation. Use color primarily for meaning: action, status, model layer, comparison, or chart series.

Avoid ornamental gradients, glassmorphism, excessive blur, neon glows, giant rounded cards, decorative 3D objects, and “AI sparkle” motifs. Humanity has survived long enough without another purple gradient robot brain.

### Three semantic layers

Every Business World Model screen should preserve the distinction between these product layers:

1. **World / Ontology**: business entities, relationships, definitions, data sources, permissions, provenance.
2. **Runtime / Operations**: goals, projects, processes, agents, experts, skills, tools, decisions, checks, events.
3. **Applications / Decisions**: conversations, workspaces, scenarios, simulations, recommendations, reports, actions.

Do not collapse all three into a single undifferentiated “dashboard.” Use labels, grouping, navigation, and visual state so users know which layer they are viewing.

---

## 2. Color Palette & Roles

Use semantic tokens from `src/tokens.css`. Never hard-code a near-match when a token exists.

| Role | Token | Value | Use |
|---|---|---:|---|
| Primary action | `--color-brand` | `#315dff` | Primary buttons, selected states, active graph edges, focus emphasis |
| Primary hover | `--color-brand-hover` | `#214ce8` | Hover on primary actions |
| Primary active | `--color-brand-active` | `#1b40ca` | Pressed/active actions |
| Brand soft | `--color-brand-soft` | `#eaf0ff` | Selected rows, active panels, low-emphasis model highlights |
| Brand line | `--color-brand-line` | `#b7c9ff` | Selected borders, connectors, emphasized outlines |
| Strong ink | `--color-ink` | `#070d2d` | Headlines, primary values, critical labels |
| Body text | `--color-text` | `#3e5485` | Body copy, table content |
| Muted text | `--color-muted` | `#647496` | Metadata, timestamps, secondary labels |
| Surface | `--color-surface` | `#ffffff` | Main canvas, cards, panels |
| Soft surface | `--color-surface-soft` | `#f8faff` | Secondary regions, side panels, grouped sections |
| Input surface | `--color-input` | `#f5f7fc` | Inputs, command controls, editable fields |
| Border | `--color-border` | `#e6ecf7` | Dividers, card outlines, table rules |
| Frame | `--color-frame` | `#203447` | Rare structural emphasis, dark frames |
| Success | `--color-success` | `#218653` | Verified, completed, healthy |
| Warning | `--color-warning` | `#946008` | Stale evidence, review required, uncertainty |
| Error | `--color-error` | `#d94862` | Failed, blocked, destructive, invalid |
| Purple | `--color-purple` | `#8057ff` | Inferred/AI-generated model state when a separate semantic cue is needed |

### Chart roles

- `--color-chart-a`, `--color-chart-b`, `--color-chart-c` are comparison series, not semantic success/error states.
- Use the `*-low` variants for secondary series or historical context.
- Never encode meaning by color alone. Pair chart colors with labels, line styles, symbols, or direct annotation.
- Keep persistent semantic meanings stable inside a view. If blue means “baseline,” it must not become “scenario B” halfway down the page.

### Observed vs inferred vs simulated

Use presentation differences beyond color:

- **Observed fact**: solid border/line, normal text, source available.
- **Inferred fact**: subtle tinted surface, inference badge, confidence/provenance visible.
- **Simulated state**: dashed boundary or connector, explicit `Simulation` label, never merged silently into current-state data.
- **Stale/unknown**: muted content plus warning text or icon; do not invent a value to make the card look complete.

---

## 3. Typography Rules

Use `--font-sans` for all product UI. The editorial family is reserved for rare authored or narrative artifacts, never controls, tables, metrics, or dense operational UI.

### Type hierarchy

| Purpose | Token | Weight | Guidance |
|---|---|---|---|
| Page / major view title | `--text-3xl` 38px | 600–700 | Sparse use; not inside dense panels |
| Section title | `--text-2xl` 28px | 600 | Major model sections and scenario summaries |
| Panel title | `--text-xl` 20px | 600 | Inspector, analysis panel, entity overview |
| Strong body / card title | `--text-lg` 16px | 600 | Entity names, KPI titles, action group titles |
| Default UI body | `--text-md` 14px | 400–500 | Primary application text |
| Dense UI | `--text-sm` 12px | 400–600 | Tables, metadata-rich nodes, compact controls |
| Micro metadata | `--text-xs` 11px | 500 | IDs, timestamps, provenance labels |
| Exceptional microcopy | `--text-2xs` 10px | 500–600 | Only when density truly requires it |

### Typography principles

- Use sentence case for product UI.
- Prefer short, concrete labels: `Revenue`, `Source`, `Confidence`, `Affected entities`.
- Numbers that users compare should align visually. Use tabular numerals where the implementation supports them.
- Large numbers need units and time context: `$4.2M · FY2026`, not merely `4.2`.
- Do not use uppercase paragraphs. Uppercase may be used sparingly for compact category labels.
- Do not make every label bold. Hierarchy collapses when everything shouts.

---

## 4. Layout Principles

### Spacing scale

Use only the current spacing scale unless a component contract explicitly defines an internal dimension:

`4, 8, 12, 16, 20, 24, 32, 40, 48px`

Primary rhythm:

- 4–8px: icon/label and micro relationships.
- 12–16px: control interiors, table cell breathing room, compact groups.
- 20–24px: panel padding and related content groups.
- 32–48px: separation between major sections.

### Workspace anatomy

A typical desktop workspace should use four conceptual zones:

1. **Navigation rail**: global product areas and layer switching.
2. **Context header**: world/model name, scope, time, scenario, status, primary action.
3. **Primary canvas**: graph, table, timeline, workflow, simulation, or report.
4. **Inspector / evidence panel**: selected entity, source, assumptions, history, actions.

Not every view needs all four visible at once. The primary canvas must remain the largest region.

### Width and density

- Use full available width for model exploration, tables, dependency graphs, and timelines.
- Use constrained reading width for long narrative explanations and reports.
- Do not center a tiny 960px dashboard inside a wide screen when the user is trying to inspect a business graph with 120 entities. That is decorative minimalism defeating the actual job.
- Side panels should be resizable or collapsible when they materially compete with the model canvas.

### Alignment

- Use a clear grid and align labels, values, and controls across sibling components.
- Tables prioritize column alignment over card-like decoration.
- Metric cards align number baselines and period labels.
- Graph controls align to edges/corners of the canvas rather than floating randomly over data.

---

## 5. Depth, Shape & Motion

### Radius

Use the existing radius scale:

- `--radius-sm` 4px: small controls, compact tags.
- `--radius-md` 6px: buttons, inputs, table containers.
- `--radius-lg` 8px: cards, inspectors, panels.
- `--radius-xl` 12px: dialogs and high-level containers.
- `--radius-2xl` 20px: rare, large standalone surfaces only.
- `--radius-pill`: status chips/toggles only, never default cards.

The visual language is **precise, not bubbly**.

### Elevation

- Prefer border and surface contrast before shadow.
- `--shadow-card`: lightweight separation from the canvas.
- `--shadow-button`: primary action emphasis only.
- `--shadow-popover`: menus, command palette, dialogs, transient overlays.
- Avoid stacking several shadows around nested cards.

### Motion

Use `--duration-fast` and `--duration-normal` with `--ease-standard`.

Motion should explain state changes:

- panel opening/closing,
- selection movement,
- scenario comparison transitions,
- graph expansion/collapse,
- loading/progress,
- successful application of an action.

Do not continuously animate the world model merely to imply that the business is “alive.” That turns analysis into aquarium décor.

Respect reduced-motion preferences.

---

## 6. Component Styling

Existing shared contracts for buttons, forms, badges, cards, switches, toasts, and dialogs are defined in `docs/DESIGN_SYSTEM.md`. Extend them instead of creating visually unrelated versions.

### Buttons

- One primary action per decision region.
- Secondary/outline for alternative actions.
- Ghost for low-priority local controls.
- Destructive actions use error semantics and require explicit wording.
- Icon-only buttons require accessible names and tooltips where meaning is not obvious.
- Loading actions preserve their label or otherwise make the pending operation explicit.

### Cards and panels

Cards are for a meaningful object or summary, not for every paragraph.

A good card has:

- one clear subject,
- a small number of related values/actions,
- visible state when selectable,
- minimal nested borders.

Prefer sections, rows, and tables when many sibling facts need comparison.

### Inputs and filters

- Labels remain visible after entry.
- Filters show active state and are easy to clear.
- Time range, scenario, organizational scope, currency, and units are first-class context controls when relevant.
- Search should state its domain when ambiguity exists: `Search entities`, `Search evidence`, `Search actions`.

### Badges

Badges communicate compact state, not decoration. Recommended semantic families:

- `Observed`
- `Inferred`
- `Simulated`
- `Verified`
- `Needs review`
- `Stale`
- `Blocked`
- `Draft`

Use text plus semantic styling.

---

## 7. Business World Model Signature Components

These components distinguish the product from a generic dashboard.

### 7.1 World model canvas

Purpose: explore business entities and relationships.

Rules:

- Entity type is visible through label/icon/shape, not color alone.
- Relationship labels are readable without selecting the edge whenever practical.
- Selection uses brand outline plus a clear inspector state.
- Current focus has one visual emphasis level; related neighbors have a weaker level.
- Hide or cluster low-priority edges at high density rather than producing unreadable spaghetti.
- Provide zoom/reset/fit controls with keyboard access.
- Show model scope and time context near the canvas.
- A legend appears only when encoding requires one.

### 7.2 Entity inspector

Minimum anatomy:

1. Entity name + type.
2. Current state / key metrics.
3. Relationships.
4. Evidence and provenance.
5. History / recent changes.
6. Relevant actions or scenarios.

Facts should link back to sources where possible. Inferred attributes show confidence and method. Avoid unexplained “AI says” text.

### 7.3 Evidence / provenance row

Show:

- source name,
- source type,
- observed/retrieved time,
- freshness,
- verification state,
- optional confidence for inferred data.

Evidence should be inspectable without leaving the user stranded in another context.

### 7.4 KPI / metric

Every important metric should expose enough context to interpret it:

- value,
- unit,
- time period,
- comparison baseline when shown,
- source/freshness on inspection,
- scenario label if not actual current-state data.

Do not show green `+12%` unless the product knows that increase is actually desirable.

### 7.5 Scenario / simulation control

A scenario must be visually isolated from observed reality.

Display:

- scenario name,
- changed assumptions,
- baseline,
- simulation horizon,
- confidence/uncertainty when available,
- affected entities/metrics,
- reset/revert affordance.

Never overwrite the baseline in place without a persistent indication that the user is viewing simulated state.

### 7.6 Causal / impact path

When the system claims `A → B → C`, show the chain and evidence strength. Users should be able to inspect each edge and distinguish known relationship, statistical association, expert assumption, and model inference.

### 7.7 Decision / recommendation card

An AI recommendation should contain:

- proposed action,
- expected outcome,
- rationale,
- affected scope,
- supporting evidence,
- uncertainty/risk,
- reversible vs irreversible status,
- human approval requirement.

Primary actions use verbs that describe the real effect: `Create scenario`, `Request review`, `Apply to plan`, not vague labels such as `Proceed`.

### 7.8 Timeline / event stream

Use chronological structure for changes in business state, decisions, source updates, and simulation runs.

- Differentiate event type with icon + label.
- Keep timestamps legible.
- Group noisy machine events when detail is not useful.
- Preserve access to full audit history.

### 7.9 Command / ask bar

Conversational input is one interface to the model, not the whole product.

- Place it where it can operate on the current context.
- Show current scope when a prompt will be scoped.
- Suggested prompts should be concrete analytical tasks.
- Responses should link into model entities, evidence, scenarios, and actions rather than becoming dead-end prose.

---

## 8. Data Visualization

### General rules

- Choose the visualization based on the analytical question, not visual novelty.
- Prefer direct labels to legends for small series counts.
- Show axes, units, baselines, and time windows when they materially affect interpretation.
- Zero baselines are required for bars unless a clearly labeled analytical reason justifies otherwise.
- Avoid 3D charts.
- Avoid dual axes unless the relationship genuinely requires them and the labeling is unambiguous.
- Tooltips supplement the chart; they must not contain the only access to critical values.

### Uncertainty

Forecasts should show uncertainty bands, ranges, scenario envelopes, or explicit confidence text when available. A single crisp line for an uncertain future is visually dishonest.

### Comparison

Baseline/current/scenario comparisons should remain consistent across chart, metric, table, and narrative components. Do not reverse color assignments between components.

---

## 9. Responsive Behavior

### Breakpoints

Do not treat responsive behavior as shrinking desktop pixels until they surrender.

Use content-driven breakpoints. Typical behavior:

- **Wide desktop**: nav + primary canvas + inspector can coexist.
- **Laptop/tablet landscape**: inspector collapses to a drawer or narrower pane; controls compact.
- **Tablet portrait**: prioritize one main analytical surface; secondary panels become drawers/tabs.
- **Mobile**: switch from spatial overview to task-focused sequences. Graph exploration may become entity lists + focused relationship views if the full graph is unusable.

### Touch

Interactive touch targets should generally be at least 44px even when the visible glyph/control is smaller. Compact desktop tables may use denser targets when pointer/keyboard interaction is expected, but mobile controls must not inherit that density blindly.

### Data tables

On smaller screens:

- preserve the key identifier column,
- allow horizontal scroll for genuinely tabular data,
- optionally provide a row-detail view,
- do not transform a 12-column analytical table into twelve stacked mystery labels without hierarchy.

### Graphs

On small screens, prioritize selected entity and neighborhood over showing the entire graph. Keep fit/reset controls reachable and prevent the browser viewport from fighting graph pan/zoom gestures.

---

## 10. Accessibility & Trust

Follow the explicit contrast method documented in `docs/DESIGN_SYSTEM.md` and WCAG 2.2 AA targets for text and controls.

Required behavior:

- visible keyboard focus,
- semantic controls before custom ARIA simulations,
- complete keyboard access to actions,
- labels for icon-only controls,
- reduced-motion handling,
- non-color status cues,
- meaningful empty/error/loading states,
- focus return after modal/drawer dismissal,
- accessible alternatives for graph-only information where feasible.

Trust requirements:

- Never present sample/demo data as live data.
- Never imply a simulation executed if it did not.
- Never present an inferred relationship as observed fact.
- Never hide source age when freshness changes interpretation.
- Never silently apply consequential model changes.

---

## 11. Content & Microcopy

Write like an analytical product, not a marketing page.

Prefer:

- `Revenue may miss plan by 6–9%`
- `3 source records are older than 30 days`
- `Simulate supplier delay`
- `This relationship is inferred from 18 months of order history`

Avoid:

- `Unlock powerful insights`
- `Supercharge your business`
- `AI-powered magic`
- `Revolutionize decision-making`
- vague success messages such as `Done!`

Error messages should state what failed, the effect, and the next safe action.

---

## 12. Do / Don't Guardrails

### Do

- Make the business model and its evidence more visually prominent than application chrome.
- Preserve the three semantic layers: world, runtime, applications.
- Use existing semantic tokens.
- Use whitespace to separate concepts, not to inflate simple pages.
- Prefer direct manipulation and inspectability for model objects.
- Show source, time, scope, and scenario context near important claims.
- Make selected, inferred, stale, simulated, and error states unmistakable.
- Favor tables for comparison, graphs for relationships, timelines for sequence, and narrative for explanation.
- Keep consequential actions explicit and reversible where possible.

### Don't

- Do not wrap every datum in a floating rounded card.
- Do not use glassmorphism, neon gradients, or ambient blobs as the main visual identity.
- Do not make chat the only way to navigate business information.
- Do not hide analytical context behind hover-only interactions.
- Do not animate charts or nodes continuously without informational value.
- Do not use green/red solely as “up/down” without business semantics.
- Do not fake precision in forecasts or confidence values.
- Do not mix observed and simulated data without persistent labeling.
- Do not create new one-off colors, radii, shadows, or spacing values when an existing token works.
- Do not let decorative branding consume the primary analytical canvas.

---

## 13. Agent Implementation Contract

Before editing UI:

1. Read this `DESIGN.md`.
2. Read `src/tokens.css` for current token values.
3. Read `docs/DESIGN_SYSTEM.md` for component behavior, accessibility, and governance.
4. Reuse `src/components.css` / `src/components.mjs` when a shared primitive exists.
5. Identify which semantic layer(s) the screen belongs to: World, Runtime, Applications.
6. Identify whether displayed data is observed, inferred, simulated, stale, or sample data.
7. Draft a token/component plan before introducing new visual primitives.
8. Verify desktop and narrow/mobile layouts.
9. Verify keyboard/focus behavior and reduced motion.
10. Prefer extending the shared system over local styling.

When adding a new token, document its semantic purpose and update token tests according to `docs/DESIGN_SYSTEM.md`.

When adding a signature Business World Model component, document its states, keyboard behavior, empty/error/loading behavior, data provenance expectations, and responsive behavior.

---

## 14. Quick Agent Prompt

Use the project root `DESIGN.md` as the visual contract. Preserve the existing Business World Model token system and shared components. Build an analytical workspace with calm hierarchy, visible causality, explicit provenance, and persistent distinction between observed, inferred, and simulated state. Keep the world model more prominent than product chrome. Avoid generic SaaS card grids, glassmorphism, decorative gradients, and chat-only interaction. Verify desktop/mobile behavior, keyboard focus, state clarity, and source/scenario labeling before considering the UI complete.
