### `blockish/query-total`

Total result count (or displayed range) for the current main query or parent Query Builder. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `displayType` | Option | Default `{"label":"Total results","value":"total-results"}`. `"total-results"` \| `"range-display"`. |
| `totalFormat` | Scalar (string) | Default `"{count} results found"`. Placeholder `{count}`. |
| `totalFormatSingular` | Scalar (string) | Default `"{count} result found"`. |
| `rangeFormat` | Scalar (string) | Default `"Displaying {start} – {end} of {total}"`. Placeholders `{start}` `{end}` `{total}`. |
| `rangeFormatSingle` | Scalar (string) | Default `"Displaying {start} of {total}"`. When start === end. |
| `tag` | Option | Default `{"label":"P","value":"p"}`. Allowed: `h1`–`h6`, `p`, `div`, `span`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (`total-results`):

```html
<p class="wp-block-blockish-query-total blockish-query-total">12 results found</p>
```

| When | What changes |
|---|---|
| `displayType.value: "range-display"` | Uses `rangeFormat` / `rangeFormatSingle` with start/end/total. |
| `tag.value` | Root element tag. |
| Inside Query Builder | Uses `blockish-dynamicity/loopContext` query; otherwise main `$wp_query`. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-query-total) { text-align: left; }

/* Stylesheet */
.blockish-query-total { margin: 0; }
```

#### Minimal schema

```json
{
  "name": "blockish/query-total",
  "attributes": {
    "totalFormat": "{count} posts"
  }
}
```
