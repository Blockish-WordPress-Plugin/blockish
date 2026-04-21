# Block Spec: `blockish/container`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/container`
- Role: primary layout wrapper for sections and nested structures
- Typical use: hero wrappers, columns, grouped content, flex/grid parent
- Can contain: inner blocks (including nested `blockish/container`)

## When AI Should Use It

Use container when AI needs:
- a parent section wrapper,
- responsive row/column layout,
- controlled width behavior (`alignfull`, custom max width),
- spacing/gap and alignment management for children.

Avoid container-only outputs when user requests a complete section with content.
In that case, container should wrap content blocks (heading/text/button/image).

## Core Behavioral Notes

- Container output tag is dynamic via `tagName.value` (default `div`).
- Main CSS class in saved markup: `blockish-container`.
- Layout class is derived from `display`:
  - `layout-type-flex` (default)
  - `layout-type-grid`
- Grid subtype class appears only when `display = grid`:
  - `grid-layout-type-auto`
  - `grid-layout-type-fixed`

## Important Attributes (AI-Relevant)

Responsive note:
- Most container layout/style controls are responsive objects using `Desktop`/`Tablet`/`Mobile`.
- For select/toggle-style responsive controls, preserve `{ label, value }` shape when present.
- Follow canonical storage rules from `global/advanced-controls.ai.md` section `4.1`.

1. Structure/Activation
- `isVariationPicked` (boolean)
  - Must be `true` for normal configured container behavior.
  - If false at top-level parent, editor may show variation placeholder flow.

2. Width + Sizing
- `containerWidth` (string)
  - default: `alignfull`
  - use `align-custom-width` + `customWidthContainer` for explicit width control.
- `customWidthContainer` (object by device)
  - example keys: `Desktop`, `Tablet`, `Mobile`
- `containerMinHeight` (object by device)

3. Layout Engine
- `display` (string): `flex` or `grid`
  - default: `flex`

Flex-related:
- `flexDirection` (object by device)
- `flexWrap` (object by device)
- `justifyContent` (object by device)
- `alignItems` (object by device)

Grid-related:
- `gridLayoutType` (string): `auto` or `fixed`
- `autoGridWidth` (object by device)
- `autoGridHeight` (object by device)
- `gridColumns` (object by device)
- `gridRows` (object by device)

Shared gap controls:
- `columnGap` (object by device)
- `rowGap` (object by device)

4. Visual Style Controls
- Background:
  - `containerBackground`
  - `containerHoverBackground`
- Border:
  - `containerBorder`
  - `containerHoverBorder`
  - `containerBorderRadius`
  - `containerHoverBorderRadius`
- Shadow:
  - `containerBoxShadow`
  - `containerHoverBoxShadow`
- Other:
  - `overflow`

## Known Defaults (from current block config)

- `display`: `flex`
- `containerWidth`: `alignfull`
- `gridLayoutType`: `auto`
- `autoGridWidth.Desktop`: `12rem`
- `gridColumns`: Desktop 3 / Tablet 2 / Mobile 1
- `gridRows.Desktop`: 1
- `flexDirection.Desktop`: `row`
- `justifyContent`: center on Desktop/Tablet/Mobile
- `alignItems`: center on Desktop/Tablet/Mobile

## Variation/Nesting Notes

Container supports predefined column-style variation setups (e.g., 50-50, 33-33-33, 25-25-25-25).
AI can mimic these by nesting containers and setting custom widths/flex rules directly, even without variation UI actions.

Nested container behavior:
- child containers typically should be `isVariationPicked: true`
- inner wrappers can use `containerWidth: align-custom-width` with device-based width values

## Hero Section Composition (Recommended)

For a standard hero:
1. Root `blockish/container`
- `isVariationPicked: true`
- `display: flex`
- vertical spacing + background as needed

2. Optional inner `blockish/container` for constrained content width
- `containerWidth: align-custom-width`
- `customWidthContainer.Desktop`: e.g. `1140px` or percentage by design system

3. Content blocks inside:
- heading
- paragraph/text
- button
- optional image/media block

## AI Safe-Write Rules

- Always apply global advanced-control rules from `global/advanced-controls.ai.md` first.
- Only set attributes documented in this file.
- Keep responsive objects consistent (`Desktop/Tablet/Mobile`) when writing device-aware values.
- Do not switch to grid attributes unless `display` is `grid`.
- Do not rely on placeholder variation UI in automation; write direct attributes/inner blocks.
- If design cannot be achieved by container/global controls, use `customCss` fallback rules from global doc sections `9` and `10`.

## Failure/Fallback Guidance

If requested layout is too complex:
- fallback to flex container + nested containers,
- preserve content hierarchy first,
- then apply spacing and alignment,
- explain tradeoff briefly to user.

## User-Facing Explain Style (Suggested)

When reporting changes, AI should say:
- which container(s) were created,
- what layout model was used (flex/grid),
- what responsive behavior was applied,
- what user-facing result changed (spacing, alignment, section width).
