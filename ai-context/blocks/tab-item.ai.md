# Block Spec: `blockish/tab-item`

Important prerequisite: AI must read:
1. `ai-context/global/advanced-controls.ai.md`
2. `ai-context/blocks/tab.ai.md`

## Block Summary

- Name: `blockish/tab-item`
- Role: one tab panel item with nav title/icon metadata
- Parent requirement: must be inside `blockish/tab`
- Typical use: one content pane in tabbed interface

## When AI Should Use It

Use tab-item only as a child of `blockish/tab`.

Avoid standalone top-level usage.

## Core Behavioral Notes

- Wrapper class: `blockish-block-tab-item`.
- Saved markup stores nav metadata as data attributes:
  - `data-title`
  - `data-icon-path`
  - `data-icon-viewbox`
  - `data-default-active`
- Frontend tab script reads these attributes to build nav triggers.
- Item visibility in editor depends on parent `activeTab` index (`hidden` for inactive panels).
- Default inner template starts with one paragraph block.

## Important Attributes (AI-Relevant)

1. Tab metadata
- `title` (string)
  - default: `Tab`
- `tabIcon` (object)
  - optional icon object for nav button
- `defaultActive` (boolean)
  - default: `false`

## Default Active Synchronization

When `defaultActive` is turned on in one item:
- sibling items are set to `defaultActive: false`,
- parent tab gets:
  - `defaultActiveTab = this item index`
  - `activeTab = this item index`

If it is turned off and parent currently points to this index, parent `defaultActiveTab` resets to `0`.

AI should keep this one-default-active behavior consistent.

## AI Safe-Write Rules

- Always nest under `blockish/tab`.
- Keep `title` non-empty so nav remains meaningful.
- Use valid icon object for `tabIcon` when set.
- Avoid marking multiple items as `defaultActive: true`.

## Recommended Authoring Pattern

For each item:
1. Set concise title.
2. Optional icon for quick recognition.
3. Add panel content in inner blocks.
4. Mark one item as default active when needed.

## Failure/Fallback Guidance

If tab-item cannot be used in valid tab context:
- fallback to regular content sections,
- preserve each tab’s title/content order,
- keep headings to maintain scannability.
