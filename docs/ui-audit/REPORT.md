# Business World UI audit — 2026-09-18

## Verdict: NOT ALL PASS

**Do not merge on the strength of passing UI tests alone.** This change repairs the requested `ui.html` / `ui.md` experience in `liush2yuxjtu/world-agent-interactive`. The actual business backend is a separate project, `business-world-agent-diaper`.

The original §17.1 requirement is still **FAIL**: this UI and the actual business Agent do not yet consume and write the same verified business-state boundary. The current implementation is browser-local, explicitly manual/unverified, and is not a connected production application. The original requirement remains in `ui.md`; it has not been replaced with an easier condition.

`npm run audit:ui` intentionally returns a failure while that gate is unmet. The machine-readable decision is `audit.json`. Passing build/unit/browser checks is necessary but not sufficient.

## What was actually repaired

| Baseline failure | Repair and executable evidence |
| --- | --- |
| Clicking Persona threw `$(...).forEach is not a function`; inspector did not update | Correct iterable selection, selected inspector, real filters and keyboard tabs; actual browser regression |
| Hardcoded numbers were labelled “VERIFIED PERSISTED SOURCE”; source freshness/confidence was invented | No seeded business records; explicit unverified manual source; opt-in labelled examples; actual save time, not refresh time |
| Source edits disappeared on reload; metadata was not saved | Strict bounded seven-metric schema; source name/notes/time persist; quota/corruption handled without fake success |
| Empty input could coerce to zero | Blank/negative/non-finite/out-of-range/count-fraction validation, inline safe errors |
| “PDF” downloaded TXT and reports were not tied to a selected immutable record | Real printable selected-report document, real PDF produced by Chromium, actual OOXML PPT; same frozen source and separate notes |
| Scenario was instantaneous, lacked durable history and could overwrite displayed truth | Pending/duplicate protection, bounded named lever, explicit sensitivity assumptions, frozen baseline, saved history |
| Filters and cross-page actions were generic or incomplete | Persona/SKU/campaign filters; contextual content/product/live/persona handoffs; editable brief-to-confirmed-plan; real experiment draft |
| Share was a toast rather than a usable copy | Consent before embedding report data; read-only portable URL tested in a separate browser; explicit privacy/no-revocation/no-live-update limits |
| Mobile pages/graph/chart escaped their container | Nine expanded routes tested at 1440, 768, 390 and 320 CSS pixels; graph/table/chart own-scroll and zoom |
| Developer handoff/debug terminology appeared in product surfaces | User-facing status copy; typed public-render allowlist; private/error envelopes excluded and escaped; semantic copy and failure-state checks |
| Legacy browser suites could attach to another task's occupied default port; clipboard fallback assertion raced asynchronous completion | Dedicated random-port HTTP origin and observable clipboard completion. No other task's server was stopped. All legacy checks preserved |
| CI referenced absent `tests/intent-parity.test.mjs` | CI references existing intent tests plus the new UI suite, and enforces this audit's non-passing product gate |

The baseline JSON's original lightweight “no developer copy” and “mobile overflow” checks were insufficient: they missed visible development wording and document-level overflow. Those old PASS labels are not accepted as evidence. The strengthened suite checks both document/workspace widths and performs semantic review separately from keyword regression checks.

## Verification

See `runtime/results.json` for the final exact counts, source SHA-256 values, commit/worktree provenance, test names and errors. Tests serve the actual built `dist/ui.html` over HTTP in native Chromium, not a pasted HTML fixture and not mocked business responses. Only the quota/corruption tests deliberately inject a browser storage failure.

Commands:

```sh
npm run check
npm run test:browser
npm run test:ui
npm run audit:ui
```

Install Python requirements and Chromium as documented by `requirements-dev.txt` before browser tests. In the execution environment the interpreter is `/workspace/webapp-testing-venv/bin/python`.

- Node unit/static checks: all pass; includes the pre-existing suite plus typed UI state/render/export checks.
- Requested UI browser suite: all completed checks pass; zero uncaught JavaScript errors, zero console errors and zero external mutation requests.
- Existing suites: 27 design-system/product checks, 6 Eve feature checks and 12 product-demo checks pass. The pre-existing product-demo cancellation test explicitly uses an isolated worker stub; it is not counted as evidence of this UI's real simulation workflow.
- Export evidence: `runtime/selected-report.pdf` and `runtime/selected-report.pptx`. PDF values are checked in the rendered print document; PPT is validated as an OOXML archive containing the selected title/values/notes.
- Screenshots: all nine routes at desktop and mobile, plus `runtime/visible-copy.json` and `runtime/layout.json`. Image capture alone is not a claim that every visual design decision was independently approved.

## Developer-audit

Rule source: ChatGPT Work Hub / Shared Context / `recVAMDkF3q0WZYnT`, Developer Artifact Leakage rubric. This is a rule-based assessment of the requested UI, not an independent human approval or a review of every other project route.

| Category | Score / 2 | Evidence |
| --- | ---: | --- |
| Developer/internal vocabulary | 2 | All nine rendered copies reviewed; product limitations use user-facing outcomes |
| Internal identifiers | 2 | No rubric/build/trace IDs exposed; business SKU values remain legitimate product content |
| Design/eval acceptance criteria | 2 | Criteria live in this report and `ui.md`, not product panels |
| Instructions/prompts | 2 | No system/developer instructions displayed |
| Reasoning/planning | 2 | No internal reasoning or development plans displayed |
| Tool/protocol envelopes | 2 | No raw protocol/data-envelope rendering; allowed fields only |
| Debug/error traces | 2 | Storage corruption and quota failures produce useful sanitized messages; internal sentinel not visible |
| Roadmap/fake implementation state | 2 | Manual records, examples, estimates, portable copies and unsent drafts clearly distinguished; no provider-verification fiction |
| Structured rendering boundary | 2 | Explicit user audience / render visibility / product copy-data-progress allowlist, unknown types fail closed; escaping tests |
| Browser evidence | 2 | Real HTTP workflow, selected details, dialogs, persistence, exports, sharing, responsive and failure-state tests |

**Assessment: CLEAN, 20/20, PASS for this UI's developer-artifact leakage checks.** The separate intent/product-state failure still overrides overall completion.

## Remaining required work — not waived

**§17.1: UI and actual Agent must share the real business-state boundary.** This change does not prove provider ingestion, observed/inferred audience derivation, calibrated forecasting, server-side shared persistence, cross-user access control or actual email delivery. To close the failed gate, implement the shared adapter and exercise a real two-way read/write flow through the UI and actual Agent with matching state identity/revision/source provenance; then rerun both audits and attach the evidence. Do not substitute mocks, a manually toggled “verified” flag, or a successful frontend build.

The read-only URL is a portable report copy, not an authenticated or revocable server share. Email is an explicitly addressed unsent draft. External platform writes are not performed. These product limitations are visible before user action.

## Dependency and change control

PptxGenJS 4.0.1 is vendored from its official npm package, MIT licensed, local-only at runtime. Bundle SHA-256 is recorded in `src/vendor/README.md`. No credentials, user account data, environment files or fonts are included in this change.

Changes belong on a review branch. Main/production deployment and final human MERGE/NO MERGE are not approved by this audit.

## Upstream reconciliation

During the audit, upstream added `44c3584`, `54e9f01`, `abf01d7` and `3f29aef`. The candidate is based on `3f29aef`. Its non-conflicting visual polish and hash-link compatibility are retained; the generic prototype dialogs, fake save/export feedback and selector defects are replaced by the tested stateful flows. The added §19 click contract is retained and updated to describe actual behavior.
