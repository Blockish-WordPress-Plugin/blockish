### `blockish/carousel`

InnerBlocks carousel for **hero**, **testimonials**, or **logo strips**. **Accepts children: yes** — only `blockish/carousel-slide`.

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `slidesPerView` / `Tablet` / `Mobile` | number | `1` | How many slides visible |
| `gap` | number (px) | `16` | Space between slides |
| `showArrows` / `showDots` / `loop` / `autoplay` / `pauseOnHover` | boolean | arrows/dots/loop true; autoplay false | |
| `autoplaySpeed` | number (ms) | `4000` | |
| `transitionSpeed` | number (ms) | `450` | Slide animation duration |
| `arrowsPosition` | string | `"inside"` | `"inside"` \| `"outside"` \| `"overlay"` |
| `dotsPosition` | string | `"below"` | `"below"` \| `"overlay"` |
| `dotsAlign` | string | `"center"` | `"flex-start"` \| `"center"` \| `"flex-end"` |
| `slideMinHeight` / `slideBorderRadius` / `trackPadding` | Responsive | unset | Track & slide chrome |
| Arrow: `arrowSize`, `arrowIconSize`, `arrowOffset`, `arrowColor`, `arrowBackground`, `arrowBorder`, `arrowBorderRadius`, `arrowBoxShadow`, hover colors | — | unset | Arrow styling |
| Dots: `dotSize`, `dotActiveSize`, `dotGap`, `dotsOffset`, `dotColor`, `dotActiveColor`, `dotBorderRadius` | — | unset | Dot navigation styling |

**Hero:** one `carousel-slide` → set slide `slideBackground` (image/gradient) + overlay, then Heading + Button inside the slide. **Do not nest Container.**

---

### `blockish/carousel-slide`

**Parent:** `blockish/carousel` only.

**Allowed children (hard limit — no Container):**  
`heading`, `paragraph`, `button`, `image`, `icon`, `icon-list`, `rating`, `counter`, `social-icons`

| Attribute | Type | Notes |
|---|---|---|
| `slideBackground` | Stringified-JSON (Background) | Color / image / gradient on the slide |
| `slideBackgroundOverlay` | Stringified-JSON (Background Overlay) | Dim overlay (`has-background-overlay::before`) |
| `minHeight` | Responsive | Default `280px` desktop |
| `padding` | Spacing (Responsive) | Inner padding |
| `flexDirection` / `alignItems` / `justifyContent` | Responsive-Option | Flex layout of slide content |
| `gap` | Responsive | Between inner blocks |

```json
{
  "name": "blockish/carousel-slide",
  "attributes": {
    "minHeight": { "Desktop": "420px" },
    "slideBackground": "{\"backgroundType\":\"gradient\",\"gradient\":\"linear-gradient(135deg,#0f172a,#1e3a8a)\"}",
    "slideBackgroundOverlay": "{\"enabled\":true,\"type\":\"color\",\"color\":\"rgba(0,0,0,0.35)\",\"opacity\":100}",
    "justifyContent": { "Desktop": { "label": "Center", "value": "center" } },
    "padding": { "Desktop": { "top": "48px", "right": "40px", "bottom": "48px", "left": "40px" } }
  },
  "innerBlocks": [
    { "name": "blockish/heading", "attributes": { "content": "Build faster", "tag": { "label": "H1", "value": "h1" }, "color": "#fff" } },
    { "name": "blockish/button", "attributes": { "text": "Get started", "url": { "url": "/signup", "newTab": false } } }
  ]
}
```
