### `blockish/icon`

A single standalone SVG icon. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `icon` | Icon | Default 5-point star (`viewBox` + `path`). Prefer `get-icons`. |
| `link` | Link | When set with `href`, root becomes `<a>`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes — default star icon, no link):

```html
<div class="wp-block-blockish-icon blockish-icon">
  <svg class="blockish-icon" width="24" height="24" viewBox="0 0 576 512" xmlns="http://www.w3.org/2000/svg" focusable="false" aria-hidden="true" fill="currentColor">
    <path d="…"></path>
  </svg>
</div>
```

| When | What changes |
|---|---|
| `link` with URL | Root element is `<a class="… blockish-icon" href="…" …>` instead of `<div>`. |
| Custom `icon` | SVG `viewBox` / `path` (or custom SVG markup when `viewBox` is `"custom"`). |

Style with convert-css against `.blockish-icon` / `.blockish-icon svg` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-icon) { text-align: center; }
.blockish-icon { line-height: 1; }
.blockish-icon svg { pointer-events: all !important; transition: all .2s ease-in-out; }
a.blockish-icon { display: block; text-decoration: none; }
```

#### Minimal schema

```json
{
  "name": "blockish/icon",
  "attributes": {}
}
```
