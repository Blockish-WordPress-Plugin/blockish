# Global Advanced Controls Spec (AI-Safe)

This file defines shared advanced controls injected into **all `blockish/*` blocks**.
AI must read this file before any block-specific file.

## 1) Why This Exists

Blockish adds global advanced controls through a global wrapper/HOC layer. These controls write shared attributes and generated CSS for most blocks.

If AI skips this layer, it may:
- write wrong attribute names,
- write unsupported values,
- conflict with block-specific attributes.

## 2) Injection Model (How It Works)

Global controls are injected via editor filters and HOCs in `src/global/edit.js`.

Applied panels (in order):
1. Layout
2. Width
3. Position
4. Flex (only when context `display === 'flex'`)
5. Grid (only when context `display === 'grid'`)
6. Transform
7. Background
8. Border
9. Custom CSS

Also injected globally:
- `customCss` attribute (default `{{SELECTOR}}{}`)
- wrapper class pattern on block list wrapper: `bb-<clientId-last6> blockish-block-wrapper`

## 3) Mandatory AI Rules Before Writing Attributes

1. Confirm block name starts with `blockish/`.
2. Use only documented global attribute slugs in this file.
3. Respect panel conditions:
- only flex attributes when parent/layout context is flex,
- only grid attributes when context is grid,
- conditional slugs (e.g. custom width/order) only when condition is met.
4. Use responsive object shape for responsive controls (`Desktop`, `Tablet`, `Mobile`) when writing device values.
5. Do not invent enum values.
6. If unknown, prefer omission over guess.

## 4) Shared Attribute Slugs (Global)

### Layout panel
- `margin`
- `padding`

### Width panel
- `minWidth`
- `maxWidth`
- `widthType` (allowed values: `auto`, `100%`, `custom`)
- `customWidth` (only meaningful when `widthType = custom`)

### Position panel
- `position` (allowed values: `relative`, `absolute`, `fixed`, `sticky`)
- `positionTop`
- `positionRight`
- `positionBottom`
- `positionLeft`
- `zIndex`

### Flex panel (context display = flex)
- `alignSelf` (allowed: `flex-start`, `center`, `flex-end`, `stretch`)
- `flexOrder` (allowed: `-99999`, `99999`, `custom`)
- `flexCustomOrder` (only when `flexOrder = custom`)
- `flexGrow`
- `flexShrink`

### Grid panel (context display = grid)
- `alignSelf` (allowed: `start`, `center`, `end`, `stretch`)
- `justifySelf` (allowed: `start`, `center`, `end`, `stretch`)
- `gridColumnStart`
- `gridColumnEnd`
- `gridRowStart`
- `gridRowEnd`

### Transform panel
Normal/Hover transform system (selected highlights):
- rotate: `rotateZ`, `rotateX`, `rotateY` (+ hover variants)
- scale: `scaleX`, `scaleY`, `scale3DX`, `scale3DY` (+ hover variants)
- translate: `translateX`, `translateY` (+ hover variants)
- skew: `skewX`, `skewY` (+ hover variants)
- perspective: `perspective` (+ hover)
- origin: `transformOrigin`, `transformOriginX`, `transformOriginY`
- transition: `transformTransitionDuration`

### Background panel
- `background`
- `backgroundHover`
- `backgroundHoverTransition`

### Border panel
- `border`
- `borderHover`
- `borderRadius`
- `borderRadiusHover`
- `boxShadow`
- `boxShadowHover`
- `borderHoverTransition`

### Custom CSS panel
- `customCss`
- Use `{{SELECTOR}}` placeholder to target current block wrapper.

## 4.1) Responsive Value Storage (Critical)

Many advanced controls save per-device data. AI must write the correct data shape.

Primary device keys:
- `Desktop`
- `Tablet`
- `Mobile`

Common storage patterns:

1. Primitive per-device value
- Example:
```json
{
  "Desktop": "24px",
  "Tablet": "20px",
  "Mobile": "16px"
}
```
- Used by many range/unit style controls.

2. Select/Toggle option object per-device
- Example:
```json
{
  "Desktop": { "label": "Center", "value": "center" },
  "Tablet": { "label": "Center", "value": "center" },
  "Mobile": { "label": "Start", "value": "flex-start" }
}
```
- For select/toggle responsive controls, runtime checks often read `.value`.

3. Single non-responsive value
- Example:
```json
{
  "value": "relative"
}
```
or plain scalar depending on control.

AI safety rule:
- If a control is responsive, prefer full device map or at least `Desktop`.
- If a control is select/toggle and existing data uses `{label,value}`, keep that shape.
- Do not mix incompatible shapes for the same slug in one write.

## 4.2) Which Global Controls Support Responsive Values

Typically responsive in global layer:
- Layout: `margin`, `padding`
- Width: `minWidth`, `maxWidth`, `widthType`, `customWidth`
- Position offsets: `positionTop`, `positionRight`, `positionBottom`, `positionLeft`
- Flex: `alignSelf`, `flexOrder`, `flexCustomOrder`, `flexGrow`, `flexShrink`
- Grid: `alignSelf`, `justifySelf`, `gridColumnStart`, `gridColumnEnd`, `gridRowStart`, `gridRowEnd`
- Transform value controls (translate/scale/rotate/skew/perspective and origin X/Y)

Usually not responsive or treated as global/simple:
- `customCss`
- hover transition duration controls (e.g. `backgroundHoverTransition`, `borderHoverTransition`)
- booleans/toggles that are not exposed as responsive controls

Important:
- Some block inspectors may expose additional responsive controls outside global advanced layer.
- Always check block-specific AI doc for overrides/additions.

## 5) Conditional Logic AI Must Respect

1. Width
- Use `customWidth` only when `widthType = custom`.

2. Position offsets
- Use `positionTop/Right/Bottom/Left` only when `position` is set.

3. Flex order
- Use `flexCustomOrder` only when `flexOrder = custom`.

4. Flex/Grid panel visibility
- Flex panel appears only in flex context.
- Grid panel appears only in grid context.

5. Exclusion filters
Some blocks may hide specific controls through WP hook filters (`*.exclude`).
If a control is hidden for a block, AI should not force-write it.

## 6) Value Safety Guidelines

- Prefer clean, minimal values (e.g. `center`, `100%`, `relative`).
- For responsive values, set only devices you need; do not overfill every device by default.
- Keep transitions within expected control ranges (typically `0..3` seconds for hover transitions).
- For large numeric controls (position/order), avoid extreme values unless user explicitly requests.

## 7) AI Execution Sequence (Step-by-Step)

1. Read block-specific doc.
2. Read this global doc.
3. Decide base block composition.
4. Apply block-specific attributes first.
5. Apply global advanced attributes second.
6. Re-check conditional dependencies (`widthType`, `position`, display context).
7. Return user-facing summary of changed behavior (layout/spacing/visual effects).

## 8) Failure/Fallback

If AI is unsure about a global advanced attribute:
- skip that attribute,
- keep core composition valid,
- mention a safe fallback in final response.

## 9) Custom CSS Fallback Policy (When Controls Are Not Enough)

AI may use `customCss` only when requested design cannot be achieved with existing controls/attributes.

Use order:
1. Try native block + global controls first.
2. If impossible, add minimal `customCss`.
3. Keep CSS scoped with `{{SELECTOR}}`.
4. Avoid global selectors (`body`, `.wp-site-blocks`, etc.) unless user explicitly requests global effect.

Allowed use cases:
- small visual refinements not exposed in controls,
- edge-case pseudo-elements/states,
- temporary bridge until control exists.

Avoid:
- rewriting full layout in CSS when attributes can do it,
- large complex stylesheet blocks,
- unscoped selectors that leak outside target block.

Example safe pattern:
```css
{{SELECTOR}} {
  backdrop-filter: blur(8px);
}
{{SELECTOR}} .child-class {
  letter-spacing: 0.02em;
}
```

## 10) Media Query Guideline (Blockish Standard)

Source of truth:
- Device list from plugin utilities (`get_device_list`)
- Default breakpoints:
  - Desktop: base (no media query)
  - Tablet: `@media screen and (max-width: 1024px)`
  - Mobile: `@media screen and (max-width: 768px)`

Rules for AI:
1. Prefer responsive attributes over manual media queries.
2. Use manual media queries only inside `customCss` fallback cases.
3. Match plugin order:
   - Desktop styles first (base),
   - then Tablet max-width block,
   - then Mobile max-width block.
4. Keep breakpoints consistent with current configured device list when available.

Safe template:
```css
{{SELECTOR}} {
  /* Desktop/base */
}

@media screen and (max-width: 1024px) {
  {{SELECTOR}} {
    /* Tablet */
  }
}

@media screen and (max-width: 768px) {
  {{SELECTOR}} {
    /* Mobile */
  }
}
```
