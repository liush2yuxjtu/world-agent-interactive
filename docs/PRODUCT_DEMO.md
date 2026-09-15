# Product demo: separate pages, real local state

`/product-demo/` is the canonical runnable frontend. `/` remains marketing. `/app/` redirects to the new workspace, including legacy pricing/creative/channel/market hashes. `/prototype/` remains the archived visual reference. `/eli5/` is the standalone Chinese explanation.

## Correct page boundaries

- `#/experiments`: real locally stored experiment history, search, import and new experiment.
- `#/setup/1` through `#/setup/5`: configuration only; no pre-rendered results or consumer details.
- `#/results/{id}`: immutable completed run, scenario comparison, charts and actual CSV/HTML downloads.
- `#/consumer/{id}/{A|B|C}/{0..7}`: independent synthetic consumer detail and recorded events.
- `#/reports`: stored report index. Missing IDs show an explicit local-data empty state.

Only one route view is mounted. Hash routes survive refresh and browser Back on repository-subpath hosting. The reference image is a design presentation of multiple surfaces, not a runtime layout specification requiring stacked pages.

## Model and storage boundaries

`model.mjs` is an uncalibrated deterministic rule model, not trained AI or a forecast. Web Workers run three paired counterfactual schemes over 1,000, 5,000 or 10,000 synthetic people. Shared pseudorandom inputs make unchanged schemes reproducible. Price acceptance is a sigmoid of the price relative to a synthetic tolerance parameter. Budget, channel affinity and competition affect exposure. Audience, creative, season and competition affect purchasing; the repeat toggle controls subsequent purchases. Cycles are weekly, with a fractional final week.

Product name, description, category and market name are metadata only. There is no semantic text model, live data, agent social graph, real interview, backend, authentication, team access or cloud synchronization. Costs and budgets are teaching inputs. Contribution after advertising = units × (price − unit cost) − budget. ROAS = revenue / budget, not ROI. All output is explicitly labeled.

Drafts and immutable report snapshots are saved under `world-agent-product-demo-v1`, isolated from prototype keys. Incomplete drafts can be persisted. Storage failure/corruption gives an in-memory warning without silently overwriting the old record. A cross-tab storage change pauses writes to prevent clobbering. Twenty saved reports is a visible limit; old reports are never silently evicted. Deletion and draft replacement require confirmation. Configuration import is limited to 64 KiB, validated and whitelisted. Imported reports are not accepted. HTML is escaped and CSV text is formula-escaped. Downloaded HTML is a self-contained report.

## Validation

`node --test tests/product-demo.test.mjs` covers reproducibility, scenario isolation, parameter changes, accounting identities, edge durations, real progress, immutable configuration snapshots, validation, exports and storage failures.

`python tests/product_demo_browser.py` launches a real local HTTP origin and tests the complete five-step workflow, real Web Worker results, persistence through reload, report/consumer separation, browser Back, imports, downloads, parameter sensitivity, legacy routes and responsive snapshots. The cancellation UI alone uses an explicitly isolated silent Worker stub to make cancellation deterministic. All actual simulation assertions use the real worker.

Outputs: `docs/qa/product-demo/`. The existing CI uploads that directory as part of `design-system-browser-qa`. Set `BASE_URL` to the live site's root to run the same checks against deployment. No external runtime dependency or font file is added.
