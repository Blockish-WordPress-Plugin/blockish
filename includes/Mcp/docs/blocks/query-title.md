### `blockish/query-title`

Archive / search / post-type title for the current query. **Accepts children: no.** Use on archive, search, and blog templates.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `type` | Option | Default `{"label":"Archive","value":"archive"}`. `"archive"` \| `"search"` \| `"post-type"`. |
| `showPrefix` | Scalar (boolean) | Default `true`. e.g. “Category:” / “Post Type:”. |
| `showSearchTerm` | Scalar (boolean) | Default `true`. Only for `type: search`. |
| `tag` | Option | Default `{"label":"H1","value":"h1"}`. Allowed: `h1`–`h6`, `p`, `div`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (archive + prefix, on an archive):

```html
<h1 class="wp-block-blockish-query-title blockish-query-title">Category: News</h1>
```

| When | What changes |
|---|---|
| `type.value: "search"` | Title is “Search results” or “Search results for: “…“” when `showSearchTerm`. |
| `type.value: "post-type"` | Post type singular name; with prefix → `Post Type: “Name”`. |
| `showPrefix: false` | Archive/post-type title without WP prefix label. |
| `tag.value` | Root element tag. |
| Wrong context for `type` | Renders nothing (e.g. archive type off-archive). |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-query-title) { text-align: left; }

/* Stylesheet */
.blockish-query-title { margin: 0; }
```

#### Minimal schema

```json
{
  "name": "blockish/query-title",
  "attributes": {
    "type": {
      "label": "Archive",
      "value": "archive"
    },
    "tag": {
      "label": "H1",
      "value": "h1"
    }
  }
}
```
