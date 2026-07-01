### `blockish/image`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `image` | Image | unset | |
| `alt` | Scalar (string) | unset | |
| `imageSize` | Option | `{"value":"full","label":"Full Size"}` | `Thumbnail`/`thumbnail` · `Medium`/`medium` · `Large`/`large` · `Full Size`/`full` |
| `captionType` | Scalar (string) | `"none"` | `"none"` `"attachment"` (WP media caption) `"custom"` (use `customCaption`) |
| `customCaption` | Scalar (string) | unset | Used when `captionType` = `"custom"` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `imageWidth` | Responsive | unset | |
| `imageMaxWidth` | Responsive | unset | |
| `imageHeight` | Responsive | unset | |
| `objectFit` | Responsive-Option | unset | `None`/`none` · `Fill`/`fill` · `Cover`/`cover` · `Contain`/`contain` — only these 4, no `scale-down`. Only meaningful when `imageHeight` is also set for that device (object-fit needs a constrained box to fit into) |
| `imageBorderRadiusNormal` | Border-Radius | unset | |
| `imageBorderNormal` | Stringified-JSON (Border) | unset | |
| `imageBoxShadowNormal` | Stringified-JSON (Box Shadow) | unset | |
| `imageCSSFiltersNormal` | Stringified-JSON (CSS Filters) | unset | Normal |
| `imageCSSFiltersHover` | Stringified-JSON (CSS Filters) | unset | Hover |
| `imageOpacityNormal` | Scalar (number, 0–1) | unset | |
| `imageOpacityHover` | Scalar (number, 0–1) | unset | |
| `imageHoverTransition` | Scalar (number, seconds) | unset | |

Minimal schema:
```json
{
  "name": "blockish/image",
  "attributes": { "image": { "id": 123, "url": "https://example.com/photo.jpg", "width": 1200, "height": 800 }, "alt": "Team photo" }
}
```

---

