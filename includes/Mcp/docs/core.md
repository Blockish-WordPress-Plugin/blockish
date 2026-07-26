# Blockish Block Reference

## 1. How to read this doc

You (the AI) build a **schema**: a JSON tree of `{ name, attributes, innerBlocks }` objects. That is your entire job.

- `name` — block name, e.g. `"blockish/container"`.
- `attributes` — only the attributes you want different from their default. Anything you omit automatically falls back to the block's registered default — you never need to repeat a default value, and you never need to compute what an omitted value "renders as." That is handled for you.
- `innerBlocks` — array of child schema nodes, same shape, recursive. Only for blocks marked "Accepts children: yes" below.

**You never write block HTML, CSS classes, or hand-built block trees as markup.** Section design is always `{ name, attributes, innerBlocks }` schema (usually via `blockish/manage-pattern`). The HTML markup and CSS mappings in block docs are **examples for understanding** only — never reproduce a block's rendered HTML or write CSS directly (except in `customCss`). If you find yourself writing an HTML tag for a Blockish block, stop.

**Never write layouts into `post_content`.** Pages, templates, patterns, and forms are always staged as `block_schema` (pending). Pending pattern/form schemas only resolve when the editor is open — so do **not** assemble empty pages with live pattern-ref markup or share a preview/`post_url`. Always share `edit_url` and ask the user to Accept.

*Note on CSS Mappings:* In the block docs, you will see CSS mappings like `.{{WRAPPER}} -> padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};`. These use reserved placeholders to show how your JSON data maps to CSS properties:
- `{{WRAPPER}}`: Represents the unique, auto-generated class for that specific block instance (e.g., `.bb-[hash].blockish-block-wrapper`).
- `{{VALUE}}`: Represents the standard/single value you provide for that attribute.
- `{{TOP}}`, `{{RIGHT}}`, `{{BOTTOM}}`, `{{LEFT}}`: Represent the respective side values from a `Spacing` or `Border` attribute.
- `{{TOP_LEFT}}`, `{{TOP_RIGHT}}`, `{{BOTTOM_RIGHT}}`, `{{BOTTOM_LEFT}}`: Represent the respective corner values from a `Border-Radius` attribute.

**Responsive CSS Generation:** If an attribute type is `Responsive`, the PHP backend will automatically loop through your provided breakpoints (`Desktop`, `Tablet`, `Mobile`). It will generate the exact same CSS mapping for each breakpoint, but will wrap the `Tablet` and `Mobile` CSS rules inside their respective `@media` queries automatically. You do NOT need to write media queries yourself.

**Global HTML Classes:**
Every Blockish block automatically receives the `blockish-block-wrapper` class and a unique `bb-[hash]` class on its outermost wrapper element. The individual block documentation files will show you the exact HTML structure, but keep in mind these global classes are injected server-side for every block.

**Base CSS (`style.scss`):**
At the bottom of each block's documentation, you will see a `Base CSS` section. This contains the static SCSS from the block's `style.scss` file. It shows the default styling applied to the block *before* any of your dynamic JSON attributes are applied. You should read this to understand the block's baseline behavior (e.g., if a block already has `display: flex` or `margin: 0` by default).

These are just placeholders to help you understand which HTML elements and CSS properties are dynamically targeted.

**Naming Top-Level Blocks**
As a best practice, every top-level layout block you emit should carry a meaningful `metadata.name` attribute (e.g., `"attributes": { "metadata": { "name": "Hero Section" } }`). This metadata.name is used for identifying blocks in the editor. It is recommended to make this meaningful for readability.

### `manage-post` page/post assembly (this tool only)

**Create patterns before you include them.** Call `blockish/manage-pattern` for each section first and use only the **returned real pattern IDs**. Never invent or hallucinate `ref` values.

**Always use `block_schema`** — empty page or not:

| What to send | Notes |
|---|---|
| `block_schema` = lightweight pattern-ref nodes only | `{"name":"core/block","attributes":{"ref":163}}` (one per section). Staged for Accept/Discard. |
| After staging | Call `trigger-refresh`, share **`edit_url`** (not `post_url` / preview). |

- **Never** write pattern-ref comments or section HTML into `post_content`. Pending pattern/form schemas only apply in the editor — live markup + preview is not reliable.
- **Never** put `core/template-part` header/footer on a page (theme template already provides chrome).
- Templates / template parts always use `block_schema` via `manage-template` (Accept required).

When `block_schema` is staged, the editor shows a neon AI Preview wrapper; the user must Accept or Discard. Do not expect the live URL to change until Accept.

**meta_input:** Never invent meta keys. The user must give exact key names, or (if Blockish Dynamicity is active) call `blockish-dynamicity/get-meta-list` and pick a real key. If Dynamicity is not active and the user needs meta discovery/bindings, ask them for the keys or mention that Dynamicity provides meta listing + dynamic bindings.

**Undo live content:** Use `blockish/get-revisions` then `blockish/restore-revision` (`confirm: true`) only when the user asks. Pending AI preview is undone with Discard in the editor, not revisions.

### Core Workflow (Fetch, Modify, Update)

**Do NOT build complex schema structures from scratch unless explicitly asked to create a brand new design.** It leads to hallucinated attributes and malformed layouts. Always prefer modifying existing schemas.

1. **Fetch**: Call `blockish/get-posts` (for posts/pages) or `blockish/get-templates` (for templates/template parts) with the specific `post_id` or `slug`.
2. **Inspect**: Look at the returned `schema` array. This is the exact live block structure. You will also receive `pending_schema` which shows any unaccepted changes currently in the editor, allowing you to understand what the user is seeing even if they haven't accepted it yet.
3. **Modify**: Locate the specific block node you need to change and update its `attributes` or `innerBlocks` in memory.
4. **Update**: Always send `block_schema` via `manage-post` / `manage-template` / `manage-pattern` — never layout markup in `post_content`.
5. **Review**: Provide `edit_url`, call `blockish/trigger-refresh`, and tell the user to Accept. Never share a live/`post_url` for staged-only changes — it will look empty or unchanged until Accept.

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

An icon can be defined in two ways:

1. **Standard SVG Path**:
`{ "viewBox": [x, y, width, height], "path": "..." }` — an SVG path. `viewBox` is 4 numbers; `path` is the SVG `d` attribute string.
```json
{ "viewBox": [0, 0, 576, 512], "path": "M288 32 L576 480 L0 480 Z" }
```

2. **Custom Raw SVG (Complex SVGs)**:
If you need to use an SVG with multiple paths, shapes (rect, polygon, line), or complex markup, use this format. Set `viewBox` and `path` to `"custom"`, and provide the raw SVG string in the `svg` property.
```json
{ "viewBox": "custom", "path": "custom", "svg": "<svg viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><rect x=\"3\" y=\"3\" width=\"18\" height=\"18\" rx=\"2\"/><line x1=\"3\" y1=\"9\" x2=\"21\" y2=\"9\"/></svg>" }
```

**Icon Fallback Strategy:**
1. Try to use `blockish/get-icons` to find the exact icon. You can pass an array of search terms (e.g. `["arrow", "user"]`) to batch-search multiple icons in a single call.
2. If you cannot find the icon in the library, you can write the raw SVG yourself. Use the **Custom Raw SVG** format described above for complex SVGs, or the standard format for simple paths.
3. If you cannot confidently generate the SVG yourself, use a simple placeholder SVG (like a circle or square) and **explicitly inform the user** in your final response where you left placeholders so they can manually fix them.

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

**CRITICAL:** Because manually escaping JSON strings is highly prone to syntax errors, **you should always use the `blockish/json-helper` ability** to generate these strings. Pass your unescaped JSON object to `blockish/json-helper` (with `action: "stringify"`), and it will return the perfectly escaped string to use in your schema.

#### Shape: Typography

```json
"{\"fontWeight\":\"700\",\"fontSize\":{\"Desktop\":\"32px\",\"Tablet\":\"24px\",\"Mobile\":\"20px\"},\"lineHeight\":{\"Desktop\":\"1.2\"},\"letterSpacing\":{\"Desktop\":\"0px\"},\"textTransform\":\"uppercase\",\"fontStyle\":\"normal\",\"textDecoration\":\"none\"}"
```

| Key | Type | Default | Notes/enum |
|---|---|---|---|
| `fontFamily` | Option | unset | `{"value": "Inter, sans-serif", "label": "Inter"}` <br>**CSS:** `font-family: {{VALUE}};` |
| `fontWeight` | Scalar (string) | unset | `"100"` `"200"` `"300"` `"400"` `"500"` `"600"` `"700"` `"800"` `"900"` <br>**CSS:** `font-weight: {{VALUE}};` |
| `fontSize` | Responsive | unset | e.g. `{"Desktop":"24px"}` — `px`/`em`/`rem` <br>**CSS:** `font-size: {{VALUE}};` |
| `lineHeight` | Responsive | unset | e.g. `{"Desktop":"1.5"}` <br>**CSS:** `line-height: {{VALUE}};` |
| `letterSpacing` | Responsive | unset | e.g. `{"Desktop":"0.05em"}` <br>**CSS:** `letter-spacing: {{VALUE}};` |
| `textTransform` | Scalar (string) | `"none"` | `"none"` `"uppercase"` `"lowercase"` `"capitalize"` <br>**CSS:** `text-transform: {{VALUE}};` |
| `fontStyle` | Scalar (string) | `"normal"` | `"normal"` `"italic"` <br>**CSS:** `font-style: {{VALUE}};` |
| `textDecoration` | Scalar (string) | `"none"` | `"none"` `"underline"` `"line-through"` <br>**CSS:** `text-decoration: {{VALUE}};` |

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
| `backgroundColor` | Color | unset | Used when `backgroundType` = `"classic"` <br>**CSS:** `background-color: {{VALUE}};` |
| `backgroundImage` | Responsive of Image | unset | <br>**CSS:** `background-image: url({{URL}});` |
| `gradient` | Color (gradient format) | unset | Used when `backgroundType` = `"gradient"`. (Not responsive). <br>**CSS:** `background: {{VALUE}};` |
| `backgroundVideo` | Image (video file) | unset | Used when `backgroundType` = `"video"` |
| `backgroundImageSize` | Responsive-Option | e.g. `{"Desktop":{"label":"Auto","value":"auto"}}` | Options: `[{"label":"Auto","value":"auto"},{"label":"Cover","value":"cover"},{"label":"Contain","value":"contain"},{"label":"Custom","value":"custom"}]` <br>**CSS:** `background-size: {{VALUE}};` |
| `backgroundImageSizeWidth` | Responsive | unset | Used when `backgroundImageSize` = `"custom"` <br>**CSS:** `background-size: {{VALUE}} auto;` |
| `backgroundImagePosition` | Responsive-Option | e.g. `{"Desktop":{"label":"Top Left","value":"top left"}}` | Options: `[{"label":"Top Left","value":"top left"},{"label":"Top Center","value":"top center"},{"label":"Top Right","value":"top right"},{"label":"Center Left","value":"center left"},{"label":"Center Center","value":"center center"},{"label":"Center Right","value":"center right"},{"label":"Bottom Left","value":"bottom left"},{"label":"Bottom Center","value":"bottom center"},{"label":"Bottom Right","value":"bottom right"},{"label":"Custom","value":"custom"}]` <br>**CSS:** `background-position: {{VALUE}};` |
| `backgroundImagePositionHorizontal` | Responsive | unset | Used when `backgroundImagePosition` = `"custom"` <br>**CSS:** `background-position: {{X}} {{Y}};` |
| `backgroundImagePositionVertical` | Responsive | unset | Used when `backgroundImagePosition` = `"custom"` <br>**CSS:** `background-position: {{X}} {{Y}};` |
| `backgroundImageAttachment` | Option | e.g. `{"label":"Scroll","value":"scroll"}` | Options: `[{"label":"Scroll","value":"scroll"},{"label":"Fixed","value":"fixed"}]` <br>**CSS:** `background-attachment: {{VALUE}};` |
| `backgroundImageRepeat` | Responsive-Option | e.g. `{"Desktop":{"label":"Repeat","value":"repeat"}}` | Options: `[{"label":"Repeat","value":"repeat"},{"label":"Repeat X","value":"repeat-x"},{"label":"Repeat Y","value":"repeat-y"},{"label":"No Repeat","value":"no-repeat"}]` <br>**CSS:** `background-repeat: {{VALUE}};` |
| `backgroundImageBlendMode` | Option (not responsive) | e.g. `{"label":"Normal","value":"normal"}` | Options: `[{"label":"Normal","value":"normal"},{"label":"Multiply","value":"multiply"},{"label":"Screen","value":"screen"},{"label":"Overlay","value":"overlay"},{"label":"Darken","value":"darken"},{"label":"Lighten","value":"lighten"},{"label":"Color Dodge","value":"color-dodge"},{"label":"Color Burn","value":"color-burn"},{"label":"Hard Light","value":"hard-light"},{"label":"Soft Light","value":"soft-light"},{"label":"Difference","value":"difference"},{"label":"Exclusion","value":"exclusion"},{"label":"Hue","value":"hue"},{"label":"Saturation","value":"saturation"},{"label":"Color","value":"color"},{"label":"Luminosity","value":"luminosity"}]` <br>**CSS:** `background-blend-mode: {{VALUE}};` |
| `backgroundImageResolution` | Responsive-Option | unset | Picks one of the *uploaded image's own* registered sizes (e.g. `{"Desktop":{"label":"Thumbnail","value":"thumbnail"}}`). Leave unset to use the size `backgroundImage` itself was set with. |

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
| `color` | Color | unset | Used when `type` = `"color"` <br>**CSS:** `background-color: {{VALUE}};` |
| `gradient` | Scalar (string, CSS gradient) | unset | Used when `type` = `"gradient"` <br>**CSS:** `background-image: {{VALUE}};` |
| `opacity` | Scalar (integer) | `100` | `0`–`100` <br>**CSS:** `opacity: calc({{VALUE}} / 100);` |
| `filters` | **Stringified-JSON (CSS Filters), nested** | unset | A JSON-string-within-a-JSON-string — same shape as the CSS Filters block below, but `grayscale`/`invert`/`sepia` are not offered here (omit them; only `blur`/`brightness`/`contrast`/`saturate`/`hue-rotate` apply to the overlay) <br>**CSS:** `filter: blur(...) brightness(...) ...;` |
| `blendMode` | Option | e.g. `{"label":"Normal","value":"normal"}` | Options: `[{"label":"Normal","value":"normal"},{"label":"Multiply","value":"multiply"},{"label":"Screen","value":"screen"},{"label":"Overlay","value":"overlay"},{"label":"Darken","value":"darken"},{"label":"Lighten","value":"lighten"},{"label":"Color Dodge","value":"color-dodge"},{"label":"Color Burn","value":"color-burn"},{"label":"Hard Light","value":"hard-light"},{"label":"Soft Light","value":"soft-light"},{"label":"Difference","value":"difference"},{"label":"Exclusion","value":"exclusion"},{"label":"Hue","value":"hue"},{"label":"Saturation","value":"saturation"},{"label":"Color","value":"color"},{"label":"Luminosity","value":"luminosity"}]` <br>**CSS:** `mix-blend-mode: {{VALUE}};` |

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
| `width` | Responsive | unset | <br>**CSS:** (Used in `border`) |
| `style` | Scalar (string) | `"solid"` | `"solid"` `"dashed"` `"dotted"` `"double"` `"none"` <br>**CSS:** (Used in `border`) |
| `color` | Color | unset | <br>**CSS:** (Used in `border`) |
| `top`/`right`/`bottom`/`left` | Object (same shape: `width`/`style`/`color`) | unset | Use instead of the linked `width`/`style`/`color` keys for per-side control <br>**CSS:** `border-{{SIDE}}: {{WIDTH}} {{STYLE}} {{COLOR}};` (if omitted, generates `border: {{WIDTH}} {{STYLE}} {{COLOR}};`) |

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
| `x` | Scalar (length) | Horizontal offset <br>**CSS:** (Used in `box-shadow`/`text-shadow`) |
| `y` | Scalar (length) | Vertical offset <br>**CSS:** (Used in `box-shadow`/`text-shadow`) |
| `blur` | Scalar (length) | Blur radius <br>**CSS:** (Used in `box-shadow`/`text-shadow`) |
| `spread` | Scalar (length) | Box shadow only <br>**CSS:** (Used in `box-shadow`) |
| `color` | Color | <br>**CSS:** (Used in `box-shadow`/`text-shadow`) |
| `inset` | Scalar (string) | Box shadow only. **Not a boolean** — the literal string `"inset"` to enable it, or `""`/omit for a normal outset shadow. <br>**CSS:** Generates `box-shadow: {{X}} {{Y}} {{BLUR}} {{SPREAD}} {{COLOR}} {{INSET}};` or `text-shadow: {{X}} {{Y}} {{BLUR}} {{COLOR}};` for all objects combined. |

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

<br>**CSS:** Generates a single `filter: blur({{VALUE}}px) brightness({{VALUE}}%) ...;` rule combining all defined filters.

#### Shape: Text Stroke

Default: `{}` (no stroke).

```json
"{\"width\":{\"Desktop\":\"1px\"},\"color\":\"#1a1a2e\"}"
```

| Key | Type | Notes/CSS |
|---|---|---|
| `width` | Responsive | <br>**CSS:** `-webkit-text-stroke-width: {{VALUE}};` |
| `color` | Color | <br>**CSS:** `-webkit-text-stroke-color: {{VALUE}};` |

---

## 3. Transform attributes

Individual top-level Responsive attributes (not a Stringified-JSON shape). Set only what you need; everything else defaults to unset/no-op. Pass raw numbers — units are added automatically. All of these are combined automatically into one CSS `transform` — you never compose the `transform` string yourself.

| Attribute | Auto unit | No-op | CSS Variable on `.{{WRAPPER}}` |
|---|---|---|---|
| `rotateZ` | `deg` | `0` | `--rotate-z: {{VALUE}}deg;` |
| `rotateX` | `deg` | `0` | `--rotate-x: {{VALUE}}deg;` |
| `rotateY` | `deg` | `0` | `--rotate-y: {{VALUE}}deg;` |
| `translateX` | as-is | `0` | `--translate-x: {{VALUE}};` |
| `translateY` | as-is | `0` | `--translate-y: {{VALUE}};` |
| `translateZ` | as-is | `0` | `--translate-z: {{VALUE}};` |
| `scale` | multiplier (sets both X and Y) | `1` | `--scale-x: {{VALUE}}; --scale-y: {{VALUE}};` |
| `scaleX` | multiplier | `1` | `--scale-x: {{VALUE}};` |
| `scaleY` | multiplier | `1` | `--scale-y: {{VALUE}};` |
| `scale3DX` | multiplier | `1` | `--scale-3d-x: {{VALUE}};` |
| `scale3DY` | multiplier | `1` | `--scale-3d-y: {{VALUE}};` |
| `skewX` | `deg` | `0` | `--skew-x: {{VALUE}}deg;` |
| `skewY` | `deg` | `0` | `--skew-y: {{VALUE}}deg;` |
| `perspective` | as-is | `1000px` | `--perspective: {{VALUE}};` |

`transformOrigin` (Scalar string, default unset → browser default `50% 50%`): `"top left"` `"top center"` `"top right"` `"center left"` `"center center"` `"center right"` `"bottom left"` `"bottom center"` `"bottom right"` `"custom"`. Only when set to `"custom"`, also set `transformOriginX`/`transformOriginY` (Responsive, length/percentage) for a precise origin point. <br>**CSS:** `.{{WRAPPER}}` -> `transform-origin: {{VALUE}};` (or `--transform-origin-x`/`--transform-origin-y` if custom).

Hover variants use the same names with a `Hover` suffix (`rotateZHover`, `scaleHover`, `translateZHover`, `scale3DXHover`, etc.) — same defaults, same units, setting `--*-hover` CSS variables on `.{{WRAPPER}}`. `transformTransitionDuration` is a Scalar (number of seconds, default unset, mapped to `--transform-transition: {{VALUE}}s;`).

**You must turn transforms on explicitly — this is the single easiest transform mistake to make.** `applyTransform` (normal state) and `applyTransformHover` (hover state) are booleans that both default to **`false`**. If you set any transform attribute above but leave the matching enable flag off, the transform is **emitted as nothing — it has zero effect**. So:

- Set `"applyTransform": true` whenever you use **any** normal-state transform or `transformOrigin` attribute (`rotateZ`, `rotateX`, `scale`, `translateX`, `perspective`, `skewY`, `transformOrigin`, etc.). <br>**CSS:** Maps to `.{{WRAPPER}}` -> `transform: perspective(var(--perspective, 1000px)) rotateX(...) ... scale3d(...) ... skewY(...);`
- Set `"applyTransformHover": true` whenever you use **any** `*Hover` transform attribute (`scaleHover`, `rotateZHover`, …). <br>**CSS:** Maps to `.{{WRAPPER}}:hover` -> `transform: perspective(var(--perspective-hover, var(--perspective, 1000px))) ...;`

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
| `padding` | Spacing (Responsive) | unset | <br>**CSS:** `.{{WRAPPER}}` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `margin` | Spacing (Responsive) | unset | <br>**CSS:** `.{{WRAPPER}}` -> `margin: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `widthType` | Responsive-Option | unset | Options: `[{"label":"Auto","value":"auto"},{"label":"Full","value":"100%"},{"label":"Custom","value":"custom"}]`. If `custom`, `customWidth` is active. <br>**CSS:** `.{{WRAPPER}}` -> `width: {{VALUE}};` |
| `customWidth` | Responsive | unset | Active when `widthType` = `"custom"` <br>**CSS:** `.{{WRAPPER}}` -> `width: {{VALUE}};` |
| `minWidth` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `min-width: {{VALUE}};` |
| `maxWidth` | Responsive | unset | **Note: Do NOT use on `blockish/container`.** <br>**CSS:** `.{{WRAPPER}}` -> `max-width: {{VALUE}};` |
| `zIndex` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `z-index: {{VALUE}};` |

### Position

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `position` | Option | unset | Options: `[{"label":"Relative","value":"relative"},{"label":"Absolute","value":"absolute"},{"label":"Fixed","value":"fixed"},{"label":"Sticky","value":"sticky"}]` <br>**CSS:** `.{{WRAPPER}}` -> `position: {{VALUE}}; width: 100%;` |
| `positionTop` | Responsive | unset | Only applies when `position` is set <br>**CSS:** `.{{WRAPPER}}` -> `top: {{VALUE}};` |
| `positionRight` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `right: {{VALUE}};` |
| `positionBottom` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `bottom: {{VALUE}};` |
| `positionLeft` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `left: {{VALUE}};` |

### Flex child (block is inside a flex container)

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `alignSelf` | Responsive | unset | `"auto"` `"flex-start"` `"center"` `"flex-end"` `"stretch"` `"baseline"` <br>**CSS:** `.{{WRAPPER}}` -> `align-self: {{VALUE}};` |
| `justifySelf` | Responsive | unset | `"auto"` `"start"` `"center"` `"end"` `"stretch"` <br>**CSS:** `.{{WRAPPER}}` -> `justify-self: {{VALUE}};` |
| `flexOrder` | Responsive | unset | `"1"` (etc) · `"custom"` (activates `flexCustomOrder`) <br>**CSS:** `.{{WRAPPER}}` -> `order: {{VALUE}};` |
| `flexCustomOrder` | Responsive | unset | Active when `flexOrder` = `"custom"` <br>**CSS:** `.{{WRAPPER}}` -> `order: {{VALUE}};` |
| `flexGrow` | Responsive | unset | `"0"` = no grow, `"1"` = grow to fill <br>**CSS:** `.{{WRAPPER}}` -> `flex-grow: {{VALUE}};` |
| `flexShrink` | Responsive | unset | `"0"` = don't shrink, `"1"` = can shrink <br>**CSS:** `.{{WRAPPER}}` -> `flex-shrink: {{VALUE}};` |

### Grid child (block is inside a grid container)

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `gridColumnStart` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `grid-column-start: {{VALUE}};` |
| `gridColumnEnd` | Responsive | unset | e.g. `"span 2"` <br>**CSS:** `.{{WRAPPER}}` -> `grid-column-end: {{VALUE}};` |
| `gridRowStart` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}` -> `grid-row-start: {{VALUE}};` |
| `gridRowEnd` | Responsive | unset | e.g. `"span 2"` <br>**CSS:** `.{{WRAPPER}}` -> `grid-row-end: {{VALUE}};` |

### Appearance

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `background` | Stringified-JSON (Background) | unset | Normal state <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}}` |
| `backgroundHover` | Stringified-JSON (Background) | unset | Hover state <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}}:hover` |
| `backgroundHoverTransition` | Scalar (number, seconds) | unset | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-background-hover-transition: {{VALUE}}s;` |
| `border` | Stringified-JSON (Border) | unset | Normal state <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}}` |
| `borderHover` | Stringified-JSON (Border) | unset | Hover state <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}}:hover` |
| `borderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}}` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `borderRadiusHover` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}}:hover` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `borderHoverTransition` | Scalar (number, seconds) | unset | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-border-hover-transition: {{VALUE}}s;` |
| `boxShadow` | Stringified-JSON (Box Shadow) | unset | Normal state <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}}` |
| `boxShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover state <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}}:hover` |
| `customCss` | Scalar (string, raw CSS) | no-op template | See §5 |
| `classManager` | Array of `{id, title}` | `[]` | See §6 |
| `classManagerSubselector` | Array of `{id, title, parent}` | `[]` | See §6 |

### Visibility (Hide on device)

Available on **every** Blockish block via the Visibility extension. Adds CSS classes that hide the block at matching breakpoints (Desktop ≥1025px, Tablet 769–1024px, Mobile ≤768px).

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `hideOn` | Object | `{"Desktop":false,"Tablet":false,"Mobile":false}` | Set a device key to `true` to hide on that breakpoint. Frontend classes: `blockish-hide-on-desktop`, `blockish-hide-on-tablet`, `blockish-hide-on-mobile`. |

```json
"hideOn": { "Desktop": false, "Tablet": true, "Mobile": true }
```

Do **not** use `customCss` + `display:none` for responsive hide — use `hideOn` instead.

### Interactions (`interactionData`)

Available on Blockish blocks via the Interactions extension. Full shapes, presets, emit/listen, and custom JS rules are in **§9 Extensions** (footer). Prefer entrance presets (`action.type: "preset"`, `when.event: "inView"` or `"ready"`) over hand-written animation CSS.

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

