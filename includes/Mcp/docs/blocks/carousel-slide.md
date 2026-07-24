### `blockish/carousel-slide`

**Parent:** `blockish/carousel` only. **Accepts children: yes** — limited allow-list (no Container).

**Allowed children:** `blockish/heading`, `paragraph`, `button`, `image`, `icon`, `icon-list`, `rating`, `counter`, `social-icons`

**Hard rule:** Put hero backgrounds on the slide (`slideBackground` / `slideBackgroundOverlay`), not a nested Container.

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `slideBackground` | Stringified-JSON (Background) | unset | Color / image / gradient on the slide |
| `slideBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Dim overlay (`has-background-overlay::before`) |
| `minHeight` | Responsive | `{"Desktop":"280px"}` | |
| `padding` | Spacing (Responsive) | unset | Inner padding |
| `flexDirection` / `alignItems` / `justifyContent` | Responsive-Option | unset | Flex layout of slide content |
| `gap` | Responsive | unset | Between inner blocks |

```json
{
  "name": "blockish/carousel-slide",
  "attributes": {
    "minHeight": { "Desktop": "420px" },
    "slideBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#0f172a\"}",
    "justifyContent": { "Desktop": { "label": "Center", "value": "center" } },
    "padding": {
      "Desktop": { "top": "48px", "right": "40px", "bottom": "48px", "left": "40px" }
    }
  },
  "innerBlocks": [
    {
      "name": "blockish/heading",
      "attributes": {
        "content": "Slide title",
        "tag": { "label": "H2", "value": "h2" },
        "color": "#fff",
        "alignment": { "Desktop": "center" }
      }
    }
  ]
}
```
