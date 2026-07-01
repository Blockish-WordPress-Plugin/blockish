### `blockish/heading`

A heading element with full text styling. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `content` | Scalar (string, HTML allowed) | `"Heading Text"` | |
| `tag` | Option | `{"label":"H2","value":"h2"}` | `H1`/`h1` · `H2`/`h2` · `H3`/`h3` · `H4`/`h4` · `H5`/`h5` · `H6`/`h6` · `P`/`p` · `Span`/`span` · `Div`/`div` — only these 9, no `section`/`article`/`main`/etc. (those belong to `blockish/container`'s `tagName`, a different attribute) |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | Normal |
| `hoverColor` | Color | unset | Hover |
| `textShadow` | Stringified-JSON (Box Shadow) | unset | Normal |
| `textShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover |

Minimal schema:
```json
{
  "name": "blockish/heading",
  "attributes": { "content": "Build Faster", "tag": { "label": "H1", "value": "h1" } }
}
```

---

