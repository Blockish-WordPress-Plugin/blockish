# Block Spec: `blockish/social-icon-item`

Important prerequisite: AI must read:
1. `ai-context/global/advanced-controls.ai.md`
2. `ai-context/blocks/social-icons.ai.md`

## Block Summary

- Name: `blockish/social-icon-item`
- Role: one social network icon/link item inside social-icons
- Parent requirement: must be inside `blockish/social-icons`
- Typical use: Facebook/X/Instagram/LinkedIn/YouTube profile link item

## When AI Should Use It

Use social-icon-item only as a child of `blockish/social-icons`.

Avoid standalone top-level usage.

## Core Behavioral Notes

- Wrapper tag/class: `<li class="blockish-social-icon-item">`.
- Inner link wrapper:
  - `<a class="blockish-social-icon-item__link">` when link has `href`
  - `<span class="blockish-social-icon-item__link">` when no link
- Item sets CSS variable for official brand color:
  - `--blockish-social-icon-official-color`
- Accessibility label comes from `label` (fallback: `Social icon`).

## Important Attributes (AI-Relevant)

1. Network/content
- `network` (string)
  - default: `facebook`
  - common preset values in UI: `facebook`, `x`, `instagram`, `linkedin`, `youtube`
- `label` (string)
  - default: `Facebook`
- `icon` (object)
  - default: Facebook icon object
- `officialColor` (string)
  - default: `#1877F2`
- `link` (object)

## Inspector Preset Behavior

When network is changed via inspector, preset updates are applied:
- `network`
- `label`
- `officialColor`
- `icon`

AI should maintain consistency between these fields when intentionally changing network identity.

## AI Safe-Write Rules

- Keep this block nested under `social-icons`.
- Ensure `link` is valid when item should be clickable.
- Keep `label` meaningful for accessibility (screen-reader `aria-label`).
- Use valid icon objects; avoid mismatching network and icon unless user explicitly wants custom branding.

## Recommended Authoring Pattern

For each item:
1. Choose network preset.
2. Set profile URL in `link`.
3. Keep accessible label aligned with network/account meaning.
4. Let parent block handle shared visual style.

## Failure/Fallback Guidance

If a requested network preset is unavailable:
- use closest supported network slot,
- set custom icon + label + link manually,
- keep accessibility label explicit.
