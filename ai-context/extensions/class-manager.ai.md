# Extension Spec: `class-manager`

## Purpose

Class Manager enables reusable CSS classes that can be assigned across Blockish blocks.
When used correctly, it reduces duplicated per-block styling and can lower frontend CSS output duplication.

## Availability / Enablement

- Extension key: `class-manager`
- Current extension list marks it active by default.
- Runtime class application + style enqueue only run when extension is enabled.

## Injected Block Attributes

Class Manager injects these attributes globally (all included blocks):
- `classManager` (array, default `[]`)
- `classManagerSubselector` (array, default `[]`)

Applied scope in extension config:
- include: `*`
- exclude: none

## How Classes Are Applied To Blocks

In editor wrapper attributes:
1. Each selected class in `classManager` adds a normalized class slug (from class title).
2. Each selected subselector in `classManagerSubselector` adds class:
   - `blockish-cm-<selectorId>`

Validation behavior:
- invalid or empty slugs are ignored
- unresolved IDs are ignored

## Frontend CSS Loading Model (Important)

On frontend, extension PHP:
1. scans rendered Blockish blocks for selected class/subselector IDs
2. collects only used class post IDs (`blockish-classes` post type)
3. enqueues inline CSS from stored meta key:
   - `blockishClassManagerStyles`

This means:
- only CSS for used classes is output,
- unused class definitions are not enqueued for that page.

## AI Decision Rule (Performance-Oriented)

When Class Manager is enabled and a reusable style intent is detected, AI should prefer Class Manager over repeating heavy inline/per-block style patterns.

Use Class Manager when:
- same style will be reused across multiple Blockish blocks/sections,
- user asks for global/shared/reusable classes,
- repeated visual systems (button variants, card shells, spacing utilities) are needed.

Prefer block attributes (without class manager) when:
- style is one-off and unlikely to repeat,
- change is tiny/local and class creation overhead is not justified.

## AI Safe-Write Rules

- Do not invent arbitrary class slugs outside class-manager data flow.
- Keep `classManager` / `classManagerSubselector` as arrays of valid items.
- If class IDs are unknown, avoid writing fake IDs.
- Do not assume class styles exist unless class records are present.
- Preserve existing selected classes unless user requests replacement.

## Suggested AI Workflow

1. Detect repeated style intent.
2. Check if reusable class already exists.
3. If exists, attach it via `classManager`.
4. If not, create/store class through class-manager flow, then attach.
5. Keep block-level CSS minimal to avoid duplication.

## Fallback Guidance

If Class Manager is unavailable/disabled:
- apply styles directly via normal block/global controls,
- keep structure valid,
- mention that reusable-class optimization was skipped.
