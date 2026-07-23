### `blockish/query-title`

Archive / search / post-type title for the current query. **Accepts children: no.** Use on archive, search, and blog templates.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `type` | Option | `{"label":"Archive","value":"archive"}` | `"archive"` \| `"search"` (and related query title modes offered in the UI) |
| `showPrefix` | Scalar (boolean) | `true` | e.g. “Category:” |
| `showSearchTerm` | Scalar (boolean) | `true` | For search titles |
| `tag` | Option | `{"label":"H1","value":"h1"}` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `hoverColor` | Color | unset | |
| `textShadow` | Stringified-JSON (Text Shadow) | unset | |
| `textShadowHover` | Stringified-JSON (Text Shadow) | unset | |

```json
{ "name": "blockish/query-title", "attributes": { "type": { "label": "Archive", "value": "archive" }, "tag": { "label": "H1", "value": "h1" } } }
```
