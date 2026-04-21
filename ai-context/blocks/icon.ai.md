# Block Spec: `blockish/icon`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/icon`
- Role: single icon element with optional link
- Typical use: decorative icon, clickable icon, feature symbol
- Can contain: no inner blocks

## When AI Should Use It

Use icon when AI needs:
- one standalone icon,
- optional linked icon (e.g., quick action or external profile),
- simple visual emphasis with size/color/rotation controls.

Avoid icon for multi-item icon lists (use `icon-list` or `social-icons` style blocks).

## Core Behavioral Notes

- Base class: `blockish-icon`.
- Render tag is dynamic:
  - `<a>` when link has `href`,
  - `<div>` when link is empty.
- Icon SVG is rendered with `BlockishIcon` helper and default `24x24` base dimensions.

## Important Attributes (AI-Relevant)

1. Content / link
- `icon` (object)
  - default: star-like SVG icon object
- `link` (object)
  - optional; passed through `getLinkProps(...)`

2. Layout
- `alignment` (object by device)
  - default: center on `Desktop`/`Tablet`/`Mobile`
  - allowed values: `left`, `center`, `right`

3. Style
- `size` (object by device)
  - controls width and height of SVG
  - UI units include `px`, `rem`, `em`
- `color` (string)
- `hoverColor` (string)
- `rotation` (object by device, degrees)
- `rotationHover` (object by device, degrees)

## Known Defaults

- `alignment`: center on Desktop/Tablet/Mobile
- `icon`: predefined default icon object from block config

## AI Safe-Write Rules

- Keep `icon` as a valid icon object (with SVG data fields such as `viewBox` and `path`).
- Use `link` only when icon should be interactive.
- Do not force anchor tag manually; let link presence control tag selection.
- Keep rotation values reasonable unless user explicitly requests dramatic rotation.
- Ensure hover color still has sufficient contrast against background.

## Failure/Fallback Guidance

If requested icon is unavailable:
- use closest semantic icon,
- keep sizing/alignment intent,
- mention substitution briefly.

If link details are incomplete:
- keep icon non-clickable (no link) and request/assume safe destination later.
