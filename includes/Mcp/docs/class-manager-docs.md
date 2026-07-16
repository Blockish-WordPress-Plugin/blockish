# Blockish Class Manager Reference

## 1. What it is — and the one thing you write

The Class Manager lets you define a named, reusable style once and attach it to any number of Blockish blocks. Each class is a WordPress custom post of type `blockish-classes`:

- **post title** = the class name (becomes the CSS class slug).
- **post content** = a **JSON style object** — a structured map of style properties. **This is the only thing you write.**
- **post meta** (`blockishClassManagerStyles`) = the compiled CSS. It is generated **automatically** from the style object by the editor, and the frontend reads it. **You never write CSS, and you never write meta.**

This mirrors how blocks work (`blockish/get-block-docs`): you build a structured object of style values, and the system turns it into CSS for you. You set values like `"padding": {...}`, `"background": {...}`, `"borderRadius": "12px"` — not CSS text.

**Never write raw CSS into a class.** The old `css` input is gone. Writing CSS to meta by hand is wrong: it is overwritten the moment the class is opened in the editor (the editor recompiles meta from the style object). The style object is the single source of truth.

(One escape hatch exists for genuinely unsupported CSS: the `customCss` key *inside* the style object — see §7. Everything expressible as a normal property should use that property, not `customCss`.)

---

## 2. When to make a class at all

The decision is about **reuse**, not just whether an attribute exists:

- **One-off style on a single block** → set the matching block attribute directly (see `blockish/get-block-docs`); only use the block's own `customCss` attribute if nothing covers it. **Don't make a class for a one-off.**
- **Same style on many blocks / across pages** → make a class, *even if* a block attribute could also do it. A class is defined once and referenced by name; repeating an attribute value on every block duplicates that data and its generated CSS each time.
- **A property no attribute covers, needed on many blocks** → class, no question.

---

## 3. Parent vs child classes

**Parent class** — created with **no** `parent_id`.
- Give it a **slug-format name** (lowercase, hyphens, no spaces — e.g. `hero-card`). That name is added to the block as a class and is the selector its style object targets (`.hero-card`). Its style object styles the block's **own element, in its normal state**.

**Child class (subselector)** — created with a `parent_id` pointing to a parent. **A child is NOT a "variation" of the parent — its NAME is a CSS sub-selector**, evaluated relative to the parent's element, and its style object styles whatever that sub-selector matches. The compiled selector is `.{parent-slug}.blockish-cm-{child_id}` followed by the name:

- **Name starts with `:` or `::`** → attached to the parent element with **no space** — a **state or pseudo-element**:
  - name `:hover` → `.hero-card.blockish-cm-67:hover` (the block on hover)
  - name `::before` → `.hero-card.blockish-cm-67::before` (a generated pseudo-element)
- **Name does NOT start with `:`** → a **descendant** (a space is inserted) — an element *inside* the block:
  - name `h2` → `.hero-card.blockish-cm-67 h2` (every `<h2>` inside)
  - name `.icon` → `.hero-card.blockish-cm-67 .icon`

So child classes are how you style **hover/focus states, pseudo-elements, and inner elements** of a block. Rules:
- The **parent must also be applied to the same block** — a child is skipped if its parent isn't present.
- A child is **per-block** (only blocks that carry that child get it). Use it for selective/targeted sub-styling. For a sub-selector that should apply *everywhere the parent is used*, put it in the parent's `customCss` instead (§7).
- **Never give a child a plain word** like `dark` or `featured` — that compiles to a descendant *element* selector (`... dark`) and matches nothing. A child name must be a real CSS sub-selector: `:hover`, `:focus`, `::before`, `h2`, `.title`, etc.

---

## 4. Name normalization

The `name` is auto-normalized; the response's `name`/`css_selector` tells you the real result.

| Rule | Input | Result |
|---|---|---|
| Lowercase | `Hero Card` | `hero-card` |
| Spaces → hyphens | `hero card` | `hero-card` |
| Only `a-z 0-9 - _` | `hero@card!` | `herocard` |
| Must start with a letter or `_` | `2card` | invalid → empty |

---

## 5. Workflow

1. **`blockish/get-classes`** — list existing classes (each returns `post_id`, `name`, `css_selector`, `parent_id`, `content` = the editable style object, `css` = read-only compiled output). Avoid duplicates; reuse an existing class when one already fits.
2. **`blockish/manage-class`** — `action: "create"` (or `"update"` with `post_id`). Pass `name` and the `content` style object. To make a child, also pass `parent_id`. **On update, `content` MERGES recursively with the stored object**. Only send the properties you want to add or change. To remove a specific property, set its value to `null`. To completely clear all styles and reset the class, pass an empty object `{}`.
3. **Apply it** to blocks via the block schema's `classManager` / `classManagerSubselector` attributes (§6).

You do not need to know the compiled selector to write the style object — your object targets the class's own selector automatically. `css_selector` is only needed for reference and for nested/`customCss` cases.

---

## 6. Applying a class to a block (in the block schema)

Set these in a block's `attributes` object (same as documented in `blockish/get-block-docs` §6). **You never hand-write `<!-- wp:... -->` markup** — these go in the schema you pass to `blockish/manage-post`.

`classManager` — apply a parent class:
```json
"classManager": [{ "id": 45, "title": "hero-card" }]
```

`classManagerSubselector` — apply a child class (the `parent` key is **required**, and the parent must be in `classManager` on the same block):
```json
"classManagerSubselector": [{ "id": 67, "title": "featured", "parent": 45 }]
```

Example block node applying both:
```json
{
  "name": "blockish/container",
  "attributes": {

    "classManager": [{ "id": 45, "title": "hero-card" }],
    "classManagerSubselector": [{ "id": 67, "title": "featured", "parent": 45 }]
  },
  "innerBlocks": []
}
```

---

## 7. The style object (what goes in `content`)

A flat JSON object. **Include only the properties you're setting** — omit everything else. Every value is one of the shapes below.

### Value shapes

- **Plain value** — a string/number used as-is: `"display": "flex"`, `"zIndex": 10`.
- **Length** — a CSS length *string*: `"borderRadius": "12px"`, `"maxWidth": "640px"`. (`px`/`%`/`rem`/`em`/`vh`/`fr`/etc.)
- **Option** — an object with `label` and `value` keys: `{ "label": "Flex", "value": "flex" }`.
- **Responsive** — wrap any plain/length/Option value in `{ "Desktop": …, "Tablet": …, "Mobile": … }`. **`Desktop` is the base (applies everywhere); `Tablet` overrides at ≤1024px, `Mobile` at ≤768px.** Only `Desktop` is required. A bare value (not wrapped) also works and applies to all breakpoints. So both of these are valid:
  ```json
  "fontSize": "32px"
  "fontSize": { "Desktop": "32px", "Mobile": "24px" }
  ```
- **Spacing** — `{ "top": "...", "right": "...", "bottom": "...", "left": "..." }` (each a length), optionally wrapped in a Responsive object. Used by `padding`, `margin`.
- **Color** — a hex/`rgba()` string: `"#1a73e8"`, `"rgba(0,0,0,0.5)"`.
- **Object shapes** (`background`, `border`, `boxShadow`, `textShadow`, `textStroke`, `filters`, `backgroundFilters`) — **nested objects/arrays, NOT JSON strings.** They use the exact same field structure as the same-named shapes in `blockish/get-block-docs` §2, except here you nest the object directly instead of stringifying it. Concise forms:

  ```json
  "background": { "backgroundType": "classic", "backgroundColor": "#0f172a" }
  "background": { "backgroundType": "gradient", "gradient": "linear-gradient(135deg,#667eea,#764ba2)" }
  "border":     { "width": { "Desktop": "1px" }, "style": "solid", "color": "#e2e8f0" }
  "boxShadow":  [ { "x": "0px", "y": "8px", "blur": "24px", "spread": "0px", "color": "rgba(0,0,0,0.12)", "inset": "" } ]
  "textShadow": [ { "x": "1px", "y": "1px", "blur": "4px", "color": "rgba(0,0,0,0.3)" } ]
  "textStroke": { "width": { "Desktop": "1px" }, "color": "#111" }
  "filters":    { "blur": 0, "brightness": 100, "contrast": 100, "saturate": 100, "hue-rotate": 0 }
  ```
  `backgroundFilters` is the same shape as `filters` but applied as `backdrop-filter`.

### Properties

Layout / flex / grid (all Responsive unless noted):

| Key | Shape | Options | CSS |
|---|---|---|---|
| `display` | Responsive (Option) | `[{"label":"Block","value":"block"},{"label":"Inline Block","value":"inline-block"},{"label":"Flex","value":"flex"},{"label":"Inline Flex","value":"inline-flex"},{"label":"Grid","value":"grid"},{"label":"Inline Grid","value":"inline-grid"},{"label":"None","value":"none"}]` | `display: {{VALUE}};` |
| `flexDirection` | Responsive (Option) | `[{"label":"Row","value":"row"},{"label":"Column","value":"column"},{"label":"Row Reverse","value":"row-reverse"},{"label":"Column Reverse","value":"column-reverse"}]` | `flex-direction: {{VALUE}};` |
| `flexWrap` | Responsive (Option) | `[{"label":"No Wrap","value":"nowrap"},{"label":"Wrap","value":"wrap"},{"label":"Wrap Reverse","value":"wrap-reverse"}]` | `flex-wrap: {{VALUE}};` |
| `justifyContent` | Responsive (Option) | `[{"label":"Start","value":"flex-start"},{"label":"End","value":"flex-end"},{"label":"Center","value":"center"},{"label":"Space Between","value":"space-between"},{"label":"Space Around","value":"space-around"},{"label":"Space Evenly","value":"space-evenly"}]` | `justify-content: {{VALUE}};` |
| `alignItems` | Responsive (Option) | `[{"label":"Start","value":"flex-start"},{"label":"End","value":"flex-end"},{"label":"Center","value":"center"},{"label":"Stretch","value":"stretch"},{"label":"Baseline","value":"baseline"}]` | `align-items: {{VALUE}};` |
| `columnGap` / `rowGap` | Responsive (Length) | | `column-gap: {{VALUE}};` / `row-gap: {{VALUE}};` |
| `gridLayoutType` | Responsive (Option) | `[{"label":"Auto","value":"auto"},{"label":"Fixed","value":"fixed"}]` | `fixed` (use `gridColumns`/`gridRows`) or `auto` (use `autoGridWidth`/`autoGridHeight`) |
| `gridColumns` / `gridRows` | Responsive (number) | | `grid-template-columns`/`rows: repeat({{VALUE}}, minmax(0, 1fr));` |
| `autoGridWidth` / `autoGridHeight` | Responsive (Length) | | `grid-template-columns: repeat(auto-fill, minmax(min({{VALUE}}, 100%), 1fr));` / `grid-auto-rows: {{VALUE}};` |

Sizing & position:

| Key | Shape | Options | CSS |
|---|---|---|---|
| `padding` / `margin` | Spacing (Responsive) | | `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` / `margin: ...` |
| `width` `height` `minWidth` `minHeight` `maxWidth` `maxHeight` | Responsive (Length) | | `width: {{VALUE}};` etc. |
| `overflow` | Responsive (Option) | `[{"label":"Visible","value":"visible"},{"label":"Hidden","value":"hidden"},{"label":"Auto","value":"auto"},{"label":"Scroll","value":"scroll"}]` | `overflow: {{VALUE}};` |
| `aspectRatio` | Responsive (Option) | `[{"label":"Auto","value":"auto"},{"label":"1 / 1","value":"1 / 1"},{"label":"4 / 3","value":"4 / 3"},{"label":"3 / 2","value":"3 / 2"},{"label":"16 / 9","value":"16 / 9"},{"label":"21 / 9","value":"21 / 9"}]` | `aspect-ratio: {{VALUE}};` |
| `objectFit` | Responsive (Option) | `[{"label":"Fill","value":"fill"},{"label":"Contain","value":"contain"},{"label":"Cover","value":"cover"},{"label":"None","value":"none"},{"label":"Scale Down","value":"scale-down"}]` | `object-fit: {{VALUE}};` |
| `position` | Responsive (Option) | `[{"label":"Static","value":"static"},{"label":"Relative","value":"relative"},{"label":"Absolute","value":"absolute"},{"label":"Fixed","value":"fixed"},{"label":"Sticky","value":"sticky"}]` | `position: {{VALUE}};` |
| `top` `right` `bottom` `left` | Responsive (Length) | | `top: {{VALUE}};` etc. |
| `zIndex` | Responsive (number) | | `z-index: {{VALUE}};` |
| `anchorOffset` | Responsive (Length) | | `scroll-margin-top: {{VALUE}};` (offset for sticky-header anchor jumps) |

Typography:

| Key | Shape | Options | CSS |
|---|---|---|---|
| `fontFamily` | Object | | `font-family: {{VALUE}};` (`{ "value": "Inter, sans-serif" }`) |
| `fontWeight` | Responsive (Option) | `[{"label":"Default","value":""},{"label":"100","value":"100"},{"label":"200","value":"200"},{"label":"300","value":"300"},{"label":"400","value":"400"},{"label":"500","value":"500"},{"label":"600","value":"600"},{"label":"700","value":"700"},{"label":"800","value":"800"},{"label":"900","value":"900"}]` | `font-weight: {{VALUE}};` |
| `fontSize` `lineHeight` `letterSpacing` `wordSpacing` | Responsive (Length) | | `font-size: {{VALUE}};` etc. |
| `textAlign` | Responsive (Option) | `[{"label":"Left","value":"left"},{"label":"Center","value":"center"},{"label":"Right","value":"right"},{"label":"Justify","value":"justify"},{"label":"Start","value":"start"},{"label":"End","value":"end"}]` | `text-align: {{VALUE}};` |
| `textDecoration` | Responsive (Option) | `[{"label":"None","value":"none"},{"label":"Underline","value":"underline"},{"label":"Overline","value":"overline"},{"label":"Line Through","value":"line-through"}]` | `text-decoration: {{VALUE}};` |
| `textTransform` | Responsive (Option) | `[{"label":"None","value":"none"},{"label":"Uppercase","value":"uppercase"},{"label":"Lowercase","value":"lowercase"},{"label":"Capitalize","value":"capitalize"}]` | `text-transform: {{VALUE}};` |
| `fontStyle` | Responsive (Option) | `[{"label":"Normal","value":"normal"},{"label":"Italic","value":"italic"},{"label":"Oblique","value":"oblique"}]` | `font-style: {{VALUE}};` |
| `direction` | Responsive (Option) | `[{"label":"LTR","value":"ltr"},{"label":"RTL","value":"rtl"}]` | `direction: {{VALUE}};` |
| `textOverflow` | Responsive (Option) | `[{"label":"Clip","value":"clip"},{"label":"Ellipsis","value":"ellipsis"}]` | `text-overflow: {{VALUE}};` |
| `columnCount` | Responsive (number) | | `column-count: {{VALUE}};` |
| `color` | Color | | `color: {{VALUE}};` |

Appearance & effects:

| Key | Shape | Options | CSS |
|---|---|---|---|
| `background` | Background object | | `background: ...;` (classic/gradient) |
| `blendMode` | Responsive (Option) | `[{"label":"Normal","value":"normal"},{"label":"Multiply","value":"multiply"},{"label":"Screen","value":"screen"},{"label":"Overlay","value":"overlay"},{"label":"Darken","value":"darken"},{"label":"Lighten","value":"lighten"},{"label":"Color Dodge","value":"color-dodge"},{"label":"Color Burn","value":"color-burn"},{"label":"Hard Light","value":"hard-light"},{"label":"Soft Light","value":"soft-light"},{"label":"Difference","value":"difference"},{"label":"Exclusion","value":"exclusion"},{"label":"Hue","value":"hue"},{"label":"Saturation","value":"saturation"},{"label":"Color","value":"color"},{"label":"Luminosity","value":"luminosity"}]` | `mix-blend-mode: {{VALUE}};` |
| `backgroundClip` | Responsive (Option) | `[{"label":"Border Box","value":"border-box"},{"label":"Padding Box","value":"padding-box"},{"label":"Content Box","value":"content-box"},{"label":"Text","value":"text"}]` | `background-clip: {{VALUE}};` |
| `border` | Border object | | Generates CSS `border` properties |
| `borderRadius` | Responsive (Length) | | `border-radius: {{VALUE}};` |
| `textStroke` | Text Stroke object | | Generates `-webkit-text-stroke` properties |
| `boxShadow` | Box Shadow array | | `box-shadow: ...;` |
| `textShadow` | Text Shadow array | | `text-shadow: ...;` |
| `opacity` | Responsive (number 0–1) | | `opacity: {{VALUE}};` |
| `filters` | CSS Filters object | | `filter: ...;` |
| `backgroundFilters` | CSS Filters object | | `backdrop-filter: ...;` |

Transform (individual keys, all Responsive; raw numbers — units/`deg` added automatically; everything combines into one `transform`):

| Key | Unit | Options | CSS |
|---|---|---|---|
| `translateX` `translateY` `translateZ` | as-is (Length) | | `transform: translateX({{VALUE}});` etc. |
| `rotate` `rotateX` `rotateY` `rotateZ` | `deg` | | `transform: rotate({{VALUE}}deg);` etc. (`rotate` = Z axis) |
| `scale` | multiplier | | `transform: scale({{VALUE}});` |
| `scale3DX` `scale3DY` `scale3DZ` | multiplier | | `transform: scale3d(X, Y, Z);` |
| `skewX` `skewY` | `deg` | | `transform: skewX({{VALUE}}deg);` etc. |
| `perspective` | Length | | `perspective: {{VALUE}};` (parent depth for 3D) |
| `transformOrigin` | Responsive (Option) | `[{"label":"Top Left","value":"top left"},{"label":"Top Center","value":"top center"},{"label":"Top Right","value":"top right"},{"label":"Center Left","value":"center left"},{"label":"Center","value":"center center"},{"label":"Center Right","value":"center right"},{"label":"Bottom Left","value":"bottom left"},{"label":"Bottom Center","value":"bottom center"},{"label":"Bottom Right","value":"bottom right"},{"label":"Custom","value":"custom"}]` | `transform-origin: {{VALUE}};` (or `transformOriginX`/`Y` if `custom`) |
| `transformOriginX` `transformOriginY` | Responsive (Length) | | `transform-origin: {{X}} {{Y}};` (only when `transformOrigin` is `custom`) |

> Unlike the block transform system, a class transform needs **no** "enable" flag — setting any transform key here applies it directly.

Transition (Responsive):

| Key | Shape | Options | CSS |
|---|---|---|---|
| `transitionProperty` | string | | `transition: {property} {duration}s {timing} {delay}s;` (default `all`) |
| `transitionDuration` | number (seconds) | | default `0.2` |
| `transitionDelay` | number (seconds) | | default `0` |
| `transitionTimingFunction` | Responsive (Option) | `[{"label":"Ease","value":"ease"},{"label":"Linear","value":"linear"},{"label":"Ease In","value":"ease-in"},{"label":"Ease Out","value":"ease-out"},{"label":"Ease In Out","value":"ease-in-out"}]` | `ease` `linear` `ease-in` `ease-out` `ease-in-out` (default `ease`) |

Custom escape hatch:

| Key | Shape | Notes |
|---|---|---|
| `customCss` | string (raw CSS) | Last resort for CSS no property above expresses (e.g. pseudo-elements like `::before`, keyframe-less hover-only rules, complex selectors). Use `{{SELECTOR}}` for this class's root selector. Applied only at the Desktop base. Don't use it for anything a property above already covers. |

```json
"customCss": "{{SELECTOR}}::before { content: ''; position: absolute; inset: 0; background: url(/wave.svg); }"
```

> A class's style-object properties only ever produce a rule for **that class's own target selector** — for a parent that's `.{slug}` (the block's element, normal state). To style a hover/focus state, a pseudo-element, or an inner element you have two routes:
> - **A child class** whose name *is* the sub-selector (`:hover`, `::before`, `h2`, `.title`) — see §3. Structured, per-block, no raw CSS.
> - **The parent's `customCss`** with `{{SELECTOR}}`, for the same thing applied *wherever the parent is used*, or for a selector a child name can't express: `"{{SELECTOR}}:hover { ... }"`, `"{{SELECTOR}} h2 { ... }"`.

---

## 8. Examples

### Reusable card with hover lift

```json
{
  "action": "create",
  "name": "feature-card",
  "content": {
    "padding": { "top": "28px", "right": "28px", "bottom": "28px", "left": "28px" },
    "background": { "backgroundType": "classic", "backgroundColor": "#ffffff" },
    "borderRadius": "16px",
    "boxShadow": [ { "x": "0px", "y": "4px", "blur": "16px", "spread": "0px", "color": "rgba(0,0,0,0.08)", "inset": "" } ],
    "transitionProperty": "transform, box-shadow",
    "transitionDuration": 0.25,
    "transitionTimingFunction": "ease",
    "customCss": "{{SELECTOR}}:hover { transform: translateY(-4px); box-shadow: 0 12px 28px rgba(0,0,0,0.14); }"
  }
}
```

### Gradient-text heading

```json
{
  "action": "create",
  "name": "gradient-text",
  "content": {
    "background": { "backgroundType": "gradient", "gradient": "linear-gradient(90deg,#667eea,#764ba2)" },
    "backgroundClip": "text",
    "color": "rgba(0,0,0,0)",
    "fontWeight": "800"
  }
}
```

### Child class — hover state (pseudo-class)

Child of parent `feature-card` (post_id 45). Name `:hover` → compiles to `.feature-card.blockish-cm-{id}:hover`:

```json
{
  "action": "create",
  "name": ":hover",
  "parent_id": 45,
  "content": {
    "translateY": "-4px",
    "boxShadow": [ { "x": "0px", "y": "12px", "blur": "28px", "spread": "0px", "color": "rgba(0,0,0,0.16)", "inset": "" } ]
  }
}
```

### Child class — style the heading inside the card (descendant)

Child of `feature-card`. Name `h2` (no leading `:`) → compiles to `.feature-card.blockish-cm-{id} h2`:

```json
{
  "action": "create",
  "name": "h2",
  "parent_id": 45,
  "content": { "fontSize": "1.5rem", "color": "#0f172a", "letterSpacing": "-0.01em" }
}
```

Apply both children alongside the parent on a block:
```json
"classManager": [{ "id": 45, "title": "feature-card" }],
"classManagerSubselector": [
  { "id": 90, "title": ":hover", "parent": 45 },
  { "id": 91, "title": "h2", "parent": 45 }
]
```

---

## 9. Deleting

`blockish/manage-class` with `action: "delete"` and `post_id`. Deleting a parent also deletes its child classes.

---

## 10. Notes / gotchas

- **`content` merges on update.** Only send the fields you want to change. Set a field to `null` to delete it, or send `{}` to completely clear the class.
- **You write the style object, not CSS.** The compiled CSS is produced automatically. If a class isn't styling anything on the frontend yet, it's because the compile step (run in the editor) hasn't happened for it — that's expected; your job is only the correct `content` object.
- **Hover / pseudo-elements / descendant selectors** are not plain style-object keys — do them with a **child class** whose name *is* the sub-selector (`:hover`, `::before`, `h2`, `.title` — §3), or with the parent's **`customCss`** + `{{SELECTOR}}` (§7). A parent's normal style object only targets the block's own element. Never name a child a plain word (`dark`, `featured`) — it becomes a dead `... dark` element selector.
- **Reuse beats create.** Always `get-classes` first and apply an existing class when one fits, rather than creating near-duplicates.
