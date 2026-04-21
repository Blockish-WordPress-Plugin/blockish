# Block Spec: `blockish/accordion-item`

Important prerequisite: AI must read:
1. `ai-context/global/advanced-controls.ai.md`
2. `ai-context/blocks/accordion.ai.md`

## Block Summary

- Name: `blockish/accordion-item`
- Role: one collapsible item (question + answer content) inside accordion
- Parent requirement: must be inside `blockish/accordion`
- Typical use: FAQ entry with title and expandable content

## When AI Should Use It

Use accordion-item only as a child of `blockish/accordion`.

Avoid standalone use outside accordion.

## Core Behavioral Notes

- Wrapper class: `blockish-accordion-item`.
- Uses semantic `<details>` + `<summary>` structure.
- Item open state in saved markup is driven by `defaultOpen`.
- Frontend accordion script can still close/open items based on parent `maxItemExpanded` rules.
- Item auto-generates `itemId` in editor when missing.

## Important Attributes (AI-Relevant)

1. Content/identity
- `title` (string)
  - default: `Accordion item`
- `itemId` (string)
  - auto-generated in editor when empty

2. Open state
- `defaultOpen` (boolean)
  - default: `false`

3. Icons
- `expandIcon` (object)
  - icon shown when item is closed
- `collapseIcon` (object)
  - icon shown when item is open

4. Title semantics
- `titleTag` (object with `{label,value}`)
  - default: `{ label: "H3", value: "h3" }`
  - allowed values: `h2`, `h3`, `h4`, `h5`, `h6`, `div`, `p`

## Inner Content Rules

- Item content panel is editable via inner blocks.
- Default template inserts one `blockish/container` (full width, variation picked).
- Keep answer content inside `.blockish-accordion-item-content-inner` area via inner blocks.

## AI Safe-Write Rules

- Never place `accordion-item` as a top-level block; always nest under accordion.
- Keep `titleTag.value` to allowed values only.
- Use valid icon objects for `expandIcon` / `collapseIcon` (with icon data fields).
- Do not rely on item-level custom JS for toggle behavior; use parent/item attributes.

## Recommended Authoring Pattern

For each item:
1. Set `title` to concise question.
2. Set `defaultOpen` only when specifically requested.
3. Keep one clear answer block group inside item content.
4. Use parent accordion styles for consistency before heavy per-item customization.

## Failure/Fallback Guidance

If accordion nesting cannot be maintained:
- fallback to static heading + text blocks in sequence,
- preserve order and meaning of Q/A content,
- note that interactive collapse was skipped.
