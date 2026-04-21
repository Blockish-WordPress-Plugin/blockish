# Blockish AI Context (Operator Manual)

This folder is the operating guide for AI agents that build/edit designs with Blockish.
It is focused on safe execution, not internal developer architecture.

## Goals

Use this context system to make AI outputs:
- valid against real Blockish capabilities,
- predictable and editable inside the editor,
- responsive by default,
- easy to explain to end users.

## Quick Start (Required Read Order)

1. Read this file first.
2. Read global controls baseline:
   `ai-context/global/advanced-controls.ai.md`
3. Read every relevant block spec in:
   `ai-context/blocks/*.ai.md`
4. Read extension specs before writing extension-related attributes:
   `ai-context/extensions/*.ai.md`
5. Execute using only documented attributes and conditional rules.

## AI Execution Workflow

1. Parse user intent
- Identify purpose: hero, feature list, CTA, FAQ, pricing, etc.
- Extract constraints: tone, spacing, color, hierarchy, density.

2. Plan composition
- Choose minimal block tree that satisfies the request.
- Confirm each chosen block supports required behavior.

3. Apply changes
- Write block attributes first.
- Write global advanced attributes second.
- Keep responsive values explicit when layout depends on device behavior.

4. Validate safety
- Re-check conditional dependencies (width mode, flex/grid context, position conditions).
- Remove uncertain attributes instead of guessing.

5. Report outcome
- Explain what changed in user-friendly language.
- If there are limits, state them clearly and provide one practical alternative.

## Quality Guardrails

- Never invent undocumented attributes or enum values.
- Prefer simple, stable structures over complex block trees.
- Preserve user intent even when exact styling is unavailable.
- Keep selectors scoped when using `customCss`.
- Prefer native controls; use `customCss` only as a fallback.

## Fallback Policy

If exact output is not possible:
1. Use closest valid composition.
2. Preserve content hierarchy and responsive behavior.
3. Mention limitation plainly.
4. Suggest one low-risk alternative.

## Documentation Map

- Global baseline (mandatory for all `blockish/*` blocks):
  `ai-context/global/advanced-controls.ai.md`
- Block specs:
  `ai-context/blocks/*.ai.md`
- Extensions (planned):
  `ai-context/extensions/class-manager.ai.md`
- Scenarios/playbooks (planned):
  `ai-context/scenarios/*.ai.md`

## Authoring Standard (For Contributors)

When adding/updating any AI spec:
1. Match actual `block.json` and runtime behavior.
2. Document defaults, allowed values, and conditional logic.
3. Include responsive storage shape requirements when relevant.
4. Add safe-write and fallback notes.
5. Keep examples minimal and implementation-accurate.

## Block Spec Template (Copy/Paste)

```md
# Block Spec: `blockish/<slug>`

## Summary
- Role:
- Typical use:
- Can contain:

## When AI Should Use It
- Use when:
- Avoid when:

## Attributes (AI-Relevant)
- `<attributeSlug>`:
  - type:
  - allowed values:
  - default:
  - responsive shape:
  - conditions:

## Defaults
- ...

## Safe-Write Rules
- ...

## Failure/Fallback
- ...
```

## Extension Spec Template (Copy/Paste)

```md
# Extension Spec: `<extension-name>`

## Scope
- Affects blocks:
- Injected attributes:

## Activation Conditions
- ...

## Attribute Rules
- ...

## Safe-Write Rules
- ...
```

## Definition of Done (AI Context Update)

A context update is complete when:
1. Docs reflect current plugin behavior.
2. Conditions and value shapes are documented.
3. No undocumented attributes are required to execute common tasks.
4. At least one valid fallback path is documented.

## Maintenance Rule

Whenever block behavior changes (attributes, defaults, UI conditions, nesting rules), update the matching `*.ai.md` in the same PR/commit so AI context never drifts from the product.
