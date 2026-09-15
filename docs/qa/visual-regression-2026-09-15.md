# World Agent Visual Regression · 2026-09-15

Golden reference: `references/world-agent-reference.png` (1536×1024).

## Method

- TinyFish real-browser smoke screenshots at the landing page and `/app/`.
- Local deterministic render of the production markup at 768×1024 per surface.
- Side-by-side composite normalized to 1536×1024.
- OpenCV pixel statistics plus SSIM for structural context.

## Before → After

| Metric | Before | After | Direction |
|---|---:|---:|---|
| Mean absolute error | 0.18047 | **0.15376** | lower is better |
| RMSE | 0.32544 | **0.29708** | lower is better |
| Edge IoU | 0.02568 | **0.05213** | higher is better |
| SSIM | 0.50868 | 0.49597 | see note |

SSIM is not used alone because the reference contains rasterized/generative faces, product photography and text while the implementation uses live DOM text and reusable UI. Geometry-sensitive edge overlap roughly doubled, while absolute pixel error and RMSE both improved.

## Fixes made

- Preserve two-column marketing hero at reference-sized tablet/half-page width instead of collapsing early.
- Keep the experiment sidebar visible in the same visual regime as the golden reference.
- Add dense search/user chrome and five-step experiment hierarchy.
- Add product, consumer, world-hero and mountain-CTA visual assets derived from the versioned reference.
- Tighten spacing/card density to fit the same 1024px comparison canvas.
- Add result tabs, consumer journey and social-network evidence strip.
- Keep the real `/api/simulate` Monte Carlo backend and explicit “un-calibrated mechanism demo” disclaimer.

## Remaining intentional differences

A pixel-perfect score of 1.0 is neither expected nor desirable: the golden image is a generated concept frame, while the product is responsive HTML with editable controls, accessible text, and a functioning backend. Future changes should minimize geometry/color drift without rasterizing the whole application.
