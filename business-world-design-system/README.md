# Business World Agent · Design System Site

Visual + coded design-system surface extracted from the real Business World Agent product.

## Canonical inputs

- `../DESIGN.md`
- `../src/tokens.css`
- `../ui.md`
- `../eve-app/components/business-world-app.tsx`
- `../eve-app/components/world/world-canvas.tsx`

## Design-system structure

```text
Variables / Tokens
→ Classes / semantic state styles
→ Components
→ Page templates
→ Screens
→ Interactions / Flows
→ Published clickable prototype
```

The page intentionally reuses `../src/tokens.css` instead of creating an independent token source.

## Webflow status

This directory is also the code reference for the Webflow implementation. Current Webflow connector returned zero accessible sites, so Webflow Variables / Classes / Components cannot be written until a site exists in the connected workspace.

See `webflow-map.json` for the intended Webflow mapping.
