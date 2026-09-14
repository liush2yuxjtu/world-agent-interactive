# Visual QA

Browser captures are produced by `npm run test:browser` and uploaded by CI as the `design-system-browser-qa` artifact. They are not committed as large binary files.

The initial screenshot was reviewed and refined. Adjustments included mobile line-break spacing, a stable editor shell during preview edits, mobile drawer focus containment, and removing stale toasts/hover states from final viewport captures. Token names and source values were not changed.

The current project includes 22 Node unit tests. The browser suite has 20 checks in the explicit in-memory fallback and two additional real-origin checks for reload persistence and CSS downloads. Consult the generated `browser-results.json` for actual run mode and outcome; the existence of a test does not assert it has passed.

Source-of-truth check: the suite hashes `src/tokens.css` before and after interactions and confirms the file was not changed by preview editing.
