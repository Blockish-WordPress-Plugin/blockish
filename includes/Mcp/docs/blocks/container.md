### `blockish/container`

Primary layout block — flexbox, CSS grid, or plain block. **Accepts children: yes.**

> [!WARNING]
> **Hard rule — flex alignment:** Top-level containers ship centered (`justify-content` / `align-items: center` in Already-there CSS). Nested containers reset to no alignment default. Only convert alignment CSS when intentional (`flex-start` for copy columns, `stretch` for equal-height cards). Button placement is converted on the button itself — parent align does not move buttons.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `display` | Scalar | `"flex"` (default) `"grid"` `"block"`. Also produced by convert-css `display:` — either path works; markup class `layout-type-*` follows the attr. |
| `tagName` | Option | Default `{"label":"Div","value":"div"}` — send the object, never a bare string. Values: `div` `section` `article` `main` `a` `nav` `aside` `header` `footer` `ul` `ol` `li` `figure` (labels are the capitalised name, e.g. `{"label":"Section","value":"section"}`). Avoid `header`/`footer` inside template parts (double tags). When `a`, also set `url`. No nested links/buttons inside a linked container. |
| `url` | Link | Only when `tagName.value` is `"a"`. |
| `containerWidth` | Scalar | `"alignfull"` (default) `"alignwide"` `"align-custom-width"` (literal — not `"custom"`). Nested containers use `align-custom-width`; max-width via convert-css. |
| `gridLayoutType` | Scalar | `"auto"` (default, auto-fit) or `"fixed"` (exact column count). Only matters when `display` is `"grid"`. |
| `anchor` / `align` | Scalar | See §7.1. `"align"`: `"wide"` \| `"full"`. |
| `containerBackground` (video only) | Stringified-JSON | **Only** way to get a background `<video>`. convert-css color/image/gradient backgrounds do **not** create the element. Set by hand before `css_to_schema`, then style via Markup selectors. Shape: `{"backgroundType":"video","backgroundVideo":{"id":123,"url":"https://…/file.mp4"}}` — use `blockish/get-media` / `upload-media` for a real `id`+`url`. Autoplay/muted/loop/playsInline are hardcoded in save. |

Color / image / gradient backgrounds: write CSS → convert-css (`containerBackground`). Do not hand-author those payloads.
Overlay: write CSS against `{{ROOT}}.has-background-overlay::before` → convert-css sets `containerBackgroundOverlay` (and flips `enabled`).

#### Markup

Default (empty attributes — still not a plain HTML `div`):

```html
<div class="wp-block-blockish-container blockish-container layout-type-flex alignfull">
  <!-- innerBlocks -->
</div>
```

The width class (`alignfull` / `alignwide` / `align-custom-width`) is only printed when
`isVariationPicked` is true. MCP staging sets that on every container automatically, so you
never write it — but a container built outside MCP without it renders with no width class and
shows the variation placeholder in the editor.

| When | What changes |
|---|---|
| `display: "grid"` | Root class `layout-type-grid` + `grid-layout-type-auto` or `grid-layout-type-fixed` (from `gridLayoutType`). |
| `display: "block"` | Root class `layout-type-block`. |
| `tagName.value: "a"` + `url` | Root element is `<a …>` (link props applied). |
| Video `containerBackground` set (see above) | Class `has-background-video` + child `<video class="blockish-container-background-video" src="…" autoplay muted loop playsinline>`. |
| Overlay CSS converted (or overlay enabled) | Class `has-background-overlay` (styles land on `::before`). |
| `containerWidth: "alignwide"` | Class `alignwide` instead of `alignfull`. |
| `containerWidth: "align-custom-width"` | Class `align-custom-width` (max-width from attrs / convert-css). |

Style with convert-css:
- wrapper / flex / color-image-gradient bg → `{{ROOT}} { … }`
- video element overrides (Already-there already covers + object-fits) → `{{ROOT}} .blockish-container-background-video { object-fit: contain; }`
- dim video → `{{ROOT}}.has-background-overlay::before { background: rgba(0,0,0,.45); }`
Do not invent markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Defaults from attributes (only emit when explicitly set) */
.wp-block-blockish-container.blockish-container { display: flex; }

/* Stylesheet */
:where(.wp-block-blockish-container) { position: relative; min-height: 0; }
:where(.wp-block-blockish-container > .block-list-appender) { min-height: 0; }
.wp-block-blockish-container { transition: all 0.3s ease; }
.wp-block-blockish-container:is(a) { color: inherit; text-decoration: none; }
.wp-block-blockish-container:is(a) * { text-decoration: none; }
.wp-block-blockish-container.has-background-video { overflow: hidden; position: relative; }
.wp-block-blockish-container.has-background-video > :not(.blockish-container-background-video) { position: relative; z-index: 1; }
.wp-block-blockish-container.has-background-overlay::before { content: ""; inset: 0; position: absolute; z-index: 0; }
.wp-block-blockish-container .blockish-container-background-video { height: 100%; inset: 0; object-fit: cover; pointer-events: none; position: absolute; width: 100%; z-index: -1; }
:where(.wp-block-blockish-container.align-custom-width) { margin-left: auto; margin-right: auto; max-width: 100%; }
:where(.wp-block-blockish-container .wp-block-blockish-container.align-custom-width) { margin-left: unset; margin-right: unset; }
/* Flex defaults at :where (spec 0) so Class Manager / attrs can override; nested flex resets align/justify only */
:where(.wp-block-blockish-container.blockish-container.layout-type-flex) { flex-direction: row; align-items: center; justify-content: center; }
:where(.wp-block-blockish-container .wp-block-blockish-container.blockish-container.layout-type-flex) { align-items: normal; justify-content: normal; }
:where(.wp-block-blockish-container.blockish-container.layout-type-grid.grid-layout-type-auto) { grid-template-columns: repeat(auto-fill, minmax(min(12rem, 100%), 1fr)); }
:where(.wp-block-blockish-container.blockish-container.layout-type-grid.grid-layout-type-fixed) { grid-template-columns: repeat(3, minmax(0, 1fr)); grid-template-rows: repeat(1, minmax(0, 1fr)); }
@media (max-width: 1024px) { :where(.wp-block-blockish-container.blockish-container.layout-type-grid.grid-layout-type-fixed) { grid-template-columns: repeat(2, minmax(0, 1fr)); } }
@media (max-width: 768px) { :where(.wp-block-blockish-container.blockish-container.layout-type-grid.grid-layout-type-fixed) { grid-template-columns: repeat(1, minmax(0, 1fr)); } }
```

#### Minimal schema

```json
{
  "name": "blockish/container",
  "attributes": {},
  "innerBlocks": []
}
```
