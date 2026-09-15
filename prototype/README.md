# World Agent clickable prototype

Open `reference-preview/` for the side-by-side reference review, `./` for the product landing page, or `app/` for the simulation workspace.

All primary controls are HTML, CSS, and JavaScript, not a screenshot with hotspots. The product and workspace preserve the 798/738-pixel reference split. Mobile layouts are responsive adaptations because no mobile reference was supplied.

The implementation supports product editing, five setup steps, three scenarios, result tabs, metric switching, local search, scenario editing, local CSV export, dialogs, and simulation progress/cancellation. Metrics are uncalibrated demonstration fixtures. Editing prices does not run a real market model. Login uses a demo identity; the contact form only creates an unsent draft.

`reference-preview/art.mjs` reconstructs decorative image crops from the canonical reference. Hero transparency and a text-free decorative panel are preserved as small embedded WebP assets. User-interface text and controls are not rasterized. No font files are bundled.

Browser-local drafts use `world-agent-clickthrough-pages-v1`, separate from the existing `/app/` draft. Reset requires confirmation.

This directory is an additive release. Existing root pages, the Business World Model view, and the design-system explorer remain unchanged.
