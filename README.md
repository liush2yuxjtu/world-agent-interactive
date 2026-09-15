# World Agent · Product Demo + Design System

A multi-file World Agent frontend with a Chinese product landing page, a click-through market-simulation workspace, and a live explorer for the shared `src/tokens.css`.

**Open the product:** [World Agent](https://liush2yuxjtu.github.io/world-agent-interactive/) · [Experiment workspace](https://liush2yuxjtu.github.io/world-agent-interactive/app/) · [Business World Model Preview](https://liush2yuxjtu.github.io/world-agent-interactive/business-world-model/) · [Design System Explorer](https://liush2yuxjtu.github.io/world-agent-interactive/design-system/)

This is a real frontend project rather than a self-contained HTML mockup. It has a development server with live reload, separate ES modules and stylesheets, shared design tokens, a production build, browser-tested interactions, and CI. Product numbers and simulation output are clearly labeled demo data.

## Run locally

Node.js 20 or newer is required. There are no npm dependencies to install.

```bash
git clone https://github.com/liush2yuxjtu/world-agent-interactive.git
cd world-agent-interactive
npm run dev
```

Open `http://127.0.0.1:4173/` for the landing page, `/app/` for the experiment workspace, or `/design-system/` for the token explorer. Editing `src/tokens.css` reloads every surface automatically. The `file://` protocol is not supported because the explorer fetches its shared stylesheet over HTTP.

```bash
npm test          # pure token / component unit tests
npm run build     # produce the complete static site in dist/
npm run preview   # serve dist/ on the same local port
```

Stop the development server before starting preview on the same port. Set `PORT=4174` to use a different port. Default binding is loopback only; set `HOST` deliberately when LAN access is needed.

## Explore

The explorer discovers all 63 current token declarations directly from `src/tokens.css`, rather than storing a second hand-maintained list. It groups them into color, typography, spacing, radii, elevation, motion, and layout. Adding a new flat `:root` custom property automatically adds it to the catalog.

Select a card to open the inspector. Search by token name or value, switch between grid and table views, copy a `var(--token)` reference, or enter a new value and apply it to previews. The component gallery covers buttons, forms, badges, cards, a switch, toasts, and dialogs. A small product example demonstrates how one brand token affects several components.

### Safe preview editing

Edits are validated with `CSS.supports()`, restricted to known tokens, and applied only inside `[data-token-scope]`. The explorer shell remains stable. Valid drafts persist under the browser-local key `world-agent-design-system-overrides-v1` when storage is available.

**The inspector does not overwrite the repository or `tokens.css`.** Export CSS to produce a complete proposed token file, or export JSON from Source. Apply the exported CSS to `src/tokens.css` through your normal code-review process. Reset restores the current source values and only clears this explorer's draft key.

### Contrast checks

The Accessibility page evaluates seven explicit foreground/background pairs. Opaque 3- or 6-digit sRGB hex values are supported. Pass/fail uses the unrounded ratio: 4.5:1 for normal text AA and 3:1 for large text AA. Non-hex colors, transparency, gradients, imagery, and complete WCAG conformance are not evaluated. Existing source values are not silently “fixed.”

## Project structure

```text
world-agent-interactive/
├── package.json
├── index.html                    # Chinese product landing page
├── app/                          # click-through experiment workspace
├── src/
│   ├── tokens.css                # original World Agent token values
│   ├── components.css            # shared token-driven UI primitives
│   ├── components.mjs            # safe component render helpers
│   ├── marketing.css             # landing-page layout and responsive rules
│   ├── marketing.mjs             # landing-page interactions
│   └── icons.mjs                 # local inline SVG icon library
├── design-system/
│   ├── index.html                # app entry; external CSS and JS
│   └── src/
│       ├── app.mjs               # routing, events, dialogs, exports
│       ├── views.mjs             # token catalog and component pages
│       ├── tokens.mjs            # parser, categorization, contrast
│       ├── store.mjs             # source loading and local drafts
│       └── explorer.css          # responsive documentation shell
├── scripts/                      # local server and production build
├── tests/                        # unit tests and Playwright browser QA
├── docs/DESIGN_SYSTEM.md          # audit, component contract, governance
├── docs/PRODUCT_PATTERNS.md       # product patterns, states, accessibility
└── .github/workflows/ci.yml       # build + browser QA and snapshots
```

## Browser QA and snapshots

Browser QA uses Python only as a development tool. It is not part of the site runtime.

```bash
python -m pip install -r requirements-dev.txt
python -m playwright install chromium
npm run test:browser
```

The test starts the real HTTP server, runs the multi-file application, checks token editing and source preservation, verifies reload persistence and actual CSS downloads, and captures desktop/mobile screenshots in `docs/qa/`. CI uploads those captures as `design-system-browser-qa`. `BASE_URL` can point the same test at an already running or deployed instance.

`OFFLINE_FIXTURE=1` is an explicitly limited QA fallback for managed browsers that prohibit all URL navigation. It renders the same source in memory and skips actual download/reload checks. The fixture is not shipped in `dist/` and is not a single-file app deliverable.

## Hosting

`npm run build` produces a static site with relative asset URLs. Deploy the **whole** `dist/` directory, not just `index.html`. GitHub Pages can also serve this dependency-free project's root directly using the included `.nojekyll` file. Hash routes remain compatible with repository subpaths.

No account, paid backend, analytics, font CDN, remote icon library, or external API is required. Preview consumer/market numbers are fictional UI examples, not forecasts.

## Design reference

The source values were recovered from the previous World Agent frontend artifact. Documentation and extension follow the user's `DESIGN_SYSTEM` reference:

- [Anthropic design-system skill](https://github.com/anthropics/knowledge-work-plugins/blob/main/design/skills/design-system/SKILL.md)
- [W3C contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)

No font files are bundled or distributed.
