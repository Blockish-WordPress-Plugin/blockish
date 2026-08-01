### `blockish/heading`

Heading / text element. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `content` | Scalar (HTML ok) | Required — no block.json default. |
| `tag` | Option | Default `{"label":"H2","value":"h2"}`. Only `h1`–`h6`, `p`, `span`, `div`. For section semantics use container `tagName`, not a fake heading. |
| `url` | Link | Optional wrap. Shape: `{"url":"/path","newTab":false,"noFollow":false}`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes — `tag` defaults to `h2`):

```html
<h2 class="wp-block-blockish-heading blockish-heading"></h2>
```

| When | What changes |
|---|---|
| `tag.value` | Root element is that tag. |
| `url.url` set | Content wrapped in inner `<a …>` inside the tag. |
| `content` set | Text/HTML inside the tag (or inside the `<a>`). |

Style with convert-css:
- text → `{{ROOT}} { font-size: …; color: …; text-align: …; }`
- linked text inherits color/size from Already-there (`a { color: inherit … }`) — style the root, not a nested invented selector.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-heading) { margin: 0; padding: 0; text-align: left; }
:where(.blockish-heading) a { color: inherit !important; font-size: inherit !important; font-weight: inherit; text-decoration: inherit !important; }
```

#### Minimal schema

```json
{
  "name": "blockish/heading",
  "attributes": {
    "content": "Build Faster",
    "tag": {
      "label": "H1",
      "value": "h1"
    }
  }
}
```
