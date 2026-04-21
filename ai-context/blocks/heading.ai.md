# Block Spec: `blockish/heading`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/heading`
- Role: semantic heading/title text block
- Typical use: section titles, hero titles, card titles, labels
- Can contain: no inner blocks

## When AI Should Use It

Use heading when AI needs:
- clear text hierarchy and semantic headings,
- styled title text with responsive alignment and hover states.

Avoid using heading for long body paragraphs (use text/paragraph-style blocks).

## Core Behavioral Notes

- Render class: `blockish-heading`.
- Output tag is dynamic from `tag.value` (default `h2`).
- Content is stored in `content` and rendered with `RichText`.
- Alignment applies `text-align` directly on wrapper/heading element.

## Important Attributes (AI-Relevant)

1. Content / semantics
- `content` (string)
  - default: `Heading Text`
- `tag` (object with `{label,value}`)
  - default: `{ label: "H2", value: "h2" }`
  - allowed values in UI: `h1`, `h2`, `h3`, `h4`, `h5`, `h6`, `p`, `span`, `div`

2. Layout
- `alignment` (object by device)
  - default:
    - `Desktop: left`
    - `Tablet: left`
    - `Mobile: left`
  - allowed values: `left`, `center`, `right`

3. Style
- `typography`
- `color`
- `hoverColor`
- `textShadow`
- `textShadowHover`

## Known Defaults

- `content`: `Heading Text`
- `tag.value`: `h2`
- `alignment`: left on Desktop/Tablet/Mobile

## AI Safe-Write Rules

- Choose semantic tags intentionally:
  - one primary page heading usually `h1`,
  - section headings typically `h2`/`h3`,
  - avoid using `h1` repeatedly without user intent.
- Keep heading text concise and scannable.
- Use `p`/`div`/`span` only when user explicitly asks for non-heading semantics.
- Keep hover effects subtle for readability/accessibility.

## Failure/Fallback Guidance

If a requested title style cannot be matched exactly:
- preserve semantic tag and text hierarchy first,
- apply closest typography/color/shadow controls,
- use minimal scoped `customCss` only if essential.
