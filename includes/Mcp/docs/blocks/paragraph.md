### `blockish/paragraph`

A standard paragraph block for rich text. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `content` | Scalar (string, HTML allowed) | `""` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | Normal |
| `hoverColor` | Color | unset | Hover |
| `textShadow` | Stringified-JSON (Box Shadow) | unset | Normal |
| `textShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover |

Minimal schema:
```json
{
  "name": "blockish/paragraph",
  "attributes": { "content": "This is a paragraph." }
}
```

---
