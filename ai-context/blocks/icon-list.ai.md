# Block Spec: `blockish/icon-list`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/icon-list`
- Role: parent list container for icon + text items
- Typical use: feature bullets, checklist items, benefit lists
- Can contain: only `blockish/icon-list-item` as direct children

## When AI Should Use It

Use icon-list when AI needs:
- repeated icon + label rows,
- vertical or horizontal list layout,
- consistent shared styling across all items.

Avoid icon-list for one standalone icon/text pair (use single icon + text blocks).

## Core Behavioral Notes

- Base class: `blockish-icon-list`.
- Saved structure uses `<ul>` with `icon-list-item` children (`<li>`).
- Editor enforces child type to `blockish/icon-list-item`.
- Default template starts with one icon-list-item.
- Orientation switches with `layout`:
  - `column` -> vertical
  - `row` -> horizontal

## Important Attributes (AI-Relevant)

1. List layout
- `layout` (string)
  - allowed: `column`, `row`
  - default: `column`
- `rowGap` (object by device)
  - default: `Desktop: 12px`
- `columnGap` (object by device)
  - default: `Desktop: 12px`
- `itemPadding` (object by device)
- `itemContentSpacing` (object by device)
  - default: `Desktop: 10px`

2. Shared icon style
- `itemIconSize` (object by device)
- `itemIconColor` (string)
- `itemIconHoverColor` (string)
- `itemIconHoverTransition` (number, seconds)
  - default: `0.2`

3. Shared text style
- `itemTextTypography` (string)
- `itemTextColor` (string)
- `itemTextHoverColor` (string)
- `itemTextHoverTransition` (number, seconds)
  - default: `0.2`

## Known Defaults

- `layout`: `column`
- `rowGap.Desktop`: `12px`
- `columnGap.Desktop`: `12px`
- `itemContentSpacing.Desktop`: `10px`
- `itemIconHoverTransition`: `0.2`
- `itemTextHoverTransition`: `0.2`

## Composition Rules With `icon-list-item`

1. Create `blockish/icon-list` as parent.
2. Add one or more `blockish/icon-list-item` children.
3. Use parent styles for broad consistency.
4. Use item-level styles only when per-item variation is required.

## AI Safe-Write Rules

- Do not insert non-`icon-list-item` blocks as direct children.
- Keep `layout` to `row`/`column` only.
- Prefer parent-level typography/color for consistent lists.
- Keep hover transitions subtle unless explicitly requested.

## Failure/Fallback Guidance

If icon-list layout cannot satisfy requested pattern:
- fallback to stacked rows with icon + text blocks,
- preserve item order and readability,
- mention tradeoff briefly.
