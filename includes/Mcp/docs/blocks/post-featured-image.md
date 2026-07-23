### `blockish/post-featured-image`

Current post featured image. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `imageSize` | Option | typically `"full"` / Full Size | WP registered size slug |
| `linkToPost` | Scalar (boolean) | `false` | |
| `openInNewTab` | Scalar (boolean) | `false` | |
| `alignment` | Responsive | `{"Desktop":"center"}` | <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `imageWidth` | Responsive | unset | <br>**CSS:** image `width` |
| `imageMaxWidth` | Responsive | unset | |
| `imageHeight` | Responsive | unset | Pair with `objectFit` |
| `objectFit` | Responsive-Option | unset | `none` `fill` `cover` `contain` |
| `border` | Stringified-JSON (Border) | unset | On the `<img>` |
| `borderRadius` | Border-Radius | unset | |
| `boxShadow` | Stringified-JSON (Box Shadow) | unset | |

```json
{ "name": "blockish/post-featured-image", "attributes": { "linkToPost": true, "imageWidth": { "Desktop": "100%" } } }
```
