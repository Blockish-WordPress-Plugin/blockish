# Block Spec: `blockish/button`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/button`
- Role: single call-to-action button block
- Typical use: CTA links, action prompts, form/navigation triggers
- Can contain: no inner blocks

## When AI Should Use It

Use button when AI needs:
- one clear clickable action,
- short action text + optional icon,
- controllable alignment, width, spacing, and hover styles.

Avoid button for long paragraph links or complex grouped actions (use container + multiple buttons instead).

## Core Behavioral Notes

- Wrapper class: `blockish-button`.
- Anchor class: `blockish-button-link`.
- Button text is stored in `text` and rendered via `RichText`.
- Link props are generated from `attributes.url` through `getLinkProps(...)`.
- Icon is optional; when set, icon and text render inside the same anchor.

## Important Attributes (AI-Relevant)

1. Content / link
- `text` (string)
  - default: `Click Here`
- `url` (object)
  - used to build anchor properties (href/target/rel via helper)
- `icon` (object)
  - optional icon object
- `iconPosition` (string)
  - allowed: `row` (icon right), `row-reverse` (icon left)
  - default: `row`

2. Layout / sizing
- `buttonPlacement` (object by device)
  - wrapper-level horizontal placement
  - allowed: `flex-start`, `center`, `flex-end`
- `buttonAlignment` (object by device)
  - text/icon alignment inside button
  - allowed: `start`, `center`, `end`
- `buttonContentSpacing` (object by device)
- `buttonWidth` (object by device)
- `buttonMinHeight` (object by device)

3. Typography / visual style
- `buttonTypography`
- `buttonTextShadow`
- `buttonTextColor`
- `buttonBackground`
- `buttonBoxShadow`
- `buttonBorder`
- `buttonBorderRadius` (object by device)
- `buttonPadding` (object by device)

4. Hover state
- `buttonHoverTextColor`
- `buttonHoverBackground`
- `buttonHoverBorderColor`
- `buttonHoverBoxShadow`
- `buttonHoverTransition` (number, seconds)

## Known Defaults

- `text`: `Click Here`
- `iconPosition`: `row`

## Inspector/Storage Compatibility Note

- `block.json` defines `url`.
- Inspector link control uses `slug="link"` while rendering reads `attributes.url`.
- AI should treat `url` as the source of truth for saved output and preserve existing link object shape in current content.

## AI Safe-Write Rules

- Keep action text short and explicit.
- Do not invent unsupported icon position values.
- If icon is not needed, omit `icon` rather than injecting placeholder icon data.
- Keep hover transition within practical UI range (commonly `0..1.5` seconds unless user requests otherwise).
- Use global advanced controls for extra spacing/position only when needed.

## Failure/Fallback Guidance

If requested CTA design exceeds button capabilities:
- fallback to valid button + minimal global advanced styling,
- use scoped `customCss` only if required and only with `{{SELECTOR}}`,
- preserve click behavior and readable text first.
