# Block Spec: `blockish/counter`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/counter`
- Role: animated numeric statistic with optional title
- Typical use: KPI/stats blocks (users, revenue, projects, growth)
- Can contain: no inner blocks

## When AI Should Use It

Use counter when AI needs:
- animated numeric value from start to end,
- optional prefix/suffix formatting,
- optional title before/after or side-by-side with number.

Avoid counter when value should remain plain static text without stat-style presentation.

## Core Behavioral Notes

- Wrapper class: `blockish-counter`.
- Title position class on wrapper: `is-title-before`, `is-title-after`, `is-title-start`, `is-title-end`.
- Runtime data attributes are written for animation/formatting:
  - `data-start-number`
  - `data-end-number`
  - `data-animation-duration`
  - `data-thousand-separator`
  - `data-separator-type`
  - `data-prefix`
  - `data-suffix`
  - `data-decimals`
- Frontend animation:
  - starts when block enters viewport (`IntersectionObserver`, threshold ~0.2),
  - runs once on frontend,
  - respects reduced motion and jumps to end value when reduced motion is preferred.

## Important Attributes (AI-Relevant)

1. Counter values / formatting
- `startNumber` (number)
  - default: `0`
- `endNumber` (number)
  - default: `100`
- `numberPrefix` (string)
  - default: `""`
- `numberSuffix` (string)
  - default: `""`
- `animationDuration` (number, seconds)
  - default: `2`
  - UI range: `0..30`
- `thousandSeparator` (boolean)
  - default: `true`
- `separator` (object `{label,value}`)
  - default: `{ label: "Default", value: "default" }`
  - allowed values: `default`, `dot`, `space`, `underscore`, `apostrophe`

2. Title content
- `title` (string)
  - default: `Cool Number`
- `titleTag` (object `{label,value}`)
  - default: `{ label: "H3", value: "h3" }`
  - allowed values from UI: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span`, `div`
- `titlePosition` (string)
  - allowed: `before`, `after`, `start`, `end`
  - default: `before`

3. Layout controls
- `titleHorizontalAlignment` (object by device)
  - default: `Desktop: center` (stored in block defaults)
  - typical values in UI: `flex-start`, `center`, `flex-end`
- `titleVerticalAlignment` (object by device)
  - default: `Desktop: center` (stored in block defaults)
  - shown in UI only when `titlePosition` is `start` or `end`
- `titleGap` (object by device)
  - default: `Desktop: 8px`
- `numberPosition` (object by device)
  - default: `Desktop: center`
  - allowed in UI: `flex-start`, `center`, `flex-end`, `stretch`

4. Number style
- `numberTextColor`
- `numberTypography`
- `numberTextStroke`
- `numberTextShadow`

5. Title style
- `titleTextColor`
- `titleTypography`
- `titleTextStroke`
- `titleTextShadow`

## Known Defaults

- `startNumber`: `0`
- `endNumber`: `100`
- `animationDuration`: `2`
- `thousandSeparator`: `true`
- `separator.value`: `default`
- `title`: `Cool Number`
- `titleTag.value`: `h3`
- `titlePosition`: `before`

## Formatting/Math Rules AI Should Respect

- Decimal precision is automatically derived from max decimal places in `startNumber` and `endNumber`.
- Final displayed number may include:
  - optional minus sign,
  - grouping separator (if enabled),
  - decimal part (if needed),
  - prefix and suffix.
- If animation duration is `0` or start equals end, value renders directly to end state.

## AI Safe-Write Rules

- Keep numeric fields numeric (`startNumber`, `endNumber`, `animationDuration`).
- Use valid separator enum values only.
- Set `titleVerticalAlignment` only when `titlePosition` is `start` or `end`.
- Prefer realistic stat formatting (short prefix/suffix like `$`, `%`, `k`, `+`).
- Avoid extreme animation durations unless explicitly requested.

## Failure/Fallback Guidance

If animated behavior is not desired or cannot be used:
- keep same content with static number typography,
- set duration to `0` when needed,
- preserve title/value hierarchy and readability first.
