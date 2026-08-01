### `blockish/post-title`

Current post title (query loop / single). **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"H2","value":"h2"}`. Allowed: `h1`–`h6`, `p`, `div`. |
| `linkToPost` | Scalar (boolean) | Default `false`. Wrap title in permalink. |
| `openInNewTab` | Scalar (boolean) | Default `false`. Only when `linkToPost`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (`tag` h2, no link):

```html
<h2 class="wp-block-blockish-post-title blockish-post-title">Post Title</h2>
```

| When | What changes |
|---|---|
| `tag.value` | Root element tag (`h1`–`h6`, `p`, `div`). |
| `linkToPost: true` | Inner `<a href="{permalink}">…</a>`. |
| `openInNewTab: true` | Link gets `target="_blank" rel="noopener noreferrer"`. |
| No post / empty title | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-post-title) { margin: 0; text-align: left; }
:where(.blockish-post-title) a { color: inherit; text-decoration: inherit; }
```

#### Minimal schema

```json
{
  "name": "blockish/post-title",
  "attributes": {
    "tag": {
      "label": "H3",
      "value": "h3"
    },
    "linkToPost": true
  }
}
```
