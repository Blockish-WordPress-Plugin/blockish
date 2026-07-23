### `blockish/post-content`

Current post content. **Accepts children: no.** Use inside single/post templates or loops that render the full post body.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `tag` | Option | typically `div` | Semantic wrapper tag |
| `alignment` | Responsive | `{"Desktop":"left"}` | <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `linkColor` | Color | unset | Links inside content |
| `linkHoverColor` | Color | unset | |

```json
{ "name": "blockish/post-content", "attributes": {} }
```
