### `blockish/paragraph`

Rich text paragraph. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `content` | Scalar (HTML ok) | Required — no block.json default. |
| `url` | Link | Optional wrap. Shape: `{"url":"/path","newTab":false,"noFollow":false}`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes):

```html
<p class="wp-block-blockish-paragraph blockish-paragraph"></p>
```

| When | What changes |
|---|---|
| `url.url` set | Content wrapped in inner `<a …>` inside the `<p>`. |
| `content` set | Text/HTML inside the `<p>` (or inside the `<a>`). |

Style with convert-css:
- text → `{{ROOT}} { font-size: …; color: …; text-align: …; max-width: …; }`
- linked text inherits from Already-there — style the root.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-paragraph { margin: 0; padding: 0; }
:where(.blockish-paragraph) { text-align: left; }
.blockish-paragraph a { color: inherit !important; font-size: inherit !important; font-weight: inherit; text-decoration: inherit !important; }
```

#### Minimal schema

```json
{
  "name": "blockish/paragraph",
  "attributes": {
    "content": "Ship beautiful WordPress sites with AI."
  }
}
```
