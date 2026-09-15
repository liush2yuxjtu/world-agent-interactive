# World Agent product patterns

This extension applies the shared World Agent design tokens to two product surfaces: the public landing page and the experiment workspace. The canonical visual direction is `references/world-agent-reference.png`.

## Pattern: product landing page

### Purpose

Explain the value of a consumer-world simulation in one screen, then move a visitor into a working demonstration.

### States and behavior

| Element | Default | Interaction |
|---|---|---|
| Primary CTA | Brand fill | Opens `/app/` |
| Product video | Secondary action | Opens a native modal dialog |
| Feature card | White surface | Raises and reveals the experiment link on hover |
| Mobile navigation | Collapsed | Menu button toggles the navigation and `aria-expanded` |

### Tokens

Brand, text, muted text, surfaces, borders, radii, card/button shadows, focus ring, durations, and easing all resolve through `src/tokens.css`. Product artwork uses gradients derived from the brand and chart colors.

## Pattern: experiment workspace

### Purpose

Let a user configure a product experiment, compare three schemes, run a deterministic click-through simulation, and inspect the result from several evidence views.

### Flow

1. Product settings
2. Target audience
3. Market environment
4. Scheme design
5. Run settings
6. Simulation progress and result evidence

The workspace keeps one primary action per step. Every step can also be selected directly for demonstration. The three scheme cards behave as a single selection; result tabs expose summary, audience, market, social, financial, and comparison views.

### Accessibility

- Native buttons, inputs, selects, range controls, progress, tabs, and dialog elements preserve keyboard behavior.
- The stepper and result switcher use tab roles with `aria-selected`.
- Loading state exposes a labeled native progress element.
- Toast feedback uses a polite live region.
- The mobile sidebar has a labeled menu button.
- Reduced-motion preferences remove transitions and animated scrolling.
- Color is paired with text labels in scheme, chart, status, and result displays.

## Scope

This is a click-through frontend. Inputs affect the visible demo state, and the simulation produces deterministic example data. There is no authentication, remote persistence, billing, or predictive market model in this release.
