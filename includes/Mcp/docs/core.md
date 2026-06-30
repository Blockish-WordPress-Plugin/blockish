# Blockish Block Reference

## 1. How to read this doc

You (the AI) build a **schema**: a JSON tree of `{ name, attributes, innerBlocks }` objects. That is your entire job.

- `name` — block name, e.g. `"blockish/container"`.
- `attributes` — only the attributes you want different from their default. Anything you omit automatically falls back to the block's registered default — you never need to repeat a default value, and you never need to compute what an omitted value "renders as." That is handled for you.
- `innerBlocks` — array of child schema nodes, same shape, recursive. Only for blocks marked "Accepts children: yes" below.

**You never write HTML, CSS classes, or comment markup of any kind.** Turning your schema into real Gutenberg blocks happens in the editor, not by you. Do not include a `content` field. Do not try to reproduce a block's rendered HTML. If you find yourself writing an HTML tag, stop — that's a sign you've stepped outside your job.

**CRITICAL RULE: Naming Top-Level Blocks**
Every top-level layout block you emit MUST carry a unique and meaningful `metadata.name` attribute (e.g., `"attributes": { "metadata": { "name": "Hero Section" } }`). This allows the editor UI to instantly detect whether a layout is new or an update to an existing section, preventing wrong-block edits. If you do not name your blocks, the human user is forced to guess what you meant.

**Your schema is staged for human review, not written live.** Passing `block_schema` to `blockish/manage-post` does not put anything into `post_content`. It saves the schema as pending data on the post. A human must open that post in the block editor, where an "Apply AI Layout" control appears in the editor header only while a pending schema exists, and explicitly apply it (choosing where: end of content, or — if a block is selected — before/after/inside it) before it becomes real content. Never pass a schema as `post_content` directly, and never expect it to appear on the live post without that manual step.

Workflow:
1. Read this doc (and `class-manager-docs.md` if you need reusable CSS classes).
2. Build the schema tree for the page: an array of `{ name, attributes, innerBlocks }` nodes.
3. Call `blockish/manage-post` with `post_id` (or omit to create a new post) and `block_schema` set to that array. Do not set `post_content` to anything schema- or markup-related in the same call.
4. Tell the user the post is ready for review and link them to the returned `edit_url` — they need to open it and click "Apply AI Layout" to turn the schema into real blocks.

---

## 2. Attribute type legend

Every attribute in every block below is one of these shapes. The per-block tables reference these by name. Read this section once; you won't need to re-derive any shape.

### Scalar

A plain string, number, or boolean — used as-is.

```json
"text": "Click Here"
"rating": 4.5
"defaultOpen": true
```

### Option

`{ "label": "...", "value": "..." }`. The `value` is what's functionally used; `label` is the human-readable name. Always send both.

```json
{ "label": "H2", "value": "h2" }
```

### Responsive

Per-device scalar values: `{ "Desktop": ..., "Tablet": ..., "Mobile": ... }`. Only `Desktop` is required — `Tablet`/`Mobile` inherit from `Desktop` if omitted.

```json
{ "Desktop": "24px", "Tablet": "20px", "Mobile": "16px" }
```

### Responsive-Option

A Responsive wrapper where each device's value is an Option object instead of a plain scalar.

```json
{ "Desktop": { "label": "Row", "value": "row" }, "Mobile": { "label": "Column", "value": "column" } }
```

### Spacing

`{ "top": "...", "right": "...", "bottom": "...", "left": "..." }`. Used directly, or wrapped in a Responsive object when the attribute is per-device (the per-block table tells you which).

```json
{ "top": "40px", "right": "20px", "bottom": "40px", "left": "20px" }
```

Responsive form:
```json
{ "Desktop": { "top": "60px", "right": "40px", "bottom": "60px", "left": "40px" }, "Mobile": { "top": "24px", "right": "16px", "bottom": "24px", "left": "16px" } }
```

### Border-Radius

`{ "topLeft": "...", "topRight": "...", "bottomRight": "...", "bottomLeft": "..." }`, wrapped in a Responsive object.

```json
{ "Desktop": { "topLeft": "8px", "topRight": "8px", "bottomRight": "8px", "bottomLeft": "8px" } }
```

Use `"50%"` on all four corners for a pill/circle.

### Icon

`{ "viewBox": [x, y, width, height], "path": "..." }` — an SVG path. `viewBox` is 4 numbers; `path` is the SVG `d` attribute string.

```json
{ "viewBox": [0, 0, 576, 512], "path": "M288 32 L576 480 L0 480 Z" }
```

### Link

`{ "url": "...", "newTab": false, "noFollow": false }`.

```json
{ "url": "https://example.com", "newTab": false, "noFollow": false }
```

### Image

`{ "id": ..., "url": "...", "width": ..., "height": ... }` — a WordPress media object. `id` is the attachment ID (use `0` if only a URL is known).

```json
{ "id": 123, "url": "https://example.com/photo.jpg", "width": 1200, "height": 800 }
```

### Color

A plain CSS color string. Always use hex or `rgba()` — never guess a theme preset slug.

```json
"#1a73e8"
"rgba(0, 0, 0, 0.5)"
```

### Stringified-JSON

**The most error-prone type.** The attribute's value is a `string`, and that string's content is itself JSON (so you JSON-encode an object/array, then use the resulting text as the string value — in a `{ "blocks": [...] }` payload this means escaped quotes inside the outer JSON). There are several named shapes, defined below. Each per-block table cell says `Stringified-JSON (ShapeName)` and you look up that shape here.

#### Shape: Typography

```json
"{\"fontWeight\":\"700\",\"fontSize\":{\"Desktop\":\"32px\",\"Tablet\":\"24px\",\"Mobile\":\"20px\"},\"lineHeight\":{\"Desktop\":\"1.2\"},\"letterSpacing\":{\"Desktop\":\"0px\"},\"textTransform\":\"uppercase\",\"fontStyle\":\"normal\",\"textDecoration\":\"none\"}"
```

| Key | Type | Default | Notes/enum |
|---|---|---|---|
| `fontFamily` | Option | unset | `{"value": "Inter, sans-serif", "label": "Inter"}` |
| `fontWeight` | Scalar (string) | unset | `"100"` `"200"` `"300"` `"400"` `"500"` `"600"` `"700"` `"800"` `"900"` |
| `fontSize` | Responsive | unset | e.g. `{"Desktop":"24px"}` — `px`/`em`/`rem` |
| `lineHeight` | Responsive | unset | e.g. `{"Desktop":"1.5"}` |
| `letterSpacing` | Responsive | unset | e.g. `{"Desktop":"0.05em"}` |
| `textTransform` | Scalar (string) | `"none"` | `"none"` `"uppercase"` `"lowercase"` `"capitalize"` |
| `fontStyle` | Scalar (string) | `"normal"` | `"normal"` `"italic"` |
| `textDecoration` | Scalar (string) | `"none"` | `"none"` `"underline"` `"line-through"` |

Omit any key you don't need — you do not need to pass the whole object, only the keys you're changing.

#### Shape: Background

```json
"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#f5f7fa\"}"
```

```json
"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#000\",\"backgroundImage\":{\"Desktop\":{\"id\":45,\"url\":\"https://example.com/bg.jpg\"}},\"backgroundImageSize\":{\"Desktop\":{\"value\":\"cover\",\"label\":\"Cover\"}},\"backgroundImagePosition\":{\"Desktop\":{\"value\":\"center center\",\"label\":\"Center Center\"}},\"backgroundImageRepeat\":{\"Desktop\":{\"value\":\"no-repeat\",\"label\":\"No Repeat\"}}}"
```

```json
"{\"backgroundType\":\"gradient\",\"gradient\":\"linear-gradient(135deg, #667eea 0%, #764ba2 100%)\"}"
```

Video (`blockish/container`'s `containerBackground` only — see that block's section):
```json
"{\"backgroundType\":\"video\",\"backgroundVideo\":{\"id\":88,\"url\":\"https://example.com/bg-loop.mp4\"}}"
```

| Key | Type | Default | Notes/enum |
|---|---|---|---|
| `backgroundType` | Scalar (string) | `"classic"` | `"classic"` `"gradient"` `"video"` — `"video"` only works on `blockish/container`'s `containerBackground`, silently ignored elsewhere |
| `backgroundColor` | Color | unset | |
| `gradient` | Scalar (string, CSS gradient) | unset | Used when `backgroundType` = `"gradient"` |
| `backgroundVideo` | Image (video file) | unset | Used when `backgroundType` = `"video"` |
| `backgroundImage` | Responsive of Image | unset | |
| `backgroundImageResolution` | Responsive-Option | unset | Picks one of the *uploaded image's own* registered sizes (e.g. `"thumbnail"`/`"medium"`/`"large"`/`"full"`) — the exact list varies per image, not a fixed enum. Leave unset to use the size `backgroundImage` itself was set with. |
| `backgroundImageSize` | Responsive-Option | `{"value":"auto"}` | `"auto"` `"cover"` `"contain"` `"custom"` (use `backgroundImageSizeWidth` when `"custom"`) |
| `backgroundImageSizeWidth` | Responsive | unset | Used when `backgroundImageSize` = `"custom"` |
| `backgroundImagePosition` | Responsive-Option | `{"value":"top left"}` | `"top left"` `"top center"` `"top right"` `"center left"` `"center center"` `"center right"` `"bottom left"` `"bottom center"` `"bottom right"` `"custom"` (use `backgroundImagePositionHorizontal`/`Vertical` when `"custom"`) |
| `backgroundImagePositionHorizontal` | Responsive | unset | Used when `backgroundImagePosition` = `"custom"` |
| `backgroundImagePositionVertical` | Responsive | unset | Used when `backgroundImagePosition` = `"custom"` |
| `backgroundImageAttachment` | Option | `{"value":"scroll"}` | `"scroll"` `"fixed"` |
| `backgroundImageRepeat` | Responsive-Option | `{"value":"repeat"}` | `"repeat"` `"repeat-x"` `"repeat-y"` `"no-repeat"` |
| `backgroundImageBlendMode` | Option (not responsive) | `{"value":"normal"}` | Same 16-value enum as Background Overlay's `blendMode` below |

#### Shape: Background Overlay

Renders on top of the background, for darkening/tinting images.

```json
"{\"enabled\":true,\"type\":\"color\",\"color\":\"rgba(0,0,0,0.5)\",\"opacity\":100}"
```

```json
"{\"enabled\":true,\"type\":\"gradient\",\"gradient\":\"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)\",\"opacity\":100}"
```

| Key | Type | Default | Notes/enum |
|---|---|---|---|
| `enabled` | Scalar (boolean) | `false` | |
| `type` | Scalar (string) | `"color"` | `"color"` `"gradient"` |
| `color` | Color | unset | Used when `type` = `"color"` |
| `gradient` | Scalar (string, CSS gradient) | unset | Used when `type` = `"gradient"` |
| `opacity` | Scalar (integer) | `100` | `0`–`100` |
| `filters` | **Stringified-JSON (CSS Filters), nested** | unset | A JSON-string-within-a-JSON-string — same shape as the CSS Filters block below, but `grayscale`/`invert`/`sepia` are not offered here (omit them; only `blur`/`brightness`/`contrast`/`saturate`/`hue-rotate` apply to the overlay) |
| `blendMode` | Option | `{"value":"normal"}` | `"normal"` `"multiply"` `"screen"` `"overlay"` `"darken"` `"lighten"` `"color-dodge"` `"color-burn"` `"hard-light"` `"soft-light"` `"difference"` `"exclusion"` `"hue"` `"saturation"` `"color"` `"luminosity"` |

#### Shape: Border

```json
"{\"width\":{\"Desktop\":\"1px\"},\"style\":\"solid\",\"color\":\"#e0e0e0\"}"
```

Per-side (only specify the sides you need):
```json
"{\"top\":{\"width\":{\"Desktop\":\"2px\"},\"style\":\"solid\",\"color\":\"#333\"},\"bottom\":{\"width\":{\"Desktop\":\"1px\"},\"style\":\"dashed\",\"color\":\"#ccc\"}}"
```

| Key | Type | Default | Notes/enum |
|---|---|---|---|
| `width` | Responsive | unset | |
| `style` | Scalar (string) | `"solid"` | `"solid"` `"dashed"` `"dotted"` `"double"` `"none"` |
| `color` | Color | unset | |
| `top`/`right`/`bottom`/`left` | Object (same shape: `width`/`style`/`color`) | unset | Use instead of the linked `width`/`style`/`color` keys for per-side control |

#### Shape: Box Shadow / Text Shadow

The value is a JSON **array** of shadow objects (not a single object). Default: `[]` (no shadow).

```json
"[{\"x\":\"0px\",\"y\":\"4px\",\"blur\":\"16px\",\"spread\":\"0px\",\"color\":\"rgba(0,0,0,0.12)\",\"inset\":\"inset\"}]"
```

Text shadow (no `spread`/`inset`):
```json
"[{\"x\":\"1px\",\"y\":\"1px\",\"blur\":\"4px\",\"color\":\"rgba(0,0,0,0.3)\"}]"
```

| Key | Type | Notes |
|---|---|---|
| `x` | Scalar (length) | Horizontal offset |
| `y` | Scalar (length) | Vertical offset |
| `blur` | Scalar (length) | Blur radius |
| `spread` | Scalar (length) | Box shadow only |
| `color` | Color | |
| `inset` | Scalar (string) | Box shadow only. **Not a boolean** — the literal string `"inset"` to enable it, or `""`/omit for a normal outset shadow. |

Add more objects to the array for multiple shadows.

#### Shape: CSS Filters

Units are added automatically — pass raw numbers only. Default: `{}` (no filters; every value below is its visual no-op value). Only include keys you're changing.

```json
"{\"blur\":0,\"brightness\":100,\"contrast\":100,\"saturate\":100,\"hue-rotate\":0,\"invert\":0,\"grayscale\":0,\"sepia\":0}"
```

| Key | Unit added | No-op value | Editor slider range (sane bounds, not enforced) |
|---|---|---|---|
| `blur` | `px` | `0` | `0`–`10` |
| `brightness` | `%` | `100` | `0`–`200` |
| `contrast` | `%` | `100` | `0`–`200` |
| `saturate` | `%` | `100` | `0`–`200` |
| `hue-rotate` | `deg` | `0` | `0`–`360` |
| `invert` | `%` | `0` | `0`–`100` |
| `grayscale` | `%` | `0` | `0`–`200` |
| `sepia` | `%` | `0` | `0`–`100` |

#### Shape: Text Stroke

Default: `{}` (no stroke).

```json
"{\"width\":{\"Desktop\":\"1px\"},\"color\":\"#1a1a2e\"}"
```

| Key | Type |
|---|---|
| `width` | Responsive |
| `color` | Color |

---

## 3. Transform attributes

Individual top-level Responsive attributes (not a Stringified-JSON shape). Set only what you need; everything else defaults to unset/no-op. Pass raw numbers — units are added automatically. All of these are combined automatically into one CSS `transform` — you never compose the `transform` string yourself.

| Attribute | Auto unit | No-op |
|---|---|---|
| `rotateZ` | `deg` | `0` |
| `rotateX` | `deg` | `0` |
| `rotateY` | `deg` | `0` |
| `translateX` | as-is | `0` |
| `translateY` | as-is | `0` |
| `translateZ` | as-is | `0` |
| `scale` | multiplier (sets both X and Y) | `1` |
| `scaleX` | multiplier | `1` |
| `scaleY` | multiplier | `1` |
| `scale3DX` | multiplier | `1` |
| `scale3DY` | multiplier | `1` |
| `skewX` | `deg` | `0` |
| `skewY` | `deg` | `0` |
| `perspective` | as-is | `1000px` |

`transformOrigin` (Scalar string, default unset → browser default `50% 50%`): `"top left"` `"top center"` `"top right"` `"center left"` `"center center"` `"center right"` `"bottom left"` `"bottom center"` `"bottom right"` `"custom"`. Only when set to `"custom"`, also set `transformOriginX`/`transformOriginY` (Responsive, length/percentage) for a precise origin point.

Hover variants use the same names with a `Hover` suffix (`rotateZHover`, `scaleHover`, `translateZHover`, `scale3DXHover`, etc.) — same defaults, same units. `transformTransitionDuration` is a Scalar (number of seconds), default unset.

**You must turn transforms on explicitly — this is the single easiest transform mistake to make.** `applyTransform` (normal state) and `applyTransformHover` (hover state) are booleans that both default to **`false`**. If you set any transform attribute above but leave the matching enable flag off, the transform is **emitted as nothing — it has zero effect**. So:

- Set `"applyTransform": true` whenever you use **any** normal-state transform or `transformOrigin` attribute (`rotateZ`, `rotateX`, `scale`, `translateX`, `perspective`, `skewY`, `transformOrigin`, etc.).
- Set `"applyTransformHover": true` whenever you use **any** `*Hover` transform attribute (`scaleHover`, `rotateZHover`, …).

`applyTransformOriginCustom` is the one exception you still never set — it defaults `true` and auto-applies when `transformOrigin` is `"custom"`.

```json
"attributes": { "rotateZ": { "Desktop": "6" }, "scale": { "Desktop": "1.05" }, "applyTransform": true }
```

(Why it's off by default: when always-on, the global transform put a `perspective(...)` on every block wrapper, which made every block a containing block for `position: fixed` descendants and broke fixed/sticky overlays. It's now opt-in.)

**Do not use `transform` or `rotate`** (two separate legacy attributes, both Responsive, both doing a plain Z-axis `rotate({{VALUE}}deg)` directly on the CSS `transform` property). They exist for backwards compatibility and bypass the composable system entirely — mixing either of them with `rotateZ`/`scale`/etc. causes the two to fight over the same CSS property. Always use `rotateZ` for rotation, never `transform`/`rotate`.

**`rotate3D`, `scaleSeparate`, `translate3D` are editor-UI-only toggles** (booleans with no CSS effect of their own — they just decide which input fields the visual inspector shows, e.g. one "Scale" slider vs. separate X/Y sliders). They have no effect through the API; don't set them. Just set whichever real attributes you need (`scale` vs. `scaleX`/`scaleY`, etc.) directly, regardless of these flags.

---

## 4. Global attributes (available on every block)

Never set `blockClass`, `styles`, or `preview` — all three are internal/auto-managed (`preview` only controls the static thumbnail shown in the block inserter UI, default `false`; it has no effect on a real instance and is never something you'd want `true`). Every attribute below defaults to **unset** unless noted — omitting it means no effect, the block/browser default applies.

### Layout & sizing

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `padding` | Spacing (Responsive) | unset | |
| `margin` | Spacing (Responsive) | unset | |
| `widthType` | Responsive-Option | unset | `"auto"` `"100%"` `"custom"` — set `{"value":"custom"}` to enable `customWidth` |
| `customWidth` | Responsive | unset | Active when `widthType` = `"custom"` |
| `minWidth` | Responsive | unset | |
| `maxWidth` | Responsive | unset | |
| `zIndex` | Responsive | unset | |

### Position

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `position` | Responsive-Option | unset | `"relative"` `"absolute"` `"fixed"` `"sticky"` |
| `positionTop` | Responsive | unset | Only applies when `position` is set |
| `positionRight` | Responsive | unset | |
| `positionBottom` | Responsive | unset | |
| `positionLeft` | Responsive | unset | |

### Flex child (block is inside a flex container)

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `alignSelf` | Responsive-Option | unset | `"auto"` `"flex-start"` `"center"` `"flex-end"` `"stretch"` `"baseline"` |
| `justifySelf` | Responsive-Option | unset | `"auto"` `"start"` `"center"` `"end"` `"stretch"` |
| `flexOrder` | Responsive-Option | unset | `{"value":"1"}` · `{"value":"custom"}` + `flexCustomOrder` for an arbitrary number |
| `flexCustomOrder` | Responsive | unset | Active when `flexOrder` = `"custom"` |
| `flexGrow` | Responsive | unset | `"0"` = no grow, `"1"` = grow to fill |
| `flexShrink` | Responsive | unset | `"0"` = don't shrink, `"1"` = can shrink |

### Grid child (block is inside a grid container)

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `gridColumnStart` | Responsive | unset | |
| `gridColumnEnd` | Responsive | unset | e.g. `"span 2"` |
| `gridRowStart` | Responsive | unset | |
| `gridRowEnd` | Responsive | unset | e.g. `"span 2"` |

### Appearance

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `background` | Stringified-JSON (Background) | unset | Normal state |
| `backgroundHover` | Stringified-JSON (Background) | unset | Hover state |
| `backgroundHoverTransition` | Scalar (number, seconds) | unset | |
| `border` | Stringified-JSON (Border) | unset | Normal state |
| `borderHover` | Stringified-JSON (Border) | unset | Hover state |
| `borderRadius` | Border-Radius | unset | |
| `borderRadiusHover` | Border-Radius | unset | |
| `borderHoverTransition` | Scalar (number, seconds) | unset | |
| `boxShadow` | Stringified-JSON (Box Shadow) | unset | Normal state |
| `boxShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover state |
| `customCss` | Scalar (string, raw CSS) | no-op template | See §5 |
| `classManager` | Array of `{id, title}` | `[]` | See §6 |
| `classManagerSubselector` | Array of `{id, title, parent}` | `[]` | See §6 |

---

## 5. `customCss` — last resort only

`customCss` lets you write raw CSS for a single block instance. The decision is about **reuse first, attribute availability second** — check in this order, every time:

1. **Is this style needed on more than one block, or reused across pages?** → use Class Manager (§6), even if an attribute exists that could also produce it. Repeating the same attribute value (especially a long Stringified-JSON one) on every block duplicates that data and its generated CSS each time; a Class is defined once and referenced everywhere, so it stays optimized instead of duplicated.
2. **One-off (this single block only) — does a global attribute cover it?** (padding, margin, background, border, borderRadius, boxShadow, transform, position, flex/grid child props) → use that attribute.
3. **One-off — does a block-specific attribute cover it?** (check that block's table) → use that attribute.
4. **One-off, and neither exists** → use `customCss` as the last resort.

Never use `customCss` for a one-off style that an attribute already does (e.g. padding, a background color, a border-radius) — it bypasses the responsive system, hover-state system, and editor preview. And never repeat the same attribute value across many blocks when a Class would do it once.

Format: plain CSS, with `{{SELECTOR}}` as a placeholder for this block's scoped wrapper selector.

```json
"customCss": "{{SELECTOR}} { background: linear-gradient(135deg,#667eea,#764ba2); } {{SELECTOR}}:hover { opacity: 0.9; }"
```

```json
"customCss": "{{SELECTOR}} h2 { font-size: 3rem; } {{SELECTOR}} .wp-block-blockish-button { margin-top: 24px; }"
```

---

## 6. Class Manager classes

Classes created via `blockish/manage-class` (see `class-manager-docs.md`) attach to a block through two attributes.

`classManager` — apply a parent class (no `parent_id`):
```json
"classManager": [{"id": 45, "title": "hero-card"}]
```

`classManagerSubselector` — apply a child class (has a `parent_id`). The `parent` key is **required**; without it the class has no effect, and the matching parent class must also be in `classManager` on the same block:
```json
"classManagerSubselector": [{"id": 67, "title": "featured", "parent": 45}]
```

Workflow: call `blockish/get-classes` to check for an existing class → if needed, `blockish/manage-class` (action `create`) → use the returned `post_id`/`name` in `classManager`/`classManagerSubselector`. Defining a class's styles is a separate concern (you write a JSON **style object**, not CSS — never raw CSS/meta), fully covered in `class-manager-docs.md`; it is unrelated to block markup generation.

---

