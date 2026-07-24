### `blockish/carousel`

InnerBlocks carousel for **hero**, **testimonials**, or **logo strips**. **Accepts children: yes** — only `blockish/carousel-slide`.

**Hard rules:**
- Do **not** nest `blockish/container` inside slides — background/layout live on the slide.
- Loop uses cloned slides on the frontend (and editor) so wrap-around does not rewind.

| Attribute | Type | Default | Notes |
|---|---|---|---|
| `slidesPerView` / `slidesPerViewTablet` / `slidesPerViewMobile` | number | `1` | Visible slides per breakpoint |
| `gap` | number (px) | `16` | Space between slides (also drives JS transform) |
| `showArrows` / `showDots` | boolean | `true` | |
| `loop` | boolean | `true` | Seamless wrap via clones |
| `autoplay` / `pauseOnHover` | boolean | `false` / `true` | |
| `autoplaySpeed` | number (ms) | `4000` | |
| `transitionSpeed` | number (ms) | `450` | Track transform duration (`--bc-transition`) |
| `arrowsPosition` | string | `"inside"` | `"inside"` \| `"outside"` \| `"overlay"` |
| `dotsPosition` | string | `"below"` | `"below"` \| `"overlay"` |
| `dotsAlign` | string | `"center"` | `"flex-start"` \| `"center"` \| `"flex-end"` |
| `slideMinHeight` / `slideBorderRadius` / `trackPadding` | Responsive | unset | Track & slide chrome |
| Arrow style | various | unset | `arrowSize`, `arrowIconSize`, `arrowOffset`, `arrowColor`, `arrowBackground`, `arrowBorder`, `arrowBorderRadius`, `arrowBoxShadow`, `arrowColorHover`, `arrowBackgroundHover` |
| Dot style | various | unset | `dotSize`, `dotActiveSize`, `dotGap`, `dotsOffset`, `dotColor`, `dotActiveColor`, `dotBorderRadius` |

**Hero pattern:** one `carousel-slide` → `slideBackground` (+ overlay) → Heading + Button inside the slide.

Minimal parent + slides:
```json
{
  "name": "blockish/carousel",
  "attributes": {
    "slidesPerView": 1,
    "showArrows": true,
    "showDots": true,
    "loop": true,
    "arrowsPosition": "inside",
    "transitionSpeed": 450
  },
  "innerBlocks": [
    {
      "name": "blockish/carousel-slide",
      "attributes": {
        "minHeight": { "Desktop": "420px" },
        "slideBackground": "{\"backgroundType\":\"gradient\",\"gradient\":\"linear-gradient(135deg,#0f172a,#1e3a8a)\"}",
        "slideBackgroundOverlay": "{\"enabled\":true,\"type\":\"color\",\"color\":\"rgba(0,0,0,0.35)\",\"opacity\":100}",
        "justifyContent": { "Desktop": { "label": "Center", "value": "center" } },
        "alignItems": { "Desktop": { "label": "Center", "value": "center" } },
        "padding": {
          "Desktop": { "top": "48px", "right": "40px", "bottom": "48px", "left": "40px" }
        }
      },
      "innerBlocks": [
        {
          "name": "blockish/heading",
          "attributes": {
            "content": "Build faster",
            "tag": { "label": "H2", "value": "h2" },
            "color": "#f8fafc",
            "alignment": { "Desktop": "center" }
          }
        },
        {
          "name": "blockish/button",
          "attributes": {
            "text": "Get started",
            "url": { "url": "/signup", "newTab": false },
            "buttonPlacement": { "Desktop": { "label": "Center", "value": "center" } }
          }
        }
      ]
    }
  ]
}
```
