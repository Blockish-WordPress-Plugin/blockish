# Block Spec: `blockish/rating`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/rating`
- Role: visual icon-based rating display (e.g., stars)
- Typical use: reviews, product/service scores, testimonial ratings
- Can contain: no inner blocks

## When AI Should Use It

Use rating when AI needs:
- a compact visual score,
- integer/half-step rating display,
- customizable icon, colors, spacing, and alignment.

Avoid rating when user needs detailed review text input logic (this block is display-oriented).

## Core Behavioral Notes

- Wrapper class: `blockish-rating`.
- Icons container class: `blockish-rating-icons`.
- Rendered icon count equals `ratingScale`.
- Fill logic is per icon using CSS variable `--blockish-rating-fill` (supports partial/half fill).
- Runtime clamping in edit/save:
  - `ratingScale` clamped to `1..10`
  - `rating` clamped to `0..ratingScale`
  - `rating` rounded to nearest `0.5`

## Important Attributes (AI-Relevant)

1. Rating values
- `ratingScale` (number)
  - default: `5`
  - effective allowed range: `1..10`
- `rating` (number)
  - default: `5`
  - effective range: `0..ratingScale`
  - step behavior: `0.5`

2. Icon content
- `icon` (object)
  - default: star icon object

3. Layout/style
- `alignment` (object by device)
  - default: `Desktop: center`
  - values: `left`, `center`, `right`
- `iconSize` (object by device)
  - default: `Desktop: 24px`
- `iconSpacing` (object by device)
  - default: `Desktop: 6px`
- `iconColor` (string)
  - marked/filled color
- `unmarkedColor` (string)
  - base/unfilled color

## Known Defaults

- `ratingScale`: `5`
- `rating`: `5`
- `alignment.Desktop`: `center`
- `iconSize.Desktop`: `24px`
- `iconSpacing.Desktop`: `6px`

## AI Safe-Write Rules

- Keep `ratingScale` in `1..10`.
- Keep `rating` within `0..ratingScale`.
- Prefer `.5` increments for partial ratings (e.g., `3.5`, `4.5`).
- Ensure marked vs unmarked colors have clear contrast.
- Use valid icon object data when changing icon shape.

## Failure/Fallback Guidance

If requested rating format is unsupported:
- fallback to nearest valid half-step value,
- preserve intended sentiment (e.g., high/medium/low),
- explain any normalization briefly if needed.
