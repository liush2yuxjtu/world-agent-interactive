# Business World Model Reality Audit — 2026-09-16

## Executive summary

The repository currently contains **three different levels of “real”**:

1. **`/product-demo/` is a genuinely runnable browser product demo.** Its routing, forms, Web Worker computation, report history, reload persistence, import/export, downloads, and browser tests are real. However, its data is synthetic and its persistence is browser-local (`localStorage`), not server/database persistence.
2. **`/business-world-model/` is a visual/interaction prototype.** Scenario changes and inspector interactions are real UI behavior, but the business entities, source labels, forecasts, and scenario outputs are hard-coded JavaScript objects. “Run scenario” is a timed UI transition, not a backend calculation.
3. **`eve-app/` contains a real Eve agent runtime boundary.** It is configured with Eve and an OpenAI model, has native approval-gated tools, and can run as a real Next.js/Eve application when model access is configured. The business experiment itself is still a deterministic synthetic function, and there is no Postgres-backed Business World state.

**Conclusion:** the project is beyond a static mockup, but the current preview should **not** be described as a fully real, database-backed, editable Business World product yet.

---

## Status legend

- **REAL** — executes real application/runtime behavior.
- **LOCAL-REAL** — real behavior, but only in the current browser/device.
- **SYNTHETIC** — computation runs, but over invented/demo data or deterministic demo rules.
- **STATIC** — hard-coded presentation data or UI-only behavior.
- **MISSING** — required production capability is not implemented.

## Reality matrix

| Capability | Current status | Evidence / current behavior | What is still required |
| --- | --- | --- | --- |
| Product navigation / routes | REAL | `/product-demo/` uses independent setup/results/consumer/report routes; PR #4 adds Chinese Next.js routes | Keep one canonical production app and retire duplicate surfaces over time |
| Product demo form workflow | REAL | Five-step setup, validation, browser navigation, tests | Connect submitted entities/config to server-side state |
| Simulation execution | SYNTHETIC | Product demo uses a real Web Worker; Eve tools execute deterministic synthetic formulas | Replace/augment with calibrated models and/or real observed data |
| Product demo persistence | LOCAL-REAL | `world-agent-product-demo-v1` in `localStorage`; survives browser reload | Postgres persistence, server IDs, account ownership, concurrency |
| Business World canvas | STATIC | `business-world-model/app.js` contains hard-coded `scenarios` and `entities` objects | Query a shared World Model API / database |
| “Run scenario” in static world UI | STATIC | Button disables, waits ~650ms, then shows a toast | Real job/API execution with persisted run status and output |
| Business data sources | STATIC | Labels such as Salesforce, Workday, Snowflake are presentation strings | Real ingestion/connectors, source records, freshness, provenance |
| Entity inspector | STATIC | Reads values from in-memory hard-coded objects | Read entity from Postgres; include version/source metadata |
| Real Edit / Save | MISSING | No database-backed CRUD path for Business World entities | Editable forms → validation → API → Postgres → revalidation |
| Persistence after another browser/session | MISSING | Browser-local demo only | Server persistence and authentication/tenant ownership |
| Postgres | MISSING | No `DATABASE_URL`, `postgres`, `pg`, Prisma, or Drizzle integration found | Add schema, migrations, DB access layer, seed/dev fixtures |
| Eve agent runtime | REAL runtime boundary | `eve-app/agent/agent.ts` uses `defineAgent`; Eve native approval tooling exists | Production auth, world-data tools, deployment/model access verification |
| LLM model configuration | REAL config, deployment-dependent | Agent model is `openai/gpt-5.6-sol` | Verify production credentials/model access and runtime observability |
| Eve experiment tool | SYNTHETIC | `run_experiment.ts` computes deterministic formulas | Ground inputs in persisted world facts and store runs/results |
| Eve run retrieval | SYNTHETIC / non-persistent | `get_run.ts` reconstructs input by decoding `runId` and recomputes | Persist run + result in Postgres and load by server-side run ID |
| Eve conversation/session | REAL via Eve boundary | Design explicitly delegates durable session/approval lifecycle to Eve | Introduce product account/session identity and authorization |
| AI grounded in Business World | MISSING | Current tools focus on plan/run/get/reliability synthetic experiments | Eve tools for querying entities, metrics, evidence, relationships, events |
| AI write operations | MISSING | No database-backed edit tool | Approval-gated mutation tools with audit log and optimistic concurrency |
| Authentication | MISSING for public product | Eve channel currently uses anonymous `none()` auth; protected preview limits exposure | Real sign-in/session and tenant authorization before public launch |
| Audit trail for edits | MISSING | No server-side mutation log | Append-only audit event per create/update/delete/tool mutation |
| Source-of-truth unification | PARTIAL | Screen structure is being consolidated; runtime data still has multiple demo stores | One World Data Source of Truth feeding Screens, Flow, Viewer, and Eve |

---

## Answer to the core question

### Is the current preview “fully clickable”?

**Mostly at the UI/product-demo level, yes.** The product demo has real browser behavior and the Eve PR #4 preview is a real Next.js application build.

That does **not** mean every control is backed by a production service. For example, the static Business World “Run scenario” interaction is UI-only.

### Is the data real?

**No.** The repository is explicit that the current experiment data is synthetic and uncalibrated. The static Business World surface also presents hard-coded business values and source labels.

### Is Edit real and persistent?

**No.** There is currently no Postgres-backed Business World CRUD flow. Browser-local product-demo state survives reload, but it is not shared/server persistence.

A feature should only be labeled “real edit” after this test passes:

```text
Open entity
→ edit field
→ PATCH/PUT server API
→ validate
→ UPDATE Postgres
→ return persisted version
→ refresh page
→ value remains
→ open another browser/session
→ authorized user sees same value
```

---

## Current Eve reality

The repository already has the correct foundation for the requested AI architecture:

```text
Next.js UI
   ↓
Eve agent runtime
   ↓
Eve approval lifecycle
   ↓
Agent tools
   ↓
Business operations
```

This is preferable to replacing Eve with a separate ad-hoc `/api/chat` implementation.

What is missing is the **Business World tool layer** beneath Eve:

```text
Eve
 ├─ get_entity
 ├─ list_entities
 ├─ query_metrics
 ├─ get_relationships
 ├─ get_evidence
 ├─ create_scenario
 ├─ run_experiment
 ├─ update_entity       ← approval required
 └─ record_decision     ← approval/audit policy
          ↓
      Postgres
```

The current `run_experiment` / `get_run` pair should also stop using an encoded configuration as the durable run identity once Postgres is introduced.

---

# Phase 2 — Make It Real

## Chosen stack

- **Application:** existing `eve-app` (Next.js)
- **AI runtime/orchestration:** **Vercel Eve** already present in the repository
- **Database:** **Postgres**
- **Data access:** small server-only repository layer (portable standard Postgres connection via `DATABASE_URL`)
- **Validation:** Zod (already in `eve-app`)
- **Deployment:** Vercel preview first; no merge until explicitly approved

## Minimal Postgres model

Start with a narrow schema rather than attempting the complete ontology immediately:

```text
organizations
world_entities
world_relationships
metric_observations
source_records
scenarios
experiment_runs
experiment_results
world_events
audit_events
```

Recommended entity pattern:

```text
world_entities
- id uuid pk
- organization_id uuid
- entity_type text
- name text
- attributes jsonb
- observed_at timestamptz
- source_record_id uuid nullable
- version bigint
- created_at timestamptz
- updated_at timestamptz
```

Use JSONB for evolving domain attributes, but keep ownership, identity, timestamps, versioning, provenance, and relationships relational.

## First vertical slice

Do **one complete path** before expanding the ontology:

```text
Postgres
  ↓
Company / business entity row
  ↓
GET /api/world/entities/:id
  ↓
World entity screen
  ↓
Edit
  ↓
PATCH /api/world/entities/:id
  ↓
Postgres transaction + audit event
  ↓
Refresh and read persisted value
  ↓
Ask Eve about this entity
  ↓
Eve get_entity/query_metrics tools read the same Postgres row
  ↓
Answer cites current persisted world state
```

### Definition of done for the vertical slice

1. One seeded business entity exists in Postgres.
2. UI reads it from the server, not from a constant.
3. User can edit at least one real field.
4. Save writes Postgres and increments `version`.
5. Refresh retains the edit.
6. Invalid edits are rejected server-side.
7. Mutation creates an `audit_events` row.
8. Eve can query the same entity through a server-side tool.
9. Eve cannot modify it without an explicit approval-gated mutation tool.
10. Browser/E2E test proves persistence across reload.

---

## Priority order

### P0 — Required before calling the product “real-data editable”

- Postgres connection and migrations
- Entity read API
- Entity update API
- Real edit UI
- Persisted audit events
- E2E persistence test
- Eve read tools grounded in Postgres
- Authentication/authorization before removing deployment protection

### P1 — Required for a credible Business World MVP

- Relationships and events
- Metric observation history
- Evidence/source records and freshness
- Persisted scenarios and experiment runs
- Eve evidence/metric/relationship tools
- Optimistic concurrency/version conflicts
- Organization/tenant boundary

### P2 — Required for live operating data

- Actual source connectors/ingestion
- Scheduled sync / webhooks
- Provenance and reconciliation
- Real calibration/evaluation datasets
- Background jobs and run monitoring

---

## Deployment state observed during audit

- GitHub main commit inspected: `4926d774a055bfc2048de5b6f861ff494d34dfdc`.
- PR #4 (`Build Chinese Eve Business World app`) is **closed and unmerged**.
- Its dedicated Vercel project `business-world-model-eve-pr4` currently has a **READY** deployment.
- That preview remains protected, which is appropriate while the Eve channel uses anonymous demo auth.
- The separate `world-agent-eve` project has a previous READY production deployment, while some later attempts are in ERROR state; do not treat “latest deployment attempt” as equivalent to a healthy promoted production release.

## Product claim to use today

Accurate:

> A working interactive Business World prototype with a real Eve agent runtime path and real browser-side experiment workflows, currently using synthetic model data and local persistence.

Not accurate yet:

> A fully database-backed Business World with real business data, durable shared edits, and AI grounded in live enterprise state.
