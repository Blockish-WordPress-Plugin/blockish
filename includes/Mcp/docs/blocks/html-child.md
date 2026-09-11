### `blockish/html-child`

Dynamic custom HTML element (leaf / inline / self-closing). **Accepts children: no.**

> **Last resort only.** Use this block only when **no block fulfills the requirement** (custom tag, props, or semantics nothing else covers). Prefer dedicated blocks: `blockish/heading` for h1–h6, `blockish/paragraph` for text, `blockish/image` for images, `blockish/button` for buttons.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"span","value":"span"}`. Dropdown offers inline elements (`span`, `a`, `label`, `code`, `small`, `strong`, `em`, `button`), block/heading elements (`p`, `pre`, `blockquote`, `h1`–`h6`), and form/void elements (`textarea`, `select`, `input`, `img`); `hr`/`br` and other tags are reachable via Custom… . Any custom tag `[a-z0-9-]` is accepted unless blocked (see Sanitization). |
| `props` | Array | Default `[]`. Key-value attribute array: `[{"key": "class", "value": "badge"}, {"key": "data-status", "value": "active"}]`. Rendered directly as HTML attributes on the element. |
| `content` | Scalar (HTML ok) | Text content inside non-void elements. Omitted/ignored for void self-closing tags (`img`, `input`, `hr`, `br`). |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Sanitization (enforced at render)

- Blocked tags are rejected and fall back to the default (`span`): `script`, `style`, `iframe`, `frame`, `frameset`, `object`, `embed`, `applet`, `base`, `meta`, `link`, `template`, `noscript`, `svg`, `math`, `html`, `head`, `body`, `title`.
- Props keys starting with `on` (event handlers such as `onclick`, `onerror`) and `dangerouslySetInnerHTML` are dropped.
- URL-bearing props (`href`, `src`, `srcset`, `action`, `formaction`, `xlink:href`, `poster`, `background`, `cite`, `ping`, `usemap`, `data`) accept only `http(s)`, `ftp(s)`, `mailto:`, `tel:`, `sms:`, `data:image/…` raster types (no SVG), or relative/fragment URLs. `javascript:`, `vbscript:`, `file:` and other schemes are dropped.

Do not stage blocked tags, event-handler props, or dangerous URL schemes — they are silently dropped/fall back at render.

#### Markup

Default (empty attributes — `tag` defaults to `span`):

```html
<span class="wp-block-blockish-html-child blockish-html-child blockish-html-child--span"></span>
```

| When | What changes |
|---|---|
| `tag.value: "p"` + `content` | Renders `<p class="… blockish-html-child--p">Content</p>`. |
| `tag` is a void element (e.g. `img`) | Self-closing `<img class="… blockish-html-child--img" … />` (no closing tag or inner content). |
| `align: "wide"` \| `"full"` | Root class `alignwide` or `alignfull`. |
| `props` contains `key`/`value` | Attributes rendered onto tag (e.g. `src="…"`, `alt="…"`, `data-*="…"`). |
| `class` or `className` in `props` | Additional CSS class names merged into element. |
| `style` in `props` | Inline styles applied to the element. |

Style with convert-css or Class Manager:
- Element styles → `{{ROOT}} { font-size: 14px; font-weight: 500; color: #4F46E5; … }`

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-html-child { box-sizing: border-box; }
```

#### Minimal schema

Non-void element (e.g. Badge):

```json
{
  "name": "blockish/html-child",
  "attributes": {
    "tag": {
      "label": "span",
      "value": "span"
    },
    "content": "New Feature",
    "props": [
      {
        "key": "data-badge",
        "value": "highlight"
      }
    ]
  }
}
```

Void element (e.g. Image):

```json
{
  "name": "blockish/html-child",
  "attributes": {
    "tag": {
      "label": "img",
      "value": "img"
    },
    "props": [
      {
        "key": "src",
        "value": "https://example.com/photo.jpg"
      },
      {
        "key": "alt",
        "value": "Example photo"
      }
    ]
  }
}
```
