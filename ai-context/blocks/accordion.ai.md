# Block Spec: `blockish/accordion`

Important prerequisite: AI must read `ai-context/global/advanced-controls.ai.md` first.

## Block Summary

- Name: `blockish/accordion`
- Role: parent wrapper for collapsible FAQ/toggle items
- Typical use: FAQ sections, collapsible Q&A lists
- Can contain: only `blockish/accordion-item` as direct inner blocks

## When AI Should Use It

Use accordion when AI needs:
- collapsible question/answer groups,
- one-open-only or multi-open interaction behavior,
- optional FAQ schema JSON-LD generation.

Avoid using accordion when all content should stay visible without toggling.

## Core Behavioral Notes

- Wrapper class in markup: `blockish-accordion`.
- Items wrapper class: `blockish-accordion-items`.
- Runtime behavior is controlled via data attributes on wrapper:
  - `data-max-expanded`: `one` or `multiple`
  - `data-faq-schema`: `true` or `false`
- Frontend script:
  - toggles open/close state on item trigger click,
  - enforces single-open mode when `maxItemExpanded = one`,
  - injects JSON-LD FAQ schema script when `faqSchema = true` and valid Q/A text exists.

## Important Attributes (AI-Relevant)

Responsive note:
- Many layout/style controls are responsive objects with `Desktop`/`Tablet`/`Mobile`.
- Preserve existing shape (scalar vs `{label,value}`) per slug.

1. Interaction / behavior
- `faqSchema` (boolean)
  - default: `false`
- `maxItemExpanded` (string)
  - allowed: `one`, `multiple`
  - default: `one`

2. Header layout
- `itemPosition` (object by device)
  - allowed: `start`, `center`, `end`, `space-between`
  - default: `Desktop: start`
- `iconPosition` (object by device)
  - allowed: `row`, `row-reverse`
  - default: `Desktop: row`

3. Accordion panel styling
- `itemsSpaceBetween` (object by device)
- `distanceBetweenContent` (object by device)
- `accordionBackgroundNormal`
- `accordionBackgroundHover`
- `accordionBackgroundActive`
- `accordionBorderNormal`
- `accordionBorderHover`
- `accordionBorderActive`
- `accordionBorderRadius` (object by device)
- `accordionPadding` (object by device)

4. Header styling
- `headerTypography`
- `iconSize` (object by device)
- `headerTextColor`
- `headerTextColorHover`
- `headerTextColorActive`
- `iconColor`
- `iconColorHover`
- `iconColorActive`
- `headerTextShadow`
- `headerTextShadowHover`
- `headerTextShadowActive`
- `headerTextStroke`
- `headerTextStrokeHover`
- `headerTextStrokeActive`

5. Content area styling
- `contentTextColor`
- `contentBackground`
- `contentBorder`
- `contentBorderRadius` (object by device)
- `contentPadding` (object by device)

## Known Defaults

- `maxItemExpanded`: `one`
- `faqSchema`: `false`
- `itemPosition.Desktop`: `start`
- `iconPosition.Desktop`: `row`
- New accordion starts with 3 `blockish/accordion-item` blocks by template.

## Composition Rules With `accordion-item`

1. Always create `blockish/accordion` as the parent block.
2. Add one or more `blockish/accordion-item` child blocks.
3. Put answer content inside each item panel (default template starts with a `blockish/container`).
4. If user asks for FAQ SEO markup, set `faqSchema: true` and ensure each item has non-empty title and content.

## AI Safe-Write Rules

- Do not insert non-`accordion-item` blocks as direct children of accordion.
- Use `maxItemExpanded` only with `one` or `multiple`.
- Do not promise FAQ schema output unless title + content text exist for items.
- Keep interactivity logic in attributes/data state; avoid replacing behavior with custom JS.

## Failure/Fallback Guidance

If accordion interaction is not desired or fails requirements:
- fallback to stacked heading + text blocks,
- preserve Q/A hierarchy,
- mention that static layout was used instead of collapsible behavior.
