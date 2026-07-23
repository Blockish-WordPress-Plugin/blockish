### `blockish/site-logo`

Custom logo from Customizer / Site Editor. **Accepts children: no.** Prefer over `blockish/image` for brand logos in headers.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `linkToHome` | Scalar (boolean) | `true` | |
| `openInNewTab` | Scalar (boolean) | `false` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | |
| `logoWidth` | Responsive | `{"Desktop":"120px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-site-logo__image` -> `width: {{VALUE}};` |
| `logoMaxWidth` | Responsive | unset | |
| `border` | Stringified-JSON (Border) | unset | On the logo image |
| `borderRadius` | Border-Radius | unset | |
| `boxShadow` | Stringified-JSON (Box Shadow) | unset | |

```json
{ "name": "blockish/site-logo", "attributes": { "logoWidth": { "Desktop": "140px" }, "linkToHome": true } }
```
