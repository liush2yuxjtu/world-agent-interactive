# World Agent design system

Token version: 1.0. Explorer project: 1.1.0. Date: 2026-09-14.

## Audit before extension

The prior deliverable contained a token stylesheet inside a standalone generated HTML, but no dedicated token browser. The new app keeps its 63 values and names unchanged and exposes them as living documentation.

| Foundation | Declared tokens | Visualization |
|---|---:|---|
| Color | 26 | Swatches, reference/value copy, pairwise contrast |
| Typography | 14 | Font families, size specimens, font weights |
| Spacing | 9 | Measured gaps and scale bars |
| Radii | 6 | Corner specimens including pill |
| Elevation | 4 | Three shadows and a focus-ring specimen |
| Motion | 3 | Two durations and one easing; replay track |
| Layout | 1 | Existing sidebar-width schematic |

The catalog has no duplicate token names. The existing naming convention (`--color-*`, `--space-*`, etc.) is preserved. Original typography includes 10–12px values intended for dense prototype UI; do not assume those values are appropriate for every production context. Status colors are not inherently accessible against every background: the explorer exposes contrast results instead of altering them.

The explorer shell deliberately has its own fixed `--ds-*` styling. User edits only affect the token specimens and shared component examples. That separation prevents a bad draft from making the editor unusable. `--ds-*` values are not part of the original 63-token product system.

## Single source of truth

`src/tokens.css` is imported as CSS and fetched as source by `design-system/src/store.mjs`. The parser reads flat `:root` blocks, preserves CSS value strings, and uses the final declaration for duplicate names. It does not parse arbitrary nested CSS syntax or component-local custom properties. Introduce those only with a corresponding parser/test migration.

Preview overrides use `[data-token-scope]` and an isolated localStorage key. `CSS.supports()` validates the property appropriate to the selected token; CSS URLs and additional declarations are rejected. This is a local design playground, not a remote file editor.

## Shared component: Button

Purpose: invoke a user action. Defined by `src/components.mjs` and `src/components.css`.

| Property | Allowed values | Default |
|---|---|---|
| variant | primary, secondary, outline, ghost | primary |
| size | sm, md, lg | md |
| disabled | boolean | false |
| loading | boolean | false |
| action | application action identifier | empty |
| iconName | local icon name | empty |

States: default, hover, active, focus-visible, disabled, loading. Pinned hover/active/focus specimens are clearly labeled; live buttons also implement their native interactions. Disabled/loading render the native `disabled` attribute; loading additionally sets `aria-busy=true` and shows a reduced-motion-aware indicator.

Small/medium/large heights are component-level 32/40/48px values, not additional source tokens. Fill and text use semantic tokens. Border radius, font, weights, shadows, duration, and easing resolve through the actual shared CSS variables.

Keyboard: Enter and Space invoke native buttons. Focus is visible; disabled controls are skipped. Prefer one primary action for one decision. Do not communicate status with color alone. Supply meaningful labels for icon-only buttons.

```js
import { button } from './src/components.mjs';
button('Start simulation', { variant: 'primary', iconName: 'arrow' });
```

## Other component contracts

Forms use persistent labels, associated helper/error text, native input/select behavior, `aria-invalid`, and `aria-describedby`. The demonstration does not send entered content to a server. The switch is a native button with `role=switch` and a synchronized `aria-checked` state.

Badges expose a textual status with brand/success/warning/error semantic pairs. Cards combine surface, border, radius, space and shadow tokens; sample metrics are explicitly illustrative.

Toasts use a polite live region and do not steal focus. Native dialogs use `showModal()`, have a labeled title, close on Escape or the close button, and return focus to the trigger. The mobile inspector uses a modal drawer with inert background content and Tab containment. The desktop inspector is a complementary region.

## Color contrast method

The seven sample usage pairs are defined in `CONTRAST_PAIRS`, not automatically inferred as universal token suitability. The calculation follows the sRGB relative-luminance formula. Compare using the unrounded ratio; display two decimals only for readability.

Normal-text AA: 4.5:1. Large-text AA: 3:1. AAA normal text: 7:1. Only opaque sRGB hex colors are evaluated. No accessibility score or full-conformance claim is made.

Reference: https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html

## Governance and migration

Adding a token is non-breaking; it appears automatically after the CSS reloads. Document its semantic purpose before using it widely. Renaming or removing a token is breaking: introduce an alias first, migrate call sites, then remove the alias in a future major token version. Baseline values are not changed by the UI; exported proposals should go through source review.

The included tests assert the original 63-token baseline. When intentionally adding a source token, update the baseline assertion/count and docs in the same change. Dynamic discovery is separately tested with a new token fixture.

## Scope boundary

This commit delivers the design-system project. It does not migrate or publish the earlier standalone landing/workspace demo, provide a real simulation engine, authenticate users, or synchronize drafts across browsers. The standalone QA fixture exists only to inspect visuals inside restricted execution environments; it is excluded from the production build.
