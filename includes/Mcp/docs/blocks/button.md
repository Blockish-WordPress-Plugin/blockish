### `blockish/button`

Call-to-action link. **Accepts children: no.**

> [!WARNING]
> **Hard rule — placement:** Center/right-align with `{{ROOT}} { justify-content: center; }` → `buttonPlacement`. Parent container alignment does **not** move the visible button.

> [!WARNING]
> **Hard rule — no double chrome:** Visible button chrome maps to `button*` attrs (`.blockish-button-link`). Do **not** also put border/background on the wrapper or Class Manager for the same chrome — double border/background.

> [!WARNING]
> **Wrapper is full width** (`width: 100%` in Already-there). To shrink/position the wrapper: `{{ROOT}} { width: auto; }`. No `anchor` / `align` support.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `text` | Scalar | Default `"Click Here"`. |
| `url` | Link | Optional. Shape: `{"url":"/signup","newTab":false,"noFollow":false}`. |
| `icon` | Icon | Prefer `blockish/get-icons`. When set, renders `<svg class="blockish-icon blockish-button-icon">`. |
| `iconPosition` | Scalar | `"row"` (stylesheet default = icon after text) \| `"row-reverse"` (icon before). Also produced by convert-css `flex-direction` on `.blockish-button-link`. |

#### Markup

Default (empty attributes — text default still applies; no icon):

```html
<div class="wp-block-blockish-button blockish-button">
  <a class="blockish-button-link">
    <span>Click Here</span>
  </a>
</div>
```

| When | What changes |
|---|---|
| `url` set | Link props on `.blockish-button-link`. |
| `icon` set | Child `<svg class="blockish-icon blockish-button-icon">` inside the `<a>` (after the text span). |
| `iconPosition: "row-reverse"` / convert `flex-direction: row-reverse` | CSS on `.blockish-button-link` — not a class. |

Style with convert-css:
- placement → `{{ROOT}} { justify-content: center; }` (and `width: auto` if the wrapper must shrink)
- visible chrome → `{{ROOT}} .blockish-button-link { background: …; color: …; padding: …; border-radius: …; }`
- hover chrome → `{{ROOT}} .blockish-button-link:hover { … }`
- icon size → `{{ROOT}} .blockish-button-icon { width: …; height: …; }`
- icon side → `{{ROOT}} .blockish-button-link { flex-direction: row-reverse; }`
Do not invent markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-button { align-items: center; display: flex; width: 100%; }
:where(.blockish-button .blockish-button-link) { flex-direction: row; }
.blockish-button .blockish-button-link { align-items: center; background-color: #000; box-sizing: border-box; color: #fff; cursor: pointer; display: inline-flex; gap: 6px; justify-content: center; padding: 10px 20px; text-decoration: none; transition: all .3s ease; }
.blockish-button .blockish-button-link > span { white-space: nowrap; }
.blockish-button .blockish-button-icon { height: 1em; width: 1em; }
```

#### Minimal schema

```json
{
  "name": "blockish/button",
  "attributes": {
    "text": "Get Started Free",
    "url": {
      "url": "/signup",
      "newTab": false
    }
  }
}
```
