# Visual QA

Browser captures are produced by `npm run test:browser` and uploaded by CI as the `design-system-browser-qa` artifact. They are not committed as large binary files. Product QA adds `09-product-landing-desktop.png`, `10-product-workspace-desktop.png`, and `11-product-workspace-mobile.png`; the canonical reference remains `references/world-agent-reference.png`.

The initial screenshot was reviewed and refined. Adjustments included mobile line-break spacing, a stable editor shell during preview edits, mobile drawer focus containment, and removing stale toasts/hover states from final viewport captures. Token names and source values were not changed.

The current project includes 22 Node unit tests. The design-system browser suite has 20 checks in the explicit in-memory fallback and two additional real-origin checks for reload persistence and CSS downloads. Real-origin runs also cover the landing page, experiment navigation, simulation result flow, canonical PNG dimensions, and mobile workspace. Consult the generated `browser-results.json` for the actual run mode and outcome; the existence of a test does not assert it has passed.

Source-of-truth check: the suite hashes `src/tokens.css` before and after interactions and confirms the file was not changed by preview editing.
