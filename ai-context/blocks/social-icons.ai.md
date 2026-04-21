# Block Spec: `blockish/social-icons`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/social-icons`
- Role: parent list container for social profile icon links
- Typical use: social profile/footer/header link groups
- Can contain: only `blockish/social-icon-item` as direct children

## When AI Should Use It

Use social-icons when AI needs:
- a row/grid of social network links,
- consistent icon styling across social items,
- official-brand or custom color control mode.

Avoid for generic icon/text lists (use `icon-list` instead).

## Core Behavioral Notes

- Base saved class includes:
  - `blockish-social-icons`
  - `shape-<shape>`
  - `is-color-<mode>`
- Shape and color mode are validated:
  - shape: `square`, `rounded`, `circle` (fallback `circle`)
  - mode: `official`, `custom` (fallback `official`)
- Saved structure is `<ul>` with `social-icon-item` children.
- Editor enforces child block type and provides add-item appender.

## Important Attributes (AI-Relevant)

1. Layout/content
- `shape` (string)
  - allowed: `square`, `rounded`, `circle`
  - default: `circle`
- `columns` (object by device)
  - default: `Desktop: auto-fit`
  - allowed values in UI: `auto-fit`, `1..6`
- `alignment` (object by device)
  - default: `Desktop: center`
  - values: `flex-start`, `center`, `flex-end`

2. Icon color mode
- `iconColorMode` (string)
  - allowed: `official`, `custom`
  - default: `official`
- `iconColor` (string)
  - used as primary color variable in custom mode
- `iconSecondaryColor` (string)
  - default: `#FFFFFF`

3. Shared icon style
- `iconSize` (object by device)
- `iconPadding` (object by device)
- `iconSpacing` (object by device)
  - default: `Desktop: 12px`
- `iconRowsGap` (object by device)
  - default: `Desktop: 12px`
- `iconBorder`
- `iconBorderRadius` (object by device)
- `hoverAnimation` (string)
  - default: `none`
  - supported UI values include: `none`, `pulse`, `bounce`, `rubberBand`, `shakeX`, `swing`, `tada`, `wobble`, `jello`, `heartBeat`

## Composition Rules With `social-icon-item`

1. Always create `blockish/social-icons` as parent.
2. Add one or more `blockish/social-icon-item` child blocks.
3. Use parent-level style controls for shared appearance.
4. Use item-level network/link data per child.

## AI Safe-Write Rules

- Do not insert non-`social-icon-item` blocks as direct children.
- Keep `shape` and `iconColorMode` within allowed enums.
- Prefer `official` mode for brand-faithful social icons unless user asks for custom palette.
- Use moderate hover animation; avoid distracting motion unless explicitly requested.

## Failure/Fallback Guidance

If requested social layout is unsupported:
- fallback to standard row/column icon group,
- preserve network order and link intent,
- mention any simplified behavior briefly.
