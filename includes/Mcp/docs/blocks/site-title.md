### `blockish/site-title`

Site title from Settings → General. **Accepts children: no.** Prefer this over a hardcoded heading in headers.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `tag` | Option | typically `h1`/`p` | Semantic tag |
| `linkToHome` | Scalar (boolean) | `true` | |
| `openInNewTab` | Scalar (boolean) | `false` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `hoverColor` | Color | unset | |
| `textShadow` | Stringified-JSON (Text Shadow) | unset | |
| `textShadowHover` | Stringified-JSON (Text Shadow) | unset | |

```json
{ "name": "blockish/site-title", "attributes": { "linkToHome": true } }
```
