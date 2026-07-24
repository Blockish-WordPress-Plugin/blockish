### `blockish/container`

The primary layout block — flexbox or CSS grid. **Accepts children: yes.**

> [!WARNING]
> **Hard rule — `alignItems` / `justifyContent`:** **Top-level** containers default to **Center** (via base CSS — omit the attrs). **Nested** (child) containers have **no default** — omit `alignItems`/`justifyContent` unless you intentionally need alignment (e.g. `flex-start` for copy columns, `stretch` for equal-height cards, `center` for a centered stack inside a column). Do **not** copy Center onto every nested container. Centering a button requires `buttonPlacement` on the button — parent align does not move buttons. After designing, re-check `flexDirection`, `alignItems`, and `justifyContent`.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|

| `tagName` | Option | `{"label":"Div","value":"div"}` | Options: `[{"label":"Div","value":"div"},{"label":"Section","value":"section"},{"label":"Article","value":"article"},{"label":"Main","value":"main"},{"label":"a(Link)","value":"a"},{"label":"Nav","value":"nav"},{"label":"Aside","value":"aside"},{"label":"Header","value":"header"},{"label":"Footer","value":"footer"},{"label":"Ul(List)","value":"ul"},{"label":"Ol(List)","value":"ol"},{"label":"Li(List Item)","value":"li"},{"label":"Figure","value":"figure"}]` <br>**Note:** Do not use `header` or `footer` when building inside a Template Part, to avoid double `<header>`/`<footer>` tags. When `value` is `"a"`, also set `url` (BlockishLink object). Avoid nested links/buttons inside a linked container. |
| `url` | Link object | unset | Used when `tagName.value` is `"a"`. Same shape as Button `url` (`url`, `newTab`, `noFollow`, optional dynamic). Renders as `href` / `target` / `rel` on the container wrapper. |
| `display` | Scalar (string) | `"flex"` | `"flex"` `"grid"` <br>**CSS:** `.{{WRAPPER}}.blockish-container` -> `display: {{VALUE}};` |
| `containerWidth` | Scalar (string) | `"alignfull"` | `"alignfull"` `"alignwide"` `"align-custom-width"` (with `customWidthContainer`) — **the custom option's value is the literal string `"align-custom-width"`, not `"custom"`**. **Nested containers:** the editor forces nested containers to `align-custom-width`. Keep `customWidthContainer` at the default `100%` unless you intentionally need a narrower inner shell (e.g. `1200px`). Do not rely on top-level centering margins on nested containers — see Base CSS below. |
| `customWidthContainer` | Responsive | `{"Desktop":"100%"}` | Active when `containerWidth` = `"align-custom-width"` <br>**CSS:** `.{{WRAPPER}}.align-custom-width` -> `max-width: {{VALUE}};`. For a container nested inside another container, prefer leaving this at `100%` so it fills the parent; set a px/`rem` max-width only when you need a constrained content shell. |
| `containerMinHeight` | Responsive | `{"Desktop":"0"}` | <br>**CSS:** `.{{WRAPPER}}` -> `min-height: {{VALUE}};` | `.{{WRAPPER}} > .block-list-appender` -> `min-height: {{VALUE}};` |
| `overflow` | Responsive-Option | unset | Options: `[{"label":"Visible","value":"visible"},{"label":"Hidden","value":"hidden"},{"label":"Scroll","value":"scroll"},{"label":"Auto","value":"auto"}]` <br>**CSS:** `.{{WRAPPER}}.blockish-container` -> `overflow: {{VALUE}};` |
| `flexDirection` | Responsive-Option | unset | Used when `display` = `"flex"`. Options: `[{"label":"Row","value":"row"},{"label":"Column","value":"column"},{"label":"Row Reverse","value":"row-reverse"},{"label":"Column Reverse","value":"column-reverse"}]` <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-flex` -> `flex-direction: {{VALUE}};` |
| `flexWrap` | Responsive | unset | Used when `display` = `"flex"`. `"wrap"` `"nowrap"` `"wrap-reverse"` <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-flex` -> `flex-wrap: {{VALUE}};` |
| `justifyContent` | Responsive-Option | **Top-level:** Center (base CSS when omitted). **Nested:** unset (omit) | Used when `display` = `"flex"`. Options: `[{"label":"Start","value":"flex-start"},{"label":"End","value":"flex-end"},{"label":"Center","value":"center"},{"label":"Space Between","value":"space-between"},{"label":"Space Around","value":"space-around"},{"label":"Space Evenly","value":"space-evenly"}]` — omit on top-level (inherits Center); omit on nested unless intentional. Set `flex-start` on nested content columns. <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-flex` -> `justify-content: {{VALUE}};` |
| `alignItems` | Responsive-Option | **Top-level:** Center (base CSS when omitted). **Nested:** unset (omit) | Used when `display` = `"flex"`. Options: `[{"label":"Start","value":"flex-start"},{"label":"End","value":"flex-end"},{"label":"Center","value":"center"},{"label":"Stretch","value":"stretch"}]` — **no `baseline` option**. Omit on top-level; omit on nested unless intentional. Nested copy/form/card columns usually need `{"Desktop":{"label":"Start","value":"flex-start"}}` or `stretch`. <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-flex` -> `align-items: {{VALUE}};` |
| `columnGap` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}.blockish-container` -> `column-gap: {{VALUE}};` |
| `rowGap` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}.blockish-container` -> `row-gap: {{VALUE}};` |
| `gridLayoutType` | Scalar (string) | `"auto"` | `"auto"` (auto-fit columns — **default for card/icon grids; responsive without breakpoint math**) `"fixed"` (explicit count — use only when you need an exact column count, e.g. a strict 50/50 split) |
| `gridColumns` | Responsive | `{"Desktop":3,"Tablet":2,"Mobile":1}` | Used when `gridLayoutType` = `"fixed"` <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-grid.grid-layout-type-fixed` -> `grid-template-columns: repeat({{VALUE}}, minmax(0, 1fr));` |
| `gridRows` | Responsive | `{"Desktop":1}` | Used when `gridLayoutType` = `"fixed"` <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-grid.grid-layout-type-fixed` -> `grid-template-rows: repeat({{VALUE}}, minmax(0, 1fr));` |
| `autoGridWidth` | Responsive | `{"Desktop":"12rem"}` | Used when `gridLayoutType` = `"auto"`. Prefer this for pricing cards, feature cards, logo strips, roadmap tiles, etc. Pick a sensible min track width (e.g. `280px`–`340px`). <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-grid.grid-layout-type-auto` -> `grid-template-columns: repeat(auto-fill,minmax(min({{VALUE}},100%),1fr));` |
| `autoGridHeight` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}.blockish-container.layout-type-grid.grid-layout-type-auto` -> `grid-auto-rows: minmax({{VALUE}}, auto);` |
| `containerBackground` | Stringified-JSON (Background) | unset | Normal state. **Only this attribute supports `backgroundType:"video"`.** <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}}` |
| `containerHoverBackground` | Stringified-JSON (Background) | unset | Hover state <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}}:hover` |
| `containerBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Normal state <br>**CSS:** Uses `BlockishBackgroundOverlay` on `.{{WRAPPER}}.has-background-overlay::before` |
| `containerHoverBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Hover state <br>**CSS:** Uses `BlockishBackgroundOverlay` on `.{{WRAPPER}}.has-background-overlay::before:hover` |
| `containerBorder` | Stringified-JSON (Border) | unset | Normal state <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}}` |
| `containerHoverBorder` | Stringified-JSON (Border) | unset | Hover state <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}}:hover` |
| `containerBorderRadius` | Border-Radius | unset | Normal state <br>**CSS:** `.{{WRAPPER}}` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `containerHoverBorderRadius` | Border-Radius | unset | Hover state <br>**CSS:** `.{{WRAPPER}}:hover` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `containerBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal state <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}}` |
| `containerHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover state <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}}:hover` |
| `anchor` | Scalar (string) | unset | WP-core "HTML anchor" — sets the element's `id`. See §7.1. |
| `align` | Scalar (string) | unset | `"wide"` `"full"` — WP-core wide/full alignment. See §7.1. |

Minimal schema:
```json
{
  "name": "blockish/container",
  "attributes": {},
  "innerBlocks": []
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The `tagName` attribute determines the wrapper tag (div, section, header, etc.). Default is div. -->
<!-- 
Conditional Classes Breakdown:
- `blockish-container`, `bb-[hash]`, `blockish-block-wrapper`: Always present.
- `has-background-video`: Added if `containerBackground` uses `backgroundType: "video"`.
- `has-background-overlay`: Added if `containerBackgroundOverlay` is configured.
- `layout-type-flex`: Added if `display` attribute is `"flex"` (default).
- `layout-type-grid`: Added if `display` attribute is `"grid"`.
- `grid-layout-type-auto` / `grid-layout-type-fixed`: Added if `display` is `"grid"`, based on `gridLayoutType`.
- `alignfull` / `alignwide` / `align-custom-width`: Added based on `containerWidth` attribute.
-->
<div class="blockish-container bb-[hash] blockish-block-wrapper has-background-video has-background-overlay layout-type-flex grid-layout-type-auto alignfull">
  
  <!-- Rendered ONLY if `containerBackground` has `backgroundType:"video"` AND a video URL is provided -->
  <video class="blockish-container-background-video" src="..." autoplay muted loop playsinline aria-hidden="true"></video>
  
  <!-- Inner blocks are rendered directly here -->
  ...
  
</div>
```

**Base CSS (`style.scss`):**
```scss
:where(.wp-block-blockish-container) {
    position: relative;
}

.wp-block-blockish-container {
    transition: all 0.3s ease;

    &.has-background-video {
        position: relative;
        overflow: hidden;

        > :not(.blockish-container-background-video) {
            position: relative;
            z-index: 1;
        }
    }

    &.has-background-overlay {
        &::before {
            content: '';
            position: absolute;
            inset: 0;
            z-index: 0;
        }
    }

    .blockish-container-background-video {
        position: absolute;
        inset: 0;
        z-index: -1;
        width: 100%;
        height: 100%;
        object-fit: cover;
        pointer-events: none;
    }

    // Top-level custom-width: center in the canvas / content area.
    &.align-custom-width {
        margin-left: auto;
        margin-right: auto;
    }

    // Nested custom-width: unset auto margins (low specificity) so block margin attributes can win.
    // Keep customWidthContainer at 100% unless a narrower inner max-width is intentional.
    :where(.wp-block-blockish-container .wp-block-blockish-container.align-custom-width) {
        margin-left: unset;
        margin-right: unset;
    }
}

// Top-level flex: Center. Nested flex: no align/justify default (attribute CSS wins via higher specificity).
:where(.wp-block-blockish-container.blockish-container.layout-type-flex) {
    justify-content: center;
    align-items: center;
}

:where(.wp-block-blockish-container .wp-block-blockish-container.blockish-container.layout-type-flex) {
    justify-content: initial;
    align-items: initial;
}
```

