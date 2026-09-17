# Business World test mocks

This directory is the test-only mock boundary for the interactive Business World Agent. Production code must not import from `tests/mocks`.

## Included mock types

| Boundary | Helper | What it covers |
| --- | --- | --- |
| Functions/services | `createMockFunction` | call capture, one-shot/default values, rejection injection, reset |
| Business World/Eve tools | `createMockBusinessWorldService` | `plan_experiment → run_experiment → get_run → check_reliability` |
| Human approval | `createMockApproval` | deterministic approve/deny paths without bypassing the real production approval gate |
| Persistence / future DB seam | `createMockWorldRepository` | entities, runs, audit events, CRUD, snapshots, one-shot failures |
| HTTP/network | `createMockFetch`, `createMockResponse` | exact route matching, request capture, success/error responses, aborts, rejection of accidental real network |
| Browser storage | `createMockStorage` | local/session storage semantics, reset, quota/failure injection |
| Time/timers | `createMockClock` | fixed time, deterministic timers, controlled advancement |
| IDs/randomness | `createIdSource`, `createMockRandom`, `createSequence` | stable snapshots and reproducible branches |
| Environment/config | `createMockEnv` | isolated test configuration without mutating process-wide environment |
| Logs/telemetry | `createMockLogger`, `createMockTelemetry` | assertions over diagnostics/events without external services |

## Preferred setup

```js
import { createBusinessWorldTestHarness, defaultExperimentInput } from './mocks/index.mjs';

const h = createBusinessWorldTestHarness();
const input = defaultExperimentInput();
const plan = await h.businessWorld.plan_experiment(input);
h.approval.approveNext();
const run = await h.businessWorld.run_experiment(plan.runInput);
const saved = await h.businessWorld.get_run({ runId: run.runId });
h.reset();
```

Use the unified harness for flow/integration tests and the narrow helpers for unit tests. Every mutable mock exposes reset behavior so tests can remain order-independent.

## Safety boundary

The Business World result mock intentionally stays `calibrated: false` and reports that it is not reliable for real-market prediction. It mirrors the current synthetic experiment contract; it does not claim to emulate a real Postgres database, real customer data, real model inference, or production Eve execution.

The repository mock is deliberately an in-memory seam for tests. When Postgres-backed world state is implemented, production integration tests should validate Postgres separately while unit/flow tests can keep using this fast repository contract.

## CI

The root `npm test` command runs `node --test tests/*.test.mjs`, so `tests/mock-services.test.mjs` is automatically included in the existing Project Integrity gate. No new test framework or runtime dependency is required.
