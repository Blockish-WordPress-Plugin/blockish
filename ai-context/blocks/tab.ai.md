# Block Spec: `blockish/tab`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/tab`
- Role: parent tab container with tab navigation + tab panels
- Typical use: segmented content sections, FAQ-style grouped content, settings/content toggles
- Can contain: only `blockish/tab-item` as direct children

## When AI Should Use It

Use tab when AI needs:
- multiple content panels in one compact area,
- clickable tab navigation to switch panels,
- one default active tab with optional per-tab icon/title.

Avoid tab when all sections must remain visible simultaneously.

## Core Behavioral Notes

- Wrapper class: `blockish-block-tab`.
- Layout class includes direction variant: `is-direction-<value>`.
- Saved markup contains:
  - empty nav container (`.blockish-block-tab-nav`) that frontend script populates,
  - tab items wrapper (`.blockish-block-tab-items`) with `tab-item` children.
- Frontend script:
  - builds nav buttons from tab-item data attributes (`data-title`, `data-icon-*`),
  - toggles active panel via `hidden` attribute,
  - uses `data-default-tab` unless an item has `data-default-active="true"`.

## Important Attributes (AI-Relevant)

1. Layout/interaction
- `direction` (object by device)
  - default: `Desktop: column`
  - UI values: `column`, `column-reverse`, `row`, `row-reverse`
- `justify` (object by device)
  - default: `Desktop: flex-start`
  - values: `flex-start`, `center`, `flex-end`, `space-between`
- `alignTitle` (object by device)
  - default: `Desktop: left`
  - values: `left`, `center`, `right`
- `defaultActiveTab` (number)
  - default: `0`

2. Spacing
- `navGap` (object by device)
  - default: `Desktop: 10px`
- `distanceFromContent` (object by device)
  - default: `Desktop: 10px`

3. Tab button style (normal/hover/active)
- `tabsBackgroundNormal`, `tabsBackgroundHover`, `tabsBackgroundActive`
- `tabsBorderNormal`, `tabsBorderHover`, `tabsBorderActive`
- `tabsBoxShadowNormal`, `tabsBoxShadowHover`, `tabsBoxShadowActive`
- `tabsBorderRadius` (object by device)
- `tabsPadding` (object by device)

4. Title style (normal/hover/active)
- `titleTypography`
- `titleColorNormal`, `titleColorHover`, `titleColorActive`
- `titleTextShadowNormal`, `titleTextShadowHover`, `titleTextShadowActive`
- `titleTextStrokeNormal`, `titleTextStrokeHover`, `titleTextStrokeActive`

5. Icon style (normal/hover/active)
- `iconPosition` (object by device)
  - default: `Desktop: row`
  - UI values: `row-reverse` (left), `row` (right)
- `iconSize` (object by device)
- `iconSpacing` (object by device)
- `iconColorNormal`, `iconColorHover`, `iconColorActive`

6. Panel content style
- `contentBackground`
- `contentColor`
- `contentBorder`
- `contentBorderRadius` (object by device)
- `contentPadding` (object by device)

## Composition Rules With `tab-item`

1. Create `blockish/tab` as parent.
2. Add one or more `blockish/tab-item` children.
3. Each tab item should have title (and optional icon).
4. Ensure one sensible default active tab.

## AI Safe-Write Rules

- Do not insert non-`tab-item` direct children.
- Keep `defaultActiveTab` in valid index range.
- Use parent-level style controls for consistent tab UI.
- Avoid removing item title data; nav relies on it.

## Failure/Fallback Guidance

If tabs are not appropriate or fail constraints:
- fallback to accordion or stacked sections,
- preserve panel order/content hierarchy,
- note interaction model change briefly.
