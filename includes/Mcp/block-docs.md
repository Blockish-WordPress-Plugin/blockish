# Blockish Block Reference

## 1. How to read this doc

You (the AI) build a **schema**: a JSON tree of `{ name, attributes, innerBlocks }` objects. That is your entire job.

- `name` — block name, e.g. `"blockish/container"`.
- `attributes` — only the attributes you want different from their default. Anything you omit automatically falls back to the block's registered default — you never need to repeat a default value, and you never need to compute what an omitted value "renders as." That is handled for you.
- `innerBlocks` — array of child schema nodes, same shape, recursive. Only for blocks marked "Accepts children: yes" below.

**You never write HTML, CSS classes, or comment markup of any kind.** Turning your schema into real Gutenberg blocks happens in the editor, not by you. Do not include a `content` field. Do not try to reproduce a block's rendered HTML. If you find yourself writing an HTML tag, stop — that's a sign you've stepped outside your job.

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

You never need to set `applyTransform`, `applyTransformHover`, or `applyTransformOriginCustom` — all three default to `true` and apply automatically whenever you set any transform/transformOrigin attribute above.

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

Workflow: call `blockish/get-classes` to check for an existing class → if needed, `blockish/manage-class` (action `create`) → use the returned `post_id`/`name` in `classManager`/`classManagerSubselector`. Writing the CSS for a class is a separate concern, fully covered in `class-manager-docs.md` — it is unrelated to block markup generation.

---

## 7. Per-block reference

"Accepts children" tells you whether `innerBlocks` is valid for that block. Leaf blocks (no) must not have `innerBlocks`.

### 7.1 WP-core `anchor` / `align` (not in each block's own attribute list)

These two are not custom Blockish attributes — they come from WordPress core's block "supports" system, but they're real, settable attributes via your schema's `attributes` object just like any other.

- `anchor` (Scalar string) — sets the block wrapper's HTML `id`. Supported by **every Blockish block except `blockish/button`**.
- `align` (Scalar string, `"wide"` or `"full"`) — WP-core wide/full-width alignment (theme-dependent visual effect). Supported by top-level/standalone blocks (container, heading, image, video, icon, rating, counter, progress-bar, google-map, icon-list, social-icons, tab, accordion) — **not** supported by child-only blocks (`accordion-item`, `icon-list-item`, `social-icon-item`, `tab-item`) or by `blockish/button`.

Each block's table below calls these out only where relevant (container, button); assume `anchor` works everywhere else unless noted.

---

### `blockish/container`

The primary layout block — flexbox or CSS grid. **Accepts children: yes.**

**Hard requirement:** `isVariationPicked` defaults to `false` but must always be set to `true` in `attributes`. Without it, the block renders its empty layout-picker placeholder instead of any content — this is the one attribute that breaks the omit-if-default rule.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `isVariationPicked` | Scalar (boolean) | `false` | **Always set to `true`.** |
| `tagName` | Option | `{"label":"Div","value":"div"}` | `Div`/`div` · `Section`/`section` · `Article`/`article` · `Main`/`main` · `Aside`/`aside` · `Header`/`header` · `Footer`/`footer` |
| `display` | Scalar (string) | `"flex"` | `"flex"` `"grid"` |
| `containerWidth` | Scalar (string) | `"alignfull"` | `"alignfull"` `"alignwide"` `"align-custom-width"` (with `customWidthContainer`) — **the custom option's value is the literal string `"align-custom-width"`, not `"custom"`** |
| `customWidthContainer` | Responsive | `{"Desktop":"100%"}` | Active when `containerWidth` = `"align-custom-width"` |
| `containerMinHeight` | Responsive | `{"Desktop":"0"}` | |
| `overflow` | Responsive-Option | unset | `"visible"` `"hidden"` `"scroll"` `"auto"` |
| `flexDirection` | Responsive-Option | `{"Desktop":{"label":"Row","value":"row"}}` | `Row`/`row` · `Column`/`column` · `Row Reverse`/`row-reverse` · `Column Reverse`/`column-reverse` |
| `flexWrap` | Responsive-Option | unset | `Wrap`/`wrap` · `No Wrap`/`nowrap` · `Reverse`/`wrap-reverse` |
| `justifyContent` | Responsive-Option | `{"Desktop":{"label":"Center","value":"center"}}` | `Start`/`flex-start` · `End`/`flex-end` · `Center`/`center` · `Space Between`/`space-between` · `Space Around`/`space-around` · `Space Evenly`/`space-evenly` |
| `alignItems` | Responsive-Option | `{"Desktop":{"label":"Center","value":"center"}}` | `Start`/`flex-start` · `End`/`flex-end` · `Center`/`center` · `Stretch`/`stretch` — **no `baseline` option** (despite the global `alignSelf` attribute supporting it) |
| `columnGap` | Responsive | unset | |
| `rowGap` | Responsive | unset | |
| `gridLayoutType` | Scalar (string) | `"auto"` | `"auto"` (auto-fit columns) `"fixed"` (explicit count) |
| `gridColumns` | Responsive | `{"Desktop":3,"Tablet":2,"Mobile":1}` | Used when `gridLayoutType` = `"fixed"` |
| `gridRows` | Responsive | `{"Desktop":1}` | Used when `gridLayoutType` = `"fixed"` |
| `autoGridWidth` | Responsive | `{"Desktop":"12rem"}` | Used when `gridLayoutType` = `"auto"` |
| `autoGridHeight` | Responsive | unset | |
| `containerBackground` | Stringified-JSON (Background) | unset | Normal state. **Only this attribute supports `backgroundType:"video"`.** |
| `containerHoverBackground` | Stringified-JSON (Background) | unset | Hover state |
| `containerBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Normal state |
| `containerHoverBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Hover state |
| `containerBorder` | Stringified-JSON (Border) | unset | Normal state |
| `containerHoverBorder` | Stringified-JSON (Border) | unset | Hover state |
| `containerBorderRadius` | Border-Radius | unset | Normal state |
| `containerHoverBorderRadius` | Border-Radius | unset | Hover state |
| `containerBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal state |
| `containerHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover state |
| `anchor` | Scalar (string) | unset | WP-core "HTML anchor" — sets the element's `id`. See §7.1. |
| `align` | Scalar (string) | unset | `"wide"` `"full"` — WP-core wide/full alignment. See §7.1. |

Minimal schema:
```json
{
  "name": "blockish/container",
  "attributes": { "isVariationPicked": true },
  "innerBlocks": []
}
```

---

### `blockish/heading`

A heading element with full text styling. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `content` | Scalar (string, HTML allowed) | `"Heading Text"` | |
| `tag` | Option | `{"label":"H2","value":"h2"}` | `H1`/`h1` · `H2`/`h2` · `H3`/`h3` · `H4`/`h4` · `H5`/`h5` · `H6`/`h6` · `P`/`p` · `Span`/`span` · `Div`/`div` — only these 9, no `section`/`article`/`main`/etc. (those belong to `blockish/container`'s `tagName`, a different attribute) |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | Normal |
| `hoverColor` | Color | unset | Hover |
| `textShadow` | Stringified-JSON (Box Shadow) | unset | Normal |
| `textShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover |

Minimal schema:
```json
{
  "name": "blockish/heading",
  "attributes": { "content": "Build Faster", "tag": { "label": "H1", "value": "h1" } }
}
```

---

### `blockish/button`

A call-to-action link. **Accepts children: no.**

**Hard rule — check this every single time you place a button:** does this button need to be centered, right-aligned, or anything other than flush-left in its parent? If yes, you **must** set `buttonPlacement` on the button itself. Setting `alignItems`/`justifyContent` on the parent `blockish/container` has **no effect** on a button's position — that is the single most common mistake when placing buttons. There is no other attribute, on any block, that positions a button. If a button looks stuck on the left when it should be centered, the fix is always `buttonPlacement`, never a parent attribute.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `text` | Scalar (string) | `"Click Here"` | |
| `url` | Link | unset | |
| `icon` | Icon | unset | |
| `iconPosition` | Scalar (string) | `"row"` | `"row"` (icon before text) `"row-reverse"` (icon after) — order of icon vs. text inside the button |
| `buttonPlacement` | Responsive-Option | unset | **Required whenever the button isn't meant to sit flush-left.** `"flex-start"` `"center"` `"flex-end"` — horizontal position of the **whole button** within its parent container. The parent's `alignItems`/`justifyContent` does NOT center a button; use this instead. Mobile-only centering: `{"Desktop":{"value":"flex-end"},"Mobile":{"value":"center"}}` |
| `buttonAlignment` | Responsive-Option | unset | `"left"` `"center"` `"right"` — aligns the icon+text **inside** the button (text-align + justify-content on the inner link), independent of `buttonPlacement` |
| `buttonContentSpacing` | Responsive | unset | Gap between icon and text inside the button |
| `buttonTextColor` | Color | unset | Normal |
| `buttonHoverTextColor` | Color | unset | Hover |
| `buttonBackground` | Stringified-JSON (Background) | unset | Normal |
| `buttonHoverBackground` | Stringified-JSON (Background) | unset | Hover |
| `buttonBorder` | Stringified-JSON (Border) | unset | Normal |
| `buttonHoverBorderColor` | Color | unset | Hover border color override |
| `buttonBorderRadius` | Border-Radius | unset | |
| `buttonPadding` | Spacing | unset | |
| `buttonTypography` | Stringified-JSON (Typography) | unset | |
| `buttonTextShadow` | Stringified-JSON (Box Shadow) | unset | |
| `buttonBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal |
| `buttonHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover |
| `buttonHoverTransition` | Scalar (number, seconds) | unset | |
| `buttonWidth` | Responsive | unset | |
| `buttonMinHeight` | Responsive | unset | |
| `buttonIconSize` | Responsive | unset | |

`blockish/button` does **not** support `anchor` or `align` (no `id`, no wide/full alignment) — unlike almost every other Blockish block. See §7.1.

Minimal schema:
```json
{
  "name": "blockish/button",
  "attributes": { "text": "Get Started Free", "url": { "url": "/signup", "newTab": false } }
}
```

---

### `blockish/icon`

A single standalone SVG icon. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `icon` | Icon | 5-point star | |
| `link` | Link | unset | Makes the icon a link |
| `size` | Responsive | unset | |
| `color` | Color | unset | Normal |
| `hoverColor` | Color | unset | Hover |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `rotation` | Responsive | unset | Normal |
| `rotationHover` | Responsive | unset | Hover |

Minimal schema:
```json
{ "name": "blockish/icon", "attributes": {} }
```

---

### `blockish/image`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `image` | Image | unset | |
| `alt` | Scalar (string) | unset | |
| `imageSize` | Option | `{"value":"full","label":"Full Size"}` | `Thumbnail`/`thumbnail` · `Medium`/`medium` · `Large`/`large` · `Full Size`/`full` |
| `captionType` | Scalar (string) | `"none"` | `"none"` `"attachment"` (WP media caption) `"custom"` (use `customCaption`) |
| `customCaption` | Scalar (string) | unset | Used when `captionType` = `"custom"` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `imageWidth` | Responsive | unset | |
| `imageMaxWidth` | Responsive | unset | |
| `imageHeight` | Responsive | unset | |
| `objectFit` | Responsive-Option | unset | `None`/`none` · `Fill`/`fill` · `Cover`/`cover` · `Contain`/`contain` — only these 4, no `scale-down`. Only meaningful when `imageHeight` is also set for that device (object-fit needs a constrained box to fit into) |
| `imageBorderRadiusNormal` | Border-Radius | unset | |
| `imageBorderNormal` | Stringified-JSON (Border) | unset | |
| `imageBoxShadowNormal` | Stringified-JSON (Box Shadow) | unset | |
| `imageCSSFiltersNormal` | Stringified-JSON (CSS Filters) | unset | Normal |
| `imageCSSFiltersHover` | Stringified-JSON (CSS Filters) | unset | Hover |
| `imageOpacityNormal` | Scalar (number, 0–1) | unset | |
| `imageOpacityHover` | Scalar (number, 0–1) | unset | |
| `imageHoverTransition` | Scalar (number, seconds) | unset | |

Minimal schema:
```json
{
  "name": "blockish/image",
  "attributes": { "image": { "id": 123, "url": "https://example.com/photo.jpg", "width": 1200, "height": 800 }, "alt": "Team photo" }
}
```

---

### `blockish/video`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `sourceType` | Option | `{"label":"YouTube","value":"youtube"}` | `YouTube`/`youtube` · `Vimeo`/`vimeo` · `Self-hosted`/`selfHosted` |
| `youtubeUrl` | Scalar (string, URL) | demo placeholder | Always override |
| `vimeoUrl` | Scalar (string, URL) | demo placeholder | Always override |
| `selfHostedVideo` | Image (video file) | unset | |
| `selfHostedUrl` | Scalar (string, URL) | unset | Fallback if no media object |
| `poster` | Scalar (string, URL) | unset | |
| `autoplay` | Scalar (boolean) | `false` | |
| `loop` | Scalar (boolean) | `false` | |
| `muted` | Scalar (boolean) | `false` | Set `true` if `autoplay` is `true` |
| `playOnMobile` | Scalar (boolean) | `true` | |
| `controls` | Scalar (boolean) | `true` | |
| `preload` | Scalar (string) | `"metadata"` | `"none"` `"metadata"` `"auto"` — self-hosted only |
| `lazyLoad` | Scalar (boolean) | `true` | |
| `startTime` | Scalar (number, seconds) | `0` | |
| `endTime` | Scalar (number, seconds) | `0` | `0` = play to end |
| `captions` | Scalar (boolean) | `false` | |
| `privacyMode` | Scalar (boolean) | `false` | YouTube no-cookie domain |
| `suggestedVideos` | Option | `{"label":"Current Channel","value":"currentChannel"}` | `Current Channel`/`currentChannel` · `Any Video`/`anyVideo` |
| `videoAspectRatio` | Option | `{"label":"16:9","value":"16 / 9"}` | `Auto`/`"auto"` · `16:9`/`"16 / 9"` · `4:3`/`"4 / 3"` · `1:1`/`"1 / 1"` · `21:9`/`"21 / 9"` — note `value` uses a spaced `" / "`, not a bare `/` |
| `showOverlay` | Scalar (boolean) | `false` | |
| `overlayImage` | Image | unset | |
| `showOverlayPlayIcon` | Scalar (boolean) | `true` | |
| `videoCSSFilters` | Stringified-JSON (CSS Filters) | unset | |

Minimal schema:
```json
{
  "name": "blockish/video",
  "attributes": { "sourceType": { "label": "YouTube", "value": "youtube" }, "youtubeUrl": "https://www.youtube.com/watch?v=XXXXX" }
}
```

---

### `blockish/google-map`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `location` | Scalar (string) | `"New York, NY"` | Always override |
| `zoom` | Scalar (integer) | `14` | `1` (world) – `20` (building) |
| `mapHeight` | Scalar (string, CSS length) | `"360px"` | |
| `mapCSSFiltersNormal` | Stringified-JSON (CSS Filters) | unset | |
| `mapCSSFiltersHover` | Stringified-JSON (CSS Filters) | unset | |
| `mapHoverTransition` | Scalar (number, seconds) | unset | |

Minimal schema:
```json
{
  "name": "blockish/google-map",
  "attributes": { "location": "1600 Amphitheatre Parkway, Mountain View, CA", "zoom": 14 }
}
```

---

### `blockish/icon-list`

A list of icon+text rows. **Accepts children: yes** (only `blockish/icon-list-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `layout` | Scalar (string) | `"column"` | `"column"` (stacked) `"row"` (horizontal) |
| `rowGap` | Responsive | `{"Desktop":"12px"}` | |
| `columnGap` | Responsive | `{"Desktop":"12px"}` | Used when `layout` = `"row"` |
| `itemPadding` | Spacing | unset | |
| `itemContentSpacing` | Responsive | `{"Desktop":"10px"}` | Gap between icon and text |
| `itemIconSize` | Responsive | unset | |
| `itemIconColor` | Color | unset | Normal |
| `itemIconHoverColor` | Color | unset | Hover |
| `itemIconHoverTransition` | Scalar (number, seconds) | `0.2` | |
| `itemTextColor` | Color | unset | Normal |
| `itemTextHoverColor` | Color | unset | Hover |
| `itemTextHoverTransition` | Scalar (number, seconds) | `0.2` | |
| `itemTextTypography` | Stringified-JSON (Typography) | unset | |

Minimal schema:
```json
{
  "name": "blockish/icon-list",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/icon-list-item", "attributes": { "text": "Free forever plan" } }
  ]
}
```

---

### `blockish/icon-list-item`

Must be a child of `blockish/icon-list`. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `text` | Scalar (string, HTML allowed) | `"Icon list item"` | |
| `icon` | Icon | star icon | |
| `link` | Link | unset | |
| `iconSize` | Responsive | unset | |
| `iconColor` | Color | unset | Normal |
| `iconHoverColor` | Color | unset | Hover |
| `textColor` | Color | unset | Normal |
| `textHoverColor` | Color | unset | Hover |
| `iconHoverTransition` | Scalar (number, seconds) | `0.2` | |
| `textHoverTransition` | Scalar (number, seconds) | `0.2` | |

---

### `blockish/rating`

A star/icon rating display. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `rating` | Scalar (number) | `5` | Decimals allowed |
| `ratingScale` | Scalar (integer) | `5` | Typically `5` or `10` |
| `icon` | Icon | star icon | |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `iconSize` | Responsive | `{"Desktop":"24px"}` | |
| `iconSpacing` | Responsive | `{"Desktop":"6px"}` | |
| `iconColor` | Color | unset | Filled/active |
| `unmarkedColor` | Color | unset | Unfilled |

Minimal schema:
```json
{ "name": "blockish/rating", "attributes": { "rating": 4.5 } }
```

---

### `blockish/counter`

An animated counting number. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `startNumber` | Scalar (number) | `0` | |
| `endNumber` | Scalar (number) | `100` | |
| `numberPrefix` | Scalar (string) | `""` | |
| `numberSuffix` | Scalar (string) | `""` | |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `thousandSeparator` | Scalar (boolean) | `true` | `true` → `1,000`; `false` → `1000` |
| `separator` | Option | `{"label":"Default","value":"default"}` | Only shown/used when `thousandSeparator` is `true`. `Default (,)`/`default` · `Dot (.)`/`dot` · `Space`/`space` · `Underscore (_)`/`underscore` · `Apostrophe (')`/`apostrophe` |
| `title` | Scalar (string) | `"Cool Number"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Same enum as heading's `tag` (§Heading): `h1`–`h6`, `p`, `span`, `div` |
| `titlePosition` | Scalar (string) | `"before"` | `"before"` (above number) `"after"` (below) `"start"` (left, in a row) `"end"` (right, in a row) — `"start"`/`"end"` also enable `titleVerticalAlignment` |
| `titleHorizontalAlignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `titleVerticalAlignment` | Responsive | `{"Desktop":"center"}` | `"top"` `"center"` `"bottom"` |
| `titleGap` | Responsive | `{"Desktop":"8px"}` | |
| `numberPosition` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `numberTextColor` | Color | unset | |
| `numberTypography` | Stringified-JSON (Typography) | unset | |
| `titleTextColor` | Color | unset | |
| `titleTypography` | Stringified-JSON (Typography) | unset | |

Minimal schema:
```json
{
  "name": "blockish/counter",
  "attributes": { "endNumber": 500, "numberSuffix": "+", "title": "Happy Clients" }
}
```

---

### `blockish/progress-bar`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Progress"` | |
| `titleTag` | Option | `{"label":"H4","value":"h4"}` | Same enum as heading's `tag` (§Heading) |
| `showTitle` | Scalar (boolean) | `true` | |
| `percentage` | Scalar (integer, 0–100) | `50` | |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `displayPercentage` | Scalar (boolean) | `true` | |
| `innerText` | Scalar (string) | placeholder text | Always override; replaces the percentage label when set |
| `percentageFillColor` | Color | unset | |
| `percentageBackgroundColor` | Color | unset | |
| `percentageHeight` | Responsive | unset | |
| `percentageBorderRadius` | Responsive | unset | |
| `titleTextColor` | Color | unset | |
| `innerTextColor` | Color | unset | |

Minimal schema:
```json
{
  "name": "blockish/progress-bar",
  "attributes": { "title": "JavaScript", "percentage": 85 }
}
```

---

### `blockish/social-icons`

**Accepts children: yes** (only `blockish/social-icon-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `shape` | Scalar (string) | `"circle"` | `"circle"` `"square"` `"rounded"` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `columns` | Responsive | `{"Desktop":"auto-fit"}` | `"auto-fit"` or an integer |
| `iconColorMode` | Scalar (string) | `"official"` | `"official"` (brand colors) `"custom"` (use `iconColor`) |
| `iconColor` | Color | unset | Active when `iconColorMode` = `"custom"` |
| `iconSecondaryColor` | Color | `"#FFFFFF"` | |
| `iconSize` | Responsive | unset | |
| `iconPadding` | Spacing | unset | |
| `iconSpacing` | Responsive | `{"Desktop":"12px"}` | |
| `iconRowsGap` | Responsive | `{"Desktop":"12px"}` | |
| `iconBorder` | Stringified-JSON (Border) | unset | |
| `iconBorderRadius` | Border-Radius | unset | |
| `hoverAnimation` | Scalar (string) | `"none"` | `"none"` `"float"` `"sink"` `"grow"` `"spin"` `"pulse"` |

Minimal schema:
```json
{
  "name": "blockish/social-icons",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/social-icon-item", "attributes": { "network": "instagram", "label": "Instagram", "officialColor": "#E1306C", "link": { "url": "https://instagram.com/username", "newTab": true } } }
  ]
}
```

---

### `blockish/social-icon-item`

Must be a child of `blockish/social-icons`. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `network` | Scalar (string) | `"facebook"` | `facebook` `twitter` `instagram` `linkedin` `youtube` `pinterest` `tiktok` `github` `dribbble` `behance` `snapchat` `reddit` `whatsapp` `telegram` `discord` |
| `label` | Scalar (string) | `"Facebook"` | Keep in sync with `network` |
| `icon` | Icon | matches default `network` (Facebook glyph) | Override when changing `network` |
| `officialColor` | Color | `"#1877F2"` | Override when changing `network` |
| `link` | Link | unset | |

---

### `blockish/accordion`

**Accepts children: yes** (only `blockish/accordion-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `maxItemExpanded` | Scalar (string) | `"one"` | `"one"` (single open panel) `"many"` (multiple allowed) |
| `faqSchema` | Scalar (boolean) | `false` | Adds `FAQPage` JSON-LD |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon right) `"row-reverse"` (icon left) |
| `itemPosition` | Responsive | `{"Desktop":"start"}` | `"start"` `"center"` `"end"` |
| `itemsSpaceBetween` | Responsive | unset | |
| `distanceBetweenContent` | Responsive | unset | |
| `accordionBackgroundNormal` | Stringified-JSON (Background) | unset | |
| `accordionBorderNormal` | Stringified-JSON (Border) | unset | |
| `accordionBorderRadius` | Border-Radius | unset | |
| `accordionPadding` | Spacing | unset | |
| `headerTypography` | Stringified-JSON (Typography) | unset | |
| `headerTextColor` | Color | unset | Normal |
| `headerTextColorHover` | Color | unset | Hover |
| `headerTextColorActive` | Color | unset | Active/open |
| `iconColor` | Color | unset | Toggle icon, normal |
| `iconColorHover` | Color | unset | Toggle icon, hover |
| `iconColorActive` | Color | unset | Toggle icon, active |
| `iconSize` | Responsive | unset | |
| `contentBackground` | Stringified-JSON (Background) | unset | |
| `contentTextColor` | Color | unset | |
| `contentPadding` | Spacing | unset | |

Minimal schema:
```json
{
  "name": "blockish/accordion",
  "attributes": { "faqSchema": true },
  "innerBlocks": [
    { "name": "blockish/accordion-item", "attributes": { "title": "What is Blockish?", "defaultOpen": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Blockish is a Gutenberg block plugin." } } ] },
    { "name": "blockish/accordion-item", "attributes": { "title": "Is it free?" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Yes, the core plugin is free." } } ] }
  ]
}
```

(`maxItemExpanded` is omitted because `"one"` is already the default.)

---

### `blockish/accordion-item`

Must be a child of `blockish/accordion`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Accordion item"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Same enum as heading's `tag` (§Heading) |
| `defaultOpen` | Scalar (boolean) | `false` | Set `true` on exactly one item to open it by default |
| `expandIcon` | Icon | plus icon | Shown while panel is collapsed |
| `collapseIcon` | Icon | minus icon | Shown while panel is expanded |
| `itemId` | Scalar (string) | auto-generated | Leave unset |

---

### `blockish/tab`

**Accepts children: yes** (only `blockish/tab-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `direction` | Responsive | `{"Desktop":"column"}` | `"column"` (nav on top) `"row"` (nav on side) |
| `defaultActiveTab` | Scalar (integer) | `0` | Zero-based index — must match the `tab-item` with `defaultActive: true` |
| `justify` | Responsive | `{"Desktop":"flex-start"}` | `"flex-start"` `"center"` `"flex-end"` `"space-between"` |
| `alignTitle` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` |
| `navGap` | Responsive | `{"Desktop":"10px"}` | |
| `distanceFromContent` | Responsive | `{"Desktop":"10px"}` | |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon left) `"row-reverse"` (icon right) |
| `tabsBackgroundNormal` | Stringified-JSON (Background) | unset | |
| `tabsBackgroundHover` | Stringified-JSON (Background) | unset | |
| `tabsBackgroundActive` | Stringified-JSON (Background) | unset | |
| `tabsBorderNormal` | Stringified-JSON (Border) | unset | |
| `tabsBorderActive` | Stringified-JSON (Border) | unset | |
| `tabsBorderRadius` | Border-Radius | unset | |
| `tabsPadding` | Spacing | unset | |
| `titleTypography` | Stringified-JSON (Typography) | unset | |
| `titleColorNormal` | Color | unset | |
| `titleColorHover` | Color | unset | |
| `titleColorActive` | Color | unset | |
| `iconSize` | Responsive | unset | |
| `iconColorNormal` | Color | unset | |
| `iconColorActive` | Color | unset | |
| `contentBackground` | Stringified-JSON (Background) | unset | |
| `contentColor` | Color | unset | |
| `contentBorder` | Stringified-JSON (Border) | unset | |
| `contentBorderRadius` | Border-Radius | unset | |
| `contentPadding` | Spacing | unset | |

Minimal schema:
```json
{
  "name": "blockish/tab",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/tab-item", "attributes": { "title": "Overview", "defaultActive": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Overview content here." } } ] },
    { "name": "blockish/tab-item", "attributes": { "title": "Features" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Features content here." } } ] }
  ]
}
```

---

### `blockish/tab-item`

Must be a child of `blockish/tab`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Tab"` | |
| `tabIcon` | Icon | unset | |
| `defaultActive` | Scalar (boolean) | `false` | Set `true` on exactly one item — index must match parent's `defaultActiveTab` |

---

## 8. Composite examples

### Hero section (nested container + heading + button)

```json
{
  "name": "blockish/container",
  "attributes": {
    "isVariationPicked": true,
    "flexDirection": { "Desktop": { "label": "Column", "value": "column" } },
    "containerMinHeight": { "Desktop": "100vh" },
    "containerBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#0f172a\"}",
    "padding": { "top": "80px", "right": "40px", "bottom": "80px", "left": "40px" }
  },
  "innerBlocks": [
    {
      "name": "blockish/heading",
      "attributes": { "content": "Welcome", "tag": { "label": "H1", "value": "h1" }, "color": "#ffffff" }
    },
    {
      "name": "blockish/button",
      "attributes": {
        "text": "Get Started Free",
        "url": { "url": "/signup", "newTab": false },
        "buttonPlacement": { "Desktop": { "value": "center" } },
        "buttonBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#1a73e8\"}",
        "buttonTextColor": "#ffffff",
        "buttonPadding": { "top": "14px", "right": "28px", "bottom": "14px", "left": "28px" },
        "buttonBorderRadius": { "Desktop": { "topLeft": "6px", "topRight": "6px", "bottomRight": "6px", "bottomLeft": "6px" } }
      }
    }
  ]
}
```

`buttonPlacement` is set here even though the container's `alignItems` is already Center — that container setting only affects how the button's wrapper *box* is sized in the column, not where the visible button sits inside it (the wrapper is hard-width: 100% regardless). Without `buttonPlacement: {"Desktop":{"value":"center"}}`, this button would render flush-left despite the "centered" hero layout.

Note what's omitted because it already matches the container's defaults: `display` (defaults `"flex"`), `alignItems`/`justifyContent` (both default Center), `containerWidth` (defaults `"alignfull"`). Only `isVariationPicked` (required override), `flexDirection`, `containerMinHeight`, `containerBackground`, and `padding` actually differ from default.

### Stats row (grid container with three counters)

```json
{
  "name": "blockish/container",
  "attributes": {
    "isVariationPicked": true,
    "display": "grid",
    "gridLayoutType": "fixed",
    "gridColumns": { "Desktop": 3, "Tablet": 2, "Mobile": 1 },
    "columnGap": { "Desktop": "32px" }
  },
  "innerBlocks": [
    { "name": "blockish/counter", "attributes": { "endNumber": 500, "numberSuffix": "+", "title": "Happy Clients" } },
    { "name": "blockish/counter", "attributes": { "endNumber": 99, "numberSuffix": "%", "title": "Uptime" } },
    { "name": "blockish/counter", "attributes": { "endNumber": 24, "numberSuffix": "/7", "title": "Support" } }
  ]
}
```

`display: "grid"` is included because it differs from the container default (`"flex"`). `gridLayoutType: "fixed"` must be set explicitly — its own default is `"auto"`, and `gridColumns`/`gridRows` only take effect when `gridLayoutType` = `"fixed"`; setting `gridColumns` alone (as an earlier version of this example did) silently has no effect.

### FAQ accordion

```json
{
  "name": "blockish/accordion",
  "attributes": { "faqSchema": true },
  "innerBlocks": [
    {
      "name": "blockish/accordion-item",
      "attributes": { "title": "What is Blockish?", "defaultOpen": true },
      "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Blockish is a Gutenberg block plugin." } } ]
    },
    {
      "name": "blockish/accordion-item",
      "attributes": { "title": "Is it free?" },
      "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Yes, the core plugin is free." } } ]
    }
  ]
}
```

---

## 9. TODO / needs verification

None open — every item previously flagged here (`flexWrap`/`justifyContent`/`alignItems` labels, `tag` p/span labels, `objectFit` enum, `videoAspectRatio` enum, `separator` enum, `position` enum, the stats-row `gridLayoutType` example bug) has been re-verified directly against the relevant `inspector.js`/`block.json` source and corrected in place above. If you add a new attribute reference without reading its inspector source, flag it here rather than guessing.

---

## 10. Runtime gotchas (learned by driving the MCP, not obvious from source)

These are behaviors confirmed by actually using the abilities end-to-end, not just by reading code. If something here ever looks wrong, re-verify against the actual ability/block source before trusting either source over the other.

- **`block_schema` REPLACES the staged schema, it does not merge or append.** Calling `blockish/manage-post` with `block_schema` again before the previous one has been applied in the editor discards the old pending schema entirely. There is no "add to the pending schema" — always submit the complete schema you want staged.
- **`get-posts`' `content` field reflects only what's already been *applied* in the editor**, not whatever schema is currently pending/staged. Read it to know the real, live state of a post before building an edit — it will not show you what an unapplied pending schema would add.
- **There is no single-attribute patch for an already-applied block.** To correct something a human already approved into real blocks: read the post's current `content`, find the block in question, build a corrected replacement schema for that block/section (reproducing every attribute they already have — not just the one you're changing, or you will silently revert their other edits), stage it, then have the human select the old block in the editor and apply via **Replace**. Never write raw `<!-- wp:blockish/... -->` markup into `post_content` directly — that bypasses the whole apply flow and produces invalid/empty blocks (see earlier sections on why hand-written markup fails).
- **Very large or deeply nested schemas (~4+ levels deep) can fail with a misleading error** like `name is a required property of block_schema[0]` — this is a size/depth limit being hit, not an actual schema mistake. If you see this error on a structurally-correct schema: flatten unnecessary wrapper levels (e.g. put an icon directly on a card-like block instead of wrapping it in an extra container "chip"), and split a large page into multiple `manage-post` calls (e.g. stage and apply one section at a time) rather than one giant nested tree.
- **Featured image is two calls, in order:** `blockish/get-media` first (check if a suitable image already exists) → `blockish/upload-media` only if needed (public, direct `.jpg`/`.jpeg`/`.png`/`.gif`/`.webp` URL) → pass the resulting `attachment_id` as `featured_media` to `blockish/manage-post`.
- **Global Styles are reachable through `blockish/manage-post` too** — they're an ordinary post of type `wp_global_styles`, one per active theme, with the style overrides stored as JSON in `post_content`. This lets you override theme.json-level settings (which you otherwise cannot touch via any ability) without modifying any file — fully reversible the same way. No ability reports which theme is active or which `wp_global_styles` post belongs to it; infer it as the most-recently-modified `wp_global_styles` post (via `blockish/get-posts` with `post_type: "wp_global_styles"`), or ask. Example payload to remove block gap site-wide:
  ```json
  {"version":3,"isGlobalStylesUserThemeJSON":true,"styles":{"spacing":{"blockGap":"0px"}}}
  ```
