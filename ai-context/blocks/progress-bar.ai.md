# Block Spec: `blockish/progress-bar`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/progress-bar`
- Role: animated completion/progress indicator with optional title and inline text
- Typical use: skill levels, completion rates, KPI progress display
- Can contain: no inner blocks

## When AI Should Use It

Use progress-bar when AI needs:
- a percentage-based visual progress indicator,
- optional heading/title + inline label,
- animated fill from 0 to target percentage.

Avoid using it when value is not percentage-based or when no visual bar is needed.

## Core Behavioral Notes

- Wrapper class: `blockish-progress-bar`.
- Progress fill class: `blockish-progress-bar__fill`.
- Percentage is clamped to `0..100` in edit/save/frontend logic.
- Saved frontend starts fill width at `0%` and animates to target when visible.
- Frontend animation uses `IntersectionObserver` threshold around `0.35`.
- Frontend animates once per view event (observer unobserves after first intersection).

## Important Attributes (AI-Relevant)

1. Content / behavior
- `showTitle` (boolean)
  - default: `true`
- `title` (string)
  - default: `Progress`
- `titleTag` (object `{label,value}`)
  - default: `{ label: "H4", value: "h4" }`
  - allowed values in UI: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span`, `div`
- `percentage` (number)
  - default: `50`
  - UI range: `0..100`
- `animationDuration` (number, seconds)
  - default: `2`
  - UI range: `0..10`
- `displayPercentage` (boolean)
  - default: `true`
- `innerText` (string)
  - default: `Web Deigner` (current block default)

2. Bar style
- `percentageFillColor` (string)
- `percentageBackgroundColor` (string)
- `percentageHeight` (object by device)
- `percentageBorderRadius` (object by device)

3. Title style
- `titleTextColor`
- `titleTypography`
- `titleTextStroke`
- `titleTextShadow`

4. Inner text/percentage style
- `innerTextColor`
- `innerTextTypography`
- `innerTextStroke`
- `innerTextShadow`

## Known Defaults

- `showTitle`: `true`
- `title`: `Progress`
- `titleTag.value`: `h4`
- `percentage`: `50`
- `animationDuration`: `2`
- `displayPercentage`: `true`
- `innerText`: `Web Deigner`

## AI Safe-Write Rules

- Keep `percentage` within `0..100`.
- Keep `animationDuration` non-negative and practical.
- If `showTitle` is false, avoid forcing title styles as critical output.
- If `displayPercentage` is false, ensure `innerText` still conveys meaning.
- Preserve readability: fill/background contrast must remain clear.

## Failure/Fallback Guidance

If animated fill is not appropriate:
- set `animationDuration` to `0` for immediate state,
- keep same value/content semantics,
- preserve title + inner text clarity.
