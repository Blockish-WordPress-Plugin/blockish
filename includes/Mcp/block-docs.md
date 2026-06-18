# Blockish Block Reference

## Overview

Blockish is a WordPress Gutenberg block plugin. All blocks are prefixed `blockish/`. Blocks are stored as WordPress block markup in `post_content`.

### Block Markup Format

```
<!-- wp:blockish/heading {"content":"Hello","tag":{"label":"H2","value":"h2"}} -->
<h2 class="wp-block-blockish-heading">Hello</h2>
<!-- /wp:blockish/heading -->
```

The JSON inside the comment is the block's attributes. For dynamic blocks (PHP-rendered) the HTML between tags is empty — only the JSON matters.

### Nesting

```
<!-- wp:blockish/container {"display":"grid","gridColumns":{"Desktop":3}} -->
<!-- wp:blockish/heading {"content":"Title"} /-->
<!-- wp:blockish/button {"text":"Click"} /-->
<!-- /wp:blockish/container -->
```

Self-closing inner blocks use ` /-->`.

---

## Attribute Format Reference

---

### Responsive Object

Per-device values. Only `Desktop` required; others inherit from Desktop.

```json
{ "Desktop": "24px", "Tablet": "20px", "Mobile": "16px" }
```

Some responsive values hold an option object instead of a plain string:

```json
{ "Desktop": { "label": "Row", "value": "row" } }
```

---

### Tag Object

```json
{ "label": "H2", "value": "h2" }
```

Valid values: `h1` `h2` `h3` `h4` `h5` `h6` `div` `section` `article` `main` `aside` `header` `footer` `p` `span`

---

### Link / URL Object

```json
{ "url": "https://example.com", "newTab": false, "noFollow": false }
```

---

### Icon Object (SVG)

```json
{ "viewBox": [0, 0, 576, 512], "path": "M288 32 L576 480 L0 480 Z" }
```

`viewBox` is 4 numbers. `path` is the SVG `d` string.

---

### Image Object

```json
{ "id": 123, "url": "https://example.com/photo.jpg", "width": 1200, "height": 800 }
```

`id` is the WordPress attachment ID. Use `0` if only a URL is available.

---

### Color (string)

Plain CSS colors. For AI-generated content always use hex or rgba — never guess a theme preset slug.

```
"#1a73e8"
"rgba(0, 0, 0, 0.5)"
```

WP theme preset format (only use when slug is known):
```
"--wp--preset--color--primary|#1a73e8"
```

---

### Spacing Object (padding / margin)

Flat object — use responsive wrapper for per-device values.

```json
{ "top": "40px", "right": "20px", "bottom": "40px", "left": "20px" }
```

Responsive:

```json
{
  "Desktop": { "top": "60px", "right": "40px", "bottom": "60px", "left": "40px" },
  "Mobile":  { "top": "24px", "right": "16px", "bottom": "24px", "left": "16px" }
}
```

---

### Border Radius Object

```json
{ "Desktop": { "topLeft": "8px", "topRight": "8px", "bottomRight": "8px", "bottomLeft": "8px" } }
```

For a pill/circle use `"50%"` on all corners.

---

### Typography (JSON string)

**Must be JSON.stringified** — it is stored as a `string` attribute, not an object.

```json
"{\"fontWeight\":\"700\",\"fontSize\":{\"Desktop\":\"32px\",\"Tablet\":\"24px\",\"Mobile\":\"20px\"},\"lineHeight\":{\"Desktop\":\"1.2\"},\"letterSpacing\":{\"Desktop\":\"0px\"},\"textTransform\":\"uppercase\",\"fontStyle\":\"normal\",\"textDecoration\":\"none\"}"
```

Minimum example (size only):

```json
"{\"fontSize\":{\"Desktop\":\"18px\"}}"
```

| Key | Type | Valid values |
|---|---|---|
| `fontFamily` | object | `{"value": "Inter, sans-serif", "label": "Inter"}` |
| `fontWeight` | string | `"100"` `"200"` `"300"` `"400"` `"500"` `"600"` `"700"` `"800"` `"900"` |
| `fontSize` | Responsive Object | `{"Desktop":"24px"}` — supports `px` `em` `rem` |
| `lineHeight` | Responsive Object | `{"Desktop":"1.5"}` |
| `letterSpacing` | Responsive Object | `{"Desktop":"0.05em"}` |
| `textTransform` | string | `"none"` `"uppercase"` `"lowercase"` `"capitalize"` |
| `fontStyle` | string | `"normal"` `"italic"` |
| `textDecoration` | string | `"none"` `"underline"` `"line-through"` |

---

### Background (JSON string)

**Must be JSON.stringified.**

Solid color:
```json
"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#f5f7fa\"}"
```

With image:
```json
"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#000\",\"backgroundImage\":{\"Desktop\":{\"id\":45,\"url\":\"https://example.com/bg.jpg\"}},\"backgroundImageSize\":{\"Desktop\":{\"value\":\"cover\",\"label\":\"Cover\"}},\"backgroundImagePosition\":{\"Desktop\":{\"value\":\"center center\",\"label\":\"Center Center\"}},\"backgroundImageRepeat\":{\"Desktop\":{\"value\":\"no-repeat\",\"label\":\"No Repeat\"}}}"
```

Gradient:
```json
"{\"backgroundType\":\"gradient\",\"gradient\":\"linear-gradient(135deg, #667eea 0%, #764ba2 100%)\"}"
```

| Key | Valid values |
|---|---|
| `backgroundType` | `"classic"` `"gradient"` |
| `backgroundImageSize.*.value` | `"cover"` `"contain"` `"auto"` |
| `backgroundImagePosition.*.value` | `"center center"` `"top center"` `"bottom center"` `"left center"` `"right center"` |
| `backgroundImageRepeat.*.value` | `"no-repeat"` `"repeat"` `"repeat-x"` `"repeat-y"` |
| `backgroundImageAttachment.value` | `"scroll"` `"fixed"` |

---

### Background Overlay (JSON string)

**Must be JSON.stringified.** Renders on top of the background — used for darkening/tinting images.

Color overlay:
```json
"{\"enabled\":true,\"type\":\"color\",\"color\":\"rgba(0,0,0,0.5)\",\"opacity\":100}"
```

Gradient overlay:
```json
"{\"enabled\":true,\"type\":\"gradient\",\"gradient\":\"linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)\",\"opacity\":100}"
```

| Key | Valid values |
|---|---|
| `enabled` | `true` `false` |
| `type` | `"color"` `"gradient"` |
| `opacity` | `0`–`100` (integer) |
| `blendMode.value` | `"normal"` `"multiply"` `"overlay"` `"screen"` `"darken"` `"lighten"` |

---

### Border (JSON string)

**Must be JSON.stringified.**

Linked (all sides same):
```json
"{\"width\":{\"Desktop\":\"1px\"},\"style\":\"solid\",\"color\":\"#e0e0e0\"}"
```

Unlinked (per side — only specify sides you need):
```json
"{\"top\":{\"width\":{\"Desktop\":\"2px\"},\"style\":\"solid\",\"color\":\"#333\"},\"bottom\":{\"width\":{\"Desktop\":\"1px\"},\"style\":\"dashed\",\"color\":\"#ccc\"}}"
```

`style` valid values: `"solid"` `"dashed"` `"dotted"` `"double"` `"none"`

---

### Box Shadow / Text Shadow (JSON string)

**Must be JSON.stringified.** Value is an **array** of shadow objects.

```json
"[{\"x\":\"0px\",\"y\":\"4px\",\"blur\":\"16px\",\"spread\":\"0px\",\"color\":\"rgba(0,0,0,0.12)\",\"inset\":false}]"
```

Text shadow (no `spread` or `inset`):
```json
"[{\"x\":\"1px\",\"y\":\"1px\",\"blur\":\"4px\",\"color\":\"rgba(0,0,0,0.3)\"}]"
```

Multiple shadows — add more objects to the array.

---

### CSS Filters (JSON string)

**Must be JSON.stringified.** Units are added automatically — pass raw numbers only.

```json
"{\"blur\":0,\"brightness\":100,\"contrast\":100,\"saturate\":100,\"hue-rotate\":0,\"invert\":0,\"grayscale\":0,\"sepia\":0}"
```

| Key | Unit added | Normal value | Example effect |
|---|---|---|---|
| `blur` | `px` | `0` | `2` → soft blur |
| `brightness` | `%` | `100` | `80` → darker |
| `contrast` | `%` | `100` | `120` → more contrast |
| `saturate` | `%` | `100` | `0` → grayscale |
| `hue-rotate` | `deg` | `0` | `180` → inverted hue |
| `invert` | `%` | `0` | `100` → negative |
| `grayscale` | `%` | `0` | `100` → full grayscale |
| `sepia` | `%` | `0` | `80` → sepia tone |

Only include keys you want to change. Omitted keys are not applied.

---

### Text Stroke (JSON string)

**Must be JSON.stringified.**

```json
"{\"width\":{\"Desktop\":\"1px\"},\"color\":\"#1a1a2e\"}"
```

---

### Transform Attributes (Responsive Objects)

Individual attributes — set only what you need. Numbers only; units are added automatically.

| Attribute | Auto unit | Example |
|---|---|---|
| `rotateZ` | `deg` | `{"Desktop":"45"}` |
| `rotateX` | `deg` | `{"Desktop":"15"}` |
| `rotateY` | `deg` | `{"Desktop":"-10"}` |
| `translateX` | as-is | `{"Desktop":"20px"}` |
| `translateY` | as-is | `{"Desktop":"-10px"}` |
| `scale` | multiplier | `{"Desktop":"1.05"}` |
| `scaleX` | multiplier | `{"Desktop":"1.2"}` |
| `scaleY` | multiplier | `{"Desktop":"0.8"}` |
| `skewX` | `deg` | `{"Desktop":"5"}` |
| `skewY` | `deg` | `{"Desktop":"3"}` |
| `perspective` | as-is | `{"Desktop":"800px"}` |

Hover variants: same format with `Hover` suffix — `rotateZHover`, `scaleHover`, etc.

`transformTransitionDuration` — number in seconds, e.g. `0.3`.

---

## Global Attributes (available on every block)

Do **not** set `blockClass` or `styles` — they are auto-managed.

### Layout & Sizing

| Attribute | Format | Example |
|---|---|---|
| `padding` | Spacing Object | `{"top":"40px","right":"20px","bottom":"40px","left":"20px"}` |
| `margin` | Spacing Object | `{"top":"0px","bottom":"32px","right":"0px","left":"0px"}` |
| `widthType` | Responsive Object (option) | `{"Desktop":{"value":"100%"}}` · set to `{"Desktop":{"value":"custom"}}` to enable `customWidth` |
| `customWidth` | Responsive Object | `{"Desktop":"480px"}` — active when `widthType` = `"custom"` |
| `minWidth` | Responsive Object | `{"Desktop":"200px"}` |
| `maxWidth` | Responsive Object | `{"Desktop":"960px"}` |
| `zIndex` | Responsive Object | `{"Desktop":"10"}` |

### Position

| Attribute | Format | Valid values / Example |
|---|---|---|
| `position` | Responsive Object (option) | `{"Desktop":{"value":"relative"}}` · `"relative"` `"absolute"` `"fixed"` `"sticky"` |
| `positionTop` | Responsive Object | `{"Desktop":"0px"}` — only applies when `position` is set |
| `positionRight` | Responsive Object | `{"Desktop":"0px"}` |
| `positionBottom` | Responsive Object | `{"Desktop":"0px"}` |
| `positionLeft` | Responsive Object | `{"Desktop":"0px"}` |

### Flex Child (when block is inside a flex container)

| Attribute | Format | Valid values / Example |
|---|---|---|
| `alignSelf` | Responsive Object (option) | `{"Desktop":{"value":"flex-start"}}` · `"auto"` `"flex-start"` `"center"` `"flex-end"` `"stretch"` `"baseline"` |
| `justifySelf` | Responsive Object (option) | `{"Desktop":{"value":"center"}}` · `"auto"` `"start"` `"center"` `"end"` `"stretch"` |
| `flexOrder` | Responsive Object (option) | `{"Desktop":{"value":"1"}}` · set to `{"value":"custom"}` + use `flexCustomOrder` for arbitrary number |
| `flexCustomOrder` | Responsive Object | `{"Desktop":"3"}` — only active when `flexOrder` = `"custom"` |
| `flexGrow` | Responsive Object | `{"Desktop":"1"}` — `0` = no grow, `1` = grow to fill |
| `flexShrink` | Responsive Object | `{"Desktop":"0"}` — `0` = don't shrink, `1` = can shrink |

### Grid Child (when block is inside a grid container)

| Attribute | Format | Example |
|---|---|---|
| `gridColumnStart` | Responsive Object | `{"Desktop":"1"}` |
| `gridColumnEnd` | Responsive Object | `{"Desktop":"span 2"}` — spans 2 columns |
| `gridRowStart` | Responsive Object | `{"Desktop":"1"}` |
| `gridRowEnd` | Responsive Object | `{"Desktop":"span 2"}` |

### Appearance (global)

| Attribute | Format | Notes |
|---|---|---|
| `background` | Background (JSON string) | Block background — normal state |
| `backgroundHover` | Background (JSON string) | Block background — hover state |
| `backgroundHoverTransition` | number | Seconds, e.g. `0.3` |
| `border` | Border (JSON string) | Block border — normal state |
| `borderHover` | Border (JSON string) | Block border — hover state |
| `borderRadius` | Border Radius Object | `{"Desktop":{"topLeft":"8px","topRight":"8px","bottomRight":"8px","bottomLeft":"8px"}}` |
| `borderRadiusHover` | Border Radius Object | Same format |
| `borderHoverTransition` | number | Seconds, e.g. `0.3` |
| `boxShadow` | Box Shadow (JSON string) | Block shadow — normal state |
| `boxShadowHover` | Box Shadow (JSON string) | Block shadow — hover state |

---

## Custom CSS (per block)

Every block has a `customCss` attribute for one-off, block-specific CSS that does not need to be reused elsewhere.

- Write plain CSS. Use `{{SELECTOR}}` to target this block's wrapper element.
- `{{SELECTOR}}` resolves to the block's unique scoped class at render time (e.g., `.bb-a1b2c3.blockish-block-wrapper`).
- Do **not** set `blockClass` or `styles` — they are auto-managed and will be overwritten.

```
<!-- wp:blockish/container {
  "customCss":"{{SELECTOR}} { background: linear-gradient(135deg,#667eea,#764ba2); } {{SELECTOR}}:hover { opacity: 0.9; }"
} /-->
```

Target a child element:

```
"customCss": "{{SELECTOR}} h2 { font-size: 3rem; line-height: 1; } {{SELECTOR}} .wp-block-blockish-button { margin-top: 24px; }"
```

**When to use `customCss` vs Class Manager:**

| Situation | Use |
|---|---|
| One-off style for a single block instance | `customCss` attribute |
| Style that will be applied to multiple blocks or reused across pages | Class Manager (`blockish/manage-class`) |
| Pseudo-selectors (`:hover`, `::before`) or child selectors on a named class | Class Manager child class |

---

## Applying Class Manager Classes to Blocks

Classes created via `blockish/manage-class` are applied to blocks through two attributes:

### `classManager` — apply a parent class

A parent class has no `parent_id`. Its CSS selector is `.{slug}` (e.g., `.hero-card`). The slug is added directly to the block wrapper's `class`.

```json
"classManager": [{"id": 45, "title": "hero-card"}]
```

- `id` — the `post_id` returned by `blockish/get-classes` or `blockish/manage-class`
- `title` — the normalized slug (same as `name` in the classes list)
- Multiple parent classes: add more objects to the array

### `classManagerSubselector` — apply a child class

A child class has a `parent_id`. Its CSS selector is `.blockish-cm-{post_id}`. The class `blockish-cm-{id}` is added to the block wrapper.

```json
"classManagerSubselector": [{"id": 67, "title": "featured", "parent": 45}]
```

- `parent` key is **required** — must be the `post_id` of the parent class. Without it the class is not applied.
- The parent class must also be in `classManager` on the same block.

### Full example — block with both parent and child classes assigned

```
<!-- wp:blockish/container {
  "classManager": [{"id": 45, "title": "hero-card"}],
  "classManagerSubselector": [{"id": 67, "title": "featured", "parent": 45}]
} -->
<!-- wp:blockish/heading {"content":"Hello"} /-->
<!-- /wp:blockish/container -->
```

---

### Writing CSS for Class Manager classes

The CSS stored in a class is output **as-is** to the page — the system adds no wrapper or selector. You must write complete, valid CSS rules including the selector.

**Rule:** always use the `css_selector` value returned by `blockish/manage-class` as the root selector.

**Parent class example** (`css_selector` = `.hero-card`):

```css
.hero-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.hero-card:hover {
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  transform: translateY(-3px);
}
.hero-card h2 {
  font-size: 1.5rem;
  color: #111827;
  margin-bottom: 12px;
}
```

**Child class example** (`css_selector` = `.blockish-cm-67`):

```css
.blockish-cm-67 {
  border: 2px solid #1a73e8;
  background: #e8f0fe;
}
.blockish-cm-67:hover {
  background: #d2e3fc;
}
```

**Rules:**

| Rule | Detail |
|---|---|
| Full selector required | `css_selector { ... }` — never write bare declarations |
| Standard CSS only | No SCSS / Less. Pseudo-classes, pseudo-elements, combinators all valid. |
| Transitions inline | Include `transition` in the base rule, not the hover rule |
| Specificity | Classes are global — keep selectors scoped to your class to avoid side effects |
| No `!important` | Avoid unless overriding a WordPress default that cannot be removed any other way |

**Parent vs child — when to use which:**

| Use case | Type |
|---|---|
| A named, reusable style (`.card`, `.badge`, `.hero-section`) | Parent class |
| A variant of a parent that applies different styles on specific blocks (e.g. a "featured" card in a card grid) | Child class |
| Pseudo-class / child element styles scoped to a single block instance | Child class |

---

### Workflow: create a class then apply it

1. Call `blockish/get-class-manager-docs` for the full CSS writing reference (once per session).
2. Call `blockish/get-classes` to check if the class already exists.
3. If not, call `blockish/manage-class` (action: `create`, name, css) — it returns `post_id`, `name`, and `css_selector`.
4. Add to `classManager` (parent): `{"id": post_id, "title": name}`.
5. Add to `classManagerSubselector` (child): `{"id": post_id, "title": name, "parent": parent_post_id}` — `parent` is required.

---

## Block Reference

---

### `blockish/container`

The primary layout block. Wraps other blocks. Supports flexbox and CSS grid.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `tagName` | `{"label":"Section","value":"section"}` | `div` `section` `article` `main` `aside` `header` `footer` |
| `display` | `"flex"` or `"grid"` | Switches between flex and grid mode |
| `containerWidth` | `"alignfull"` `"alignwide"` `"custom"` | Use `"custom"` + `customWidthContainer` for a fixed width |
| `customWidthContainer` | `{"Desktop":"1200px"}` | Active when `containerWidth` = `"custom"` |
| `containerMinHeight` | `{"Desktop":"500px"}` | Min height, e.g. for hero sections |
| `overflow` | `{"Desktop":{"value":"hidden"}}` | `"visible"` `"hidden"` `"scroll"` `"auto"` |
| **— Flex —** | | |
| `flexDirection` | `{"Desktop":{"label":"Row","value":"row"}}` | `"row"` `"column"` `"row-reverse"` `"column-reverse"` |
| `flexWrap` | `{"Desktop":{"label":"Wrap","value":"wrap"}}` | `"nowrap"` `"wrap"` `"wrap-reverse"` |
| `justifyContent` | `{"Desktop":{"label":"Center","value":"center"}}` | `"flex-start"` `"center"` `"flex-end"` `"space-between"` `"space-around"` `"space-evenly"` |
| `alignItems` | `{"Desktop":{"label":"Center","value":"center"}}` | `"flex-start"` `"center"` `"flex-end"` `"stretch"` `"baseline"` |
| `columnGap` | `{"Desktop":"24px"}` | Gap between flex columns |
| `rowGap` | `{"Desktop":"24px"}` | Gap between flex rows |
| **— Grid —** | | |
| `gridLayoutType` | `"auto"` or `"fixed"` | `"auto"` = auto-fit columns; `"fixed"` = explicit column/row count |
| `gridColumns` | `{"Desktop":3,"Tablet":2,"Mobile":1}` | Column count — used when `gridLayoutType` = `"fixed"` |
| `gridRows` | `{"Desktop":2}` | Row count — used when `gridLayoutType` = `"fixed"` |
| `autoGridWidth` | `{"Desktop":"14rem"}` | Min column width — used when `gridLayoutType` = `"auto"` |
| `autoGridHeight` | `{"Desktop":"200px"}` | Row height for auto grid |
| **— Container appearance —** | | |
| `containerBackground` | Background (JSON string) | Normal state |
| `containerHoverBackground` | Background (JSON string) | Hover state |
| `containerBackgroundOverlay` | Background Overlay (JSON string) | Overlay on background — normal |
| `containerHoverBackgroundOverlay` | Background Overlay (JSON string) | Overlay on background — hover |
| `containerBorder` | Border (JSON string) | Normal state |
| `containerHoverBorder` | Border (JSON string) | Hover state |
| `containerBorderRadius` | `{"Desktop":{"topLeft":"12px","topRight":"12px","bottomRight":"12px","bottomLeft":"12px"}}` | |
| `containerBoxShadow` | Box Shadow (JSON string) | Normal state |
| `containerHoverBoxShadow` | Box Shadow (JSON string) | Hover state |

**Example — hero section:**

```
<!-- wp:blockish/container {"display":"flex","flexDirection":{"Desktop":{"label":"Column","value":"column"}},"alignItems":{"Desktop":{"label":"Center","value":"center"}},"justifyContent":{"Desktop":{"label":"Center","value":"center"}},"containerMinHeight":{"Desktop":"100vh"},"containerBackground":"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#0f172a\"}","padding":{"top":"80px","right":"40px","bottom":"80px","left":"40px"}} -->
<!-- wp:blockish/heading {"content":"Welcome","tag":{"label":"H1","value":"h1"},"color":"#ffffff"} /-->
<!-- /wp:blockish/container -->
```

---

### `blockish/heading`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `content` | `"Our Services"` | Plain text or HTML |
| `tag` | `{"label":"H2","value":"h2"}` | `h1`–`h6` |
| `alignment` | `{"Desktop":"center","Mobile":"left"}` | `"left"` `"center"` `"right"` |
| `typography` | Typography (JSON string) | Full font control |
| `color` | `"#0f172a"` | Normal text color |
| `hoverColor` | `"#1a73e8"` | Text color on hover |
| `textShadow` | Box Shadow (JSON string) | Normal text shadow |
| `textShadowHover` | Box Shadow (JSON string) | Hover text shadow |

**Example:**

```
<!-- wp:blockish/heading {"content":"Build Faster","tag":{"label":"H1","value":"h1"},"alignment":{"Desktop":"center"},"color":"#0f172a","typography":"{\"fontWeight\":\"700\",\"fontSize\":{\"Desktop\":\"56px\",\"Tablet\":\"40px\",\"Mobile\":\"32px\"},\"lineHeight\":{\"Desktop\":\"1.1\"}}"} /-->
```

---

### `blockish/button`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `text` | `"Get Started"` | Button label |
| `url` | `{"url":"https://example.com","newTab":true,"noFollow":false}` | Link destination |
| `icon` | Icon Object | Optional SVG icon |
| `iconPosition` | `"row"` or `"row-reverse"` | `"row"` = icon left of text; `"row-reverse"` = icon right |
| `buttonTextColor` | `"#ffffff"` | Label color — normal |
| `buttonHoverTextColor` | `"#ffffff"` | Label color — hover |
| `buttonBackground` | Background (JSON string) | Button background — normal |
| `buttonHoverBackground` | Background (JSON string) | Button background — hover |
| `buttonBorder` | Border (JSON string) | Normal |
| `buttonHoverBorderColor` | `"#1a73e8"` | Border color override on hover |
| `buttonBorderRadius` | `{"Desktop":{"topLeft":"6px","topRight":"6px","bottomRight":"6px","bottomLeft":"6px"}}` | |
| `buttonPadding` | `{"top":"14px","right":"28px","bottom":"14px","left":"28px"}` | Inner padding |
| `buttonTypography` | Typography (JSON string) | |
| `buttonBoxShadow` | Box Shadow (JSON string) | Normal |
| `buttonHoverBoxShadow` | Box Shadow (JSON string) | Hover |
| `buttonHoverTransition` | `0.3` | Hover transition in seconds |
| `buttonWidth` | `{"Desktop":"200px"}` | Fixed width |
| `buttonMinHeight` | `{"Desktop":"48px"}` | Minimum height |
| `buttonIconSize` | `{"Desktop":"18px"}` | Icon size override |

**Example:**

```
<!-- wp:blockish/button {"text":"Get Started Free","url":{"url":"/signup","newTab":false},"buttonBorderRadius":{"Desktop":{"topLeft":"6px","topRight":"6px","bottomRight":"6px","bottomLeft":"6px"}},"buttonPadding":{"top":"14px","right":"28px","bottom":"14px","left":"28px"},"buttonBackground":"{\"backgroundType\":\"classic\",\"backgroundColor\":\"#1a73e8\"}","buttonTextColor":"#ffffff"} /-->
```

---

### `blockish/icon`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `icon` | `{"viewBox":[0,0,24,24],"path":"M12 2 L22 22 L2 22 Z"}` | SVG data |
| `link` | `{"url":"https://example.com","newTab":false}` | Makes icon a link |
| `size` | `{"Desktop":"48px","Mobile":"32px"}` | Icon size |
| `color` | `"#1a73e8"` | Fill — normal |
| `hoverColor` | `"#0d47a1"` | Fill — hover |
| `alignment` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `rotation` | `{"Desktop":"0deg"}` | Rotation angle — normal |
| `rotationHover` | `{"Desktop":"90deg"}` | Rotation angle — hover |

---

### `blockish/image`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `image` | `{"id":123,"url":"https://example.com/photo.jpg","width":1200,"height":800}` | |
| `alt` | `"Team photo"` | Alt text |
| `imageSize` | `{"value":"full","label":"Full Size"}` | WP size: `"thumbnail"` `"medium"` `"large"` `"full"` |
| `captionType` | `"none"` `"attachment"` `"custom"` | `"attachment"` = WP media caption; `"custom"` = use `customCaption` |
| `customCaption` | `"Photo by Jane Doe"` | Used when `captionType` = `"custom"` |
| `alignment` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `imageWidth` | `{"Desktop":"100%"}` | CSS width |
| `imageMaxWidth` | `{"Desktop":"600px"}` | CSS max-width |
| `imageHeight` | `{"Desktop":"400px"}` | CSS height |
| `objectFit` | `{"Desktop":{"value":"cover"}}` | `"fill"` `"contain"` `"cover"` `"none"` `"scale-down"` |
| `imageBorderRadiusNormal` | `{"Desktop":{"topLeft":"8px","topRight":"8px","bottomRight":"8px","bottomLeft":"8px"}}` | |
| `imageBorderNormal` | Border (JSON string) | Normal |
| `imageBoxShadowNormal` | Box Shadow (JSON string) | Normal |
| `imageCSSFiltersNormal` | CSS Filters (JSON string) | Normal |
| `imageCSSFiltersHover` | CSS Filters (JSON string) | Hover |
| `imageOpacityNormal` | `0.9` | 0–1 |
| `imageOpacityHover` | `1` | 0–1 |
| `imageHoverTransition` | `0.3` | Seconds |

---

### `blockish/video`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `sourceType` | `{"label":"YouTube","value":"youtube"}` | `"youtube"` `"vimeo"` `"self-hosted"` |
| `youtubeUrl` | `"https://www.youtube.com/watch?v=XXXXX"` | Full URL |
| `vimeoUrl` | `"https://vimeo.com/123456"` | Full URL |
| `selfHostedVideo` | `{"id":45,"url":"https://example.com/video.mp4"}` | WP media object |
| `selfHostedUrl` | `"https://example.com/video.mp4"` | Direct URL fallback |
| `poster` | `"https://example.com/thumb.jpg"` | Poster image URL |
| `autoplay` | `false` | `true` or `false` |
| `loop` | `false` | |
| `muted` | `false` | Set to `true` when autoplay is `true` |
| `controls` | `true` | Show native player controls |
| `lazyLoad` | `true` | |
| `startTime` | `30` | Start at second 30 |
| `endTime` | `0` | `0` = play to end |
| `privacyMode` | `false` | YouTube: use `youtube-nocookie.com` |
| `suggestedVideos` | `{"label":"Current Channel","value":"currentChannel"}` | `"currentChannel"` `"anyVideo"` |
| `videoAspectRatio` | `{"label":"16:9","value":"16 / 9"}` | `"16 / 9"` `"4 / 3"` `"1 / 1"` `"9 / 16"` |
| `showOverlay` | `false` | Show poster + play button on top of video |
| `overlayImage` | Image Object | Custom overlay poster |
| `showOverlayPlayIcon` | `true` | Show play button on overlay |
| `videoCSSFilters` | CSS Filters (JSON string) | |

---

### `blockish/google-map`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `location` | `"1600 Amphitheatre Parkway, Mountain View, CA"` | Address or place name |
| `zoom` | `14` | `1` (world) – `20` (building). `14` is good for city-level |
| `mapHeight` | `"400px"` | CSS height — px or vh |
| `mapCSSFiltersNormal` | CSS Filters (JSON string) | For grayscale/dark map effects |
| `mapCSSFiltersHover` | CSS Filters (JSON string) | |
| `mapHoverTransition` | `0.3` | Seconds |

**Grayscale map example:**

```
<!-- wp:blockish/google-map {"location":"New York, NY","zoom":13,"mapHeight":"480px","mapCSSFiltersNormal":"{\"grayscale\":100}"} /-->
```

---

### `blockish/icon-list`

Contains `blockish/icon-list-item` children.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `layout` | `"column"` or `"row"` | `"column"` = stacked list; `"row"` = horizontal |
| `rowGap` | `{"Desktop":"16px"}` | Vertical gap between items |
| `columnGap` | `{"Desktop":"24px"}` | Horizontal gap (when layout is `"row"`) |
| `itemPadding` | `{"top":"8px","right":"0px","bottom":"8px","left":"0px"}` | Per-item padding |
| `itemContentSpacing` | `{"Desktop":"12px"}` | Gap between icon and text |
| `itemIconSize` | `{"Desktop":"20px"}` | Icon size for all items |
| `itemIconColor` | `"#1a73e8"` | Icon color for all items — normal |
| `itemIconHoverColor` | `"#0d47a1"` | Icon color for all items — hover |
| `itemTextColor` | `"#374151"` | Text color for all items — normal |
| `itemTextHoverColor` | `"#111827"` | Text color for all items — hover |
| `itemTextTypography` | Typography (JSON string) | Typography for all items |

---

### `blockish/icon-list-item`

Must be inside `blockish/icon-list`.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `text` | `"Free forever plan"` | Item label (HTML allowed) |
| `icon` | Icon Object | Item SVG icon |
| `link` | `{"url":"/pricing","newTab":false}` | Makes item a link |
| `iconSize` | `{"Desktop":"18px"}` | Per-item override |
| `iconColor` | `"#22c55e"` | Per-item icon color — normal |
| `iconHoverColor` | `"#16a34a"` | Per-item icon color — hover |
| `textColor` | `"#374151"` | Per-item text color — normal |
| `textHoverColor` | `"#111827"` | Per-item text color — hover |
| `iconHoverTransition` | `0.2` | Seconds |
| `textHoverTransition` | `0.2` | Seconds |

---

### `blockish/rating`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `rating` | `4.5` | Current value — decimals OK |
| `ratingScale` | `5` | Max value, typically `5` or `10` |
| `icon` | Icon Object | Icon shape — default is a star |
| `alignment` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `iconSize` | `{"Desktop":"28px"}` | Per-icon size |
| `iconSpacing` | `{"Desktop":"4px"}` | Gap between icons |
| `iconColor` | `"#f59e0b"` | Filled (active) icon color |
| `unmarkedColor` | `"#d1d5db"` | Unfilled icon color |

---

### `blockish/counter`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `startNumber` | `0` | Count from |
| `endNumber` | `500` | Count to |
| `numberPrefix` | `"$"` | Text before number |
| `numberSuffix` | `"+"` | Text after number — e.g. `"+"` `"%"` `"k"` |
| `animationDuration` | `2` | Seconds to reach `endNumber` |
| `thousandSeparator` | `true` | `true` = `1,000`; `false` = `1000` |
| `separator` | `{"label":"Default","value":"default"}` | Separator style |
| `title` | `"Happy Clients"` | Label near the number |
| `titleTag` | `{"label":"H4","value":"h4"}` | `h1`–`h6` |
| `titlePosition` | `"before"` or `"after"` | `"before"` = title above number; `"after"` = title below |
| `titleHorizontalAlignment` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `numberPosition` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `numberTextColor` | `"#1a73e8"` | Number color |
| `numberTypography` | Typography (JSON string) | Number font |
| `titleTextColor` | `"#374151"` | Title color |
| `titleTypography` | Typography (JSON string) | Title font |

---

### `blockish/progress-bar`

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `title` | `"JavaScript"` | Label above the bar |
| `titleTag` | `{"label":"H4","value":"h4"}` | `h1`–`h6` |
| `showTitle` | `true` | Show/hide title |
| `percentage` | `85` | Fill level — integer 0–100 |
| `animationDuration` | `1.5` | Fill animation in seconds |
| `displayPercentage` | `true` | Show `"85%"` inside the bar fill |
| `innerText` | `"Advanced"` | Replaces percentage number with custom text |
| `percentageFillColor` | `"#1a73e8"` | Fill bar color |
| `percentageBackgroundColor` | `"#e5e7eb"` | Track background color |
| `percentageHeight` | `{"Desktop":"14px"}` | Bar height |
| `percentageBorderRadius` | `{"Desktop":"100px"}` | Full rounding for pill shape |
| `titleTextColor` | `"#111827"` | |
| `innerTextColor` | `"#ffffff"` | Text inside the fill |

---

### `blockish/social-icons`

Contains `blockish/social-icon-item` children.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `shape` | `"circle"` | `"circle"` `"square"` `"rounded"` |
| `alignment` | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `columns` | `{"Desktop":"auto-fit"}` | `"auto-fit"` or a number e.g. `{"Desktop":5}` |
| `iconColorMode` | `"official"` | `"official"` = brand colors; `"custom"` = use `iconColor` |
| `iconColor` | `"#ffffff"` | Custom icon color — active when `iconColorMode` = `"custom"` |
| `iconSecondaryColor` | `"#ffffff"` | Background/secondary color |
| `iconSize` | `{"Desktop":"40px"}` | Icon display size |
| `iconPadding` | `{"top":"8px","right":"8px","bottom":"8px","left":"8px"}` | Padding inside each icon cell |
| `iconSpacing` | `{"Desktop":"12px"}` | Gap between icons (horizontal) |
| `iconRowsGap` | `{"Desktop":"12px"}` | Gap between icon rows |
| `iconBorder` | Border (JSON string) | Border per icon |
| `iconBorderRadius` | Border Radius Object | Corner rounding per icon |
| `hoverAnimation` | `"none"` | `"none"` `"float"` `"sink"` `"grow"` `"spin"` `"pulse"` |

---

### `blockish/social-icon-item`

Must be inside `blockish/social-icons`.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `network` | `"instagram"` | `facebook` `twitter` `instagram` `linkedin` `youtube` `pinterest` `tiktok` `github` `dribbble` `behance` `snapchat` `reddit` `whatsapp` `telegram` `discord` |
| `label` | `"Instagram"` | Accessible label / tooltip |
| `icon` | Icon Object | SVG — defaults to the network icon if omitted |
| `officialColor` | `"#E1306C"` | Brand hex color for this item |
| `link` | `{"url":"https://instagram.com/username","newTab":true}` | Profile URL |

---

### `blockish/accordion`

Contains `blockish/accordion-item` children.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `maxItemExpanded` | `"one"` | `"one"` = only one panel open at a time; `"many"` = multiple allowed |
| `faqSchema` | `true` | Adds `FAQPage` JSON-LD — good for SEO on FAQ pages |
| `iconPosition` | `{"Desktop":"row"}` | `"row"` = icon on right; `"row-reverse"` = icon on left |
| `itemPosition` | `{"Desktop":"start"}` | Content alignment inside header: `"start"` `"center"` `"end"` |
| `itemsSpaceBetween` | `{"Desktop":"8px"}` | Gap between accordion items |
| `distanceBetweenContent` | `{"Desktop":"12px"}` | Gap between header and open content panel |
| `accordionBackgroundNormal` | Background (JSON string) | Per-item background — normal |
| `accordionBorderNormal` | Border (JSON string) | Per-item border — normal |
| `accordionBorderRadius` | Border Radius Object | Corner rounding |
| `accordionPadding` | `{"top":"16px","right":"20px","bottom":"16px","left":"20px"}` | Header inner padding |
| `headerTypography` | Typography (JSON string) | Header text font |
| `headerTextColor` | `"#111827"` | Header text — normal |
| `headerTextColorHover` | `"#1a73e8"` | Header text — hover |
| `headerTextColorActive` | `"#1a73e8"` | Header text — active/open |
| `iconColor` | `"#6b7280"` | Toggle icon — normal |
| `iconColorHover` | `"#1a73e8"` | Toggle icon — hover |
| `iconColorActive` | `"#1a73e8"` | Toggle icon — active |
| `iconSize` | `{"Desktop":"16px"}` | Toggle icon size |
| `contentBackground` | Background (JSON string) | Content area background |
| `contentTextColor` | `"#374151"` | Content area text color |
| `contentPadding` | `{"top":"16px","right":"20px","bottom":"20px","left":"20px"}` | Content area padding |

**Example with FAQ schema:**

```
<!-- wp:blockish/accordion {"faqSchema":true,"maxItemExpanded":"one"} -->
<!-- wp:blockish/accordion-item {"title":"What is Blockish?","defaultOpen":true} -->
<!-- wp:paragraph --><p>Blockish is a Gutenberg block plugin.</p><!-- /wp:paragraph -->
<!-- /wp:blockish/accordion-item -->
<!-- wp:blockish/accordion-item {"title":"Is it free?"} -->
<!-- wp:paragraph --><p>Yes, the core plugin is free.</p><!-- /wp:paragraph -->
<!-- /wp:blockish/accordion-item -->
<!-- /wp:blockish/accordion -->
```

---

### `blockish/accordion-item`

Must be inside `blockish/accordion`.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `title` | `"What is included?"` | Panel header text |
| `titleTag` | `{"label":"H3","value":"h3"}` | `h1`–`h6` |
| `defaultOpen` | `false` | Set `true` on one item to open it by default |
| `expandIcon` | Icon Object | Icon when panel is collapsed (default: plus) |
| `collapseIcon` | Icon Object | Icon when panel is expanded (default: minus) |
| `itemId` | — | Auto-generated — leave empty |

Content area accepts any inner blocks.

---

### `blockish/tab`

Contains `blockish/tab-item` children.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `direction` | `{"Desktop":"column"}` | `"column"` = tab nav on top; `"row"` = tab nav on left side |
| `defaultActiveTab` | `0` | Zero-based index of initially active tab |
| `justify` | `{"Desktop":"flex-start"}` | Tab nav alignment: `"flex-start"` `"center"` `"flex-end"` `"space-between"` |
| `alignTitle` | `{"Desktop":"left"}` | Text align inside each tab button: `"left"` `"center"` `"right"` |
| `navGap` | `{"Desktop":"8px"}` | Gap between tab buttons |
| `distanceFromContent` | `{"Desktop":"16px"}` | Gap between tab nav row and content panel |
| `iconPosition` | `{"Desktop":"row"}` | Icon on tab button: `"row"` = icon left; `"row-reverse"` = icon right |
| `tabsBackgroundNormal` | Background (JSON string) | Tab button bg — normal |
| `tabsBackgroundHover` | Background (JSON string) | Tab button bg — hover |
| `tabsBackgroundActive` | Background (JSON string) | Tab button bg — active |
| `tabsBorderNormal` | Border (JSON string) | Tab button border — normal |
| `tabsBorderActive` | Border (JSON string) | Tab button border — active |
| `tabsBorderRadius` | Border Radius Object | Tab button corner rounding |
| `tabsPadding` | `{"top":"10px","right":"20px","bottom":"10px","left":"20px"}` | Tab button inner padding |
| `titleTypography` | Typography (JSON string) | Tab title font |
| `titleColorNormal` | `"#6b7280"` | Tab title — normal |
| `titleColorHover` | `"#111827"` | Tab title — hover |
| `titleColorActive` | `"#1a73e8"` | Tab title — active |
| `iconSize` | `{"Desktop":"18px"}` | Tab icon size |
| `iconColorNormal` | `"#9ca3af"` | Tab icon — normal |
| `iconColorActive` | `"#1a73e8"` | Tab icon — active |
| `contentBackground` | Background (JSON string) | Content panel background |
| `contentColor` | `"#374151"` | Content panel text color |
| `contentBorder` | Border (JSON string) | Content panel border |
| `contentBorderRadius` | Border Radius Object | Content panel corner rounding |
| `contentPadding` | `{"top":"24px","right":"24px","bottom":"24px","left":"24px"}` | Content panel padding |

---

### `blockish/tab-item`

Must be inside `blockish/tab`.

| Attribute | Valid values / Example | Notes |
|---|---|---|
| `title` | `"Features"` | Tab button label |
| `tabIcon` | Icon Object | Optional icon on the tab button |
| `defaultActive` | `false` | Set `true` on one item — must match `defaultActiveTab` index on parent |

Content area accepts any inner blocks.

**Example:**

```
<!-- wp:blockish/tab {"defaultActiveTab":0,"navGap":{"Desktop":"8px"},"distanceFromContent":{"Desktop":"16px"}} -->
<!-- wp:blockish/tab-item {"title":"Overview","defaultActive":true} -->
<!-- wp:paragraph --><p>Overview content here.</p><!-- /wp:paragraph -->
<!-- /wp:blockish/tab-item -->
<!-- wp:blockish/tab-item {"title":"Features"} -->
<!-- wp:paragraph --><p>Features content here.</p><!-- /wp:paragraph -->
<!-- /wp:blockish/tab-item -->
<!-- /wp:blockish/tab -->
```
