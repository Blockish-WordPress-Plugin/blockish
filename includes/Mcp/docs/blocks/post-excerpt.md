### `blockish/post-excerpt`

Current post excerpt. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `excerptLength` | Scalar (number) | `55` | Word count |
| `moreText` | Scalar (string) | `""` | Read-more label; empty = no link |
| `showMoreOnNewLine` | Scalar (boolean) | `true` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `moreColor` | Color | unset | Read-more link |
| `moreHoverColor` | Color | unset | |

```json
{ "name": "blockish/post-excerpt", "attributes": { "excerptLength": 30, "moreText": "Read more" } }
```
