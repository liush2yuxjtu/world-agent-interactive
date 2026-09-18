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

## Penpot handoff

`penpot-map.json` maps the same system into Penpot as Pages → Token Sets → Components / Variants → Templates → Screens → Flows → Runtime Truth.

The current ChatGPT Penpot MCP session must have a Penpot project connected before these structures can be written into the canvas. The mapping is committed now so the visual implementation and code implementation share one contract.

## Webflow status

This directory is also the code reference for the Webflow implementation. Current Webflow connector returned zero accessible sites, so Webflow Variables / Classes / Components cannot be written until a site exists in the connected workspace.

See `webflow-map.json` for the intended Webflow mapping.
