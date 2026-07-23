### `blockish/post-title`

Current post title (query loop / single). **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `tag` | Option | `{"label":"H2","value":"h2"}` | `h1`–`h6`, `p`, `span`, `div` |
| `linkToPost` | Scalar (boolean) | `true` | Wrap title in permalink |
| `openInNewTab` | Scalar (boolean) | `false` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | <br>**CSS:** `BlockishTypography` on `.{{WRAPPER}}` |
| `color` | Color | unset | <br>**CSS:** `.{{WRAPPER}}` -> `color: {{VALUE}};` |
| `hoverColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}}:hover` / link hover |
| `textShadow` | Stringified-JSON (Text Shadow) | unset | |
| `textShadowHover` | Stringified-JSON (Text Shadow) | unset | |

```json
{ "name": "blockish/post-title", "attributes": { "tag": { "label": "H3", "value": "h3" }, "linkToPost": true } }
```
