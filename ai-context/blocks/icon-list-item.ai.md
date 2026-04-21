# Block Spec: `blockish/icon-list-item`

Important prerequisite: AI must read:
1. `ai-context/global/advanced-controls.ai.md`
2. `ai-context/blocks/icon-list.ai.md`

## Block Summary

- Name: `blockish/icon-list-item`
- Role: one list row containing icon + text (+ optional link)
- Parent requirement: must be inside `blockish/icon-list`
- Typical use: single bullet/benefit/checklist row

## When AI Should Use It

Use icon-list-item only as a child of `blockish/icon-list`.

Avoid standalone top-level usage.

## Core Behavioral Notes

- Wrapper tag/class: `<li class="blockish-icon-list-item">`.
- Inner clickable wrapper:
  - `<a class="blockish-icon-list-item-link">` if link has `href`
  - `<span class="blockish-icon-list-item-link">` if no link
- Icon class: `blockish-icon-list-item-icon`
- Text class: `blockish-icon-list-item-text`
- Editor prevents link navigation on click while editing.

## Important Attributes (AI-Relevant)

1. Content
- `text` (string)
  - default: `Icon list item`
- `icon` (object)
  - default: star-like icon object
- `link` (object)
  - optional; passed through `getLinkProps(...)`

2. Item-level icon style
- `iconSize` (object by device)
- `iconColor` (string)
- `iconHoverColor` (string)
- `iconHoverTransition` (number, seconds)
  - default: `0.2`

3. Item-level text style
- `textTypography` (string)
- `textColor` (string)
- `textHoverColor` (string)
- `textHoverTransition` (number, seconds)
  - default: `0.2`

## AI Safe-Write Rules

- Always keep this block nested under `icon-list`.
- Keep `icon` as valid icon object data.
- Use `link` only when row should be clickable.
- Do not force `<a>` manually; link presence determines tag.
- Prefer parent-level styling for consistency; apply item-level overrides sparingly.

## Recommended Authoring Pattern

For each item:
1. Use concise text (short phrase).
2. Choose icon that matches item meaning.
3. Add link only when item is actionable.
4. Keep per-item overrides minimal unless user asks for unique styling.

## Failure/Fallback Guidance

If icon-list nesting is not possible:
- fallback to static icon + text rows,
- preserve content sequence,
- keep links only where clearly provided.
