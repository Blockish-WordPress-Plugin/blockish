### `blockish/query-total`

Total result count (or displayed range) for the current main query. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `displayType` | Option | `{"label":"Total results","value":"total-results"}` | `"total-results"` \| range-style display (see UI) |
| `totalFormat` | Scalar (string) | `"{count} results found"` | Use `{count}` placeholder |
| `totalFormatSingular` | Scalar (string) | `"{count} result found"` | |
| `rangeFormat` | Scalar (string) | `"Displaying {start} – {end} of {total}"` | Placeholders: `{start}` `{end}` `{total}` |
| `rangeFormatSingle` | Scalar (string) | `"Displaying {start} of {total}"` | |
| `tag` | Option | `{"label":"P","value":"p"}` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `hoverColor` | Color | unset | |
| `textShadow` | Stringified-JSON (Text Shadow) | unset | |
| `textShadowHover` | Stringified-JSON (Text Shadow) | unset | |

```json
{ "name": "blockish/query-total", "attributes": { "totalFormat": "{count} posts" } }
```
