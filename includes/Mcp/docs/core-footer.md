## 8. Composite examples

### Hero section (nested container + heading + button)

```json
{
  "name": "blockish/container",
  "attributes": {
    "isVariationPicked": true,
    "flexDirection": { "Desktop": { "label": "Column", "value": "column" } },
    "containerMinHeight": { "Desktop": "100vh" },
    "containerBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#0f172a\"}",
    "padding": { "top": "80px", "right": "40px", "bottom": "80px", "left": "40px" }
  },
  "innerBlocks": [
    {
      "name": "blockish/heading",
      "attributes": { "content": "Welcome", "tag": { "label": "H1", "value": "h1" }, "color": "#ffffff" }
    },
    {
      "name": "blockish/button",
      "attributes": {
        "text": "Get Started Free",
        "url": { "url": "/signup", "newTab": false },
        "buttonPlacement": { "Desktop": { "value": "center" } },
        "buttonBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#1a73e8\"}",
        "buttonTextColor": "#ffffff",
        "buttonPadding": { "top": "14px", "right": "28px", "bottom": "14px", "left": "28px" },
        "buttonBorderRadius": { "Desktop": { "topLeft": "6px", "topRight": "6px", "bottomRight": "6px", "bottomLeft": "6px" } }
      }
    }
  ]
}
```

`buttonPlacement` is set here even though the container's `alignItems` is already Center — that container setting only affects how the button's wrapper *box* is sized in the column, not where the visible button sits inside it (the wrapper is hard-width: 100% regardless). Without `buttonPlacement: {"Desktop":{"value":"center"}}`, this button would render flush-left despite the "centered" hero layout.

Note what's omitted because it already matches the container's defaults: `display` (defaults `"flex"`), `alignItems`/`justifyContent` (both default Center), `containerWidth` (defaults `"alignfull"`). Only `isVariationPicked` (required override), `flexDirection`, `containerMinHeight`, `containerBackground`, and `padding` actually differ from default.

### Stats row (grid container with three counters)

```json
{
  "name": "blockish/container",
  "attributes": {
    "isVariationPicked": true,
    "display": "grid",
    "gridLayoutType": "fixed",
    "gridColumns": { "Desktop": 3, "Tablet": 2, "Mobile": 1 },
    "columnGap": { "Desktop": "32px" }
  },
  "innerBlocks": [
    { "name": "blockish/counter", "attributes": { "endNumber": 500, "numberSuffix": "+", "title": "Happy Clients" } },
    { "name": "blockish/counter", "attributes": { "endNumber": 99, "numberSuffix": "%", "title": "Uptime" } },
    { "name": "blockish/counter", "attributes": { "endNumber": 24, "numberSuffix": "/7", "title": "Support" } }
  ]
}
```

`display: "grid"` is included because it differs from the container default (`"flex"`). `gridLayoutType: "fixed"` must be set explicitly — its own default is `"auto"`, and `gridColumns`/`gridRows` only take effect when `gridLayoutType` = `"fixed"`; setting `gridColumns` alone (as an earlier version of this example did) silently has no effect.

### FAQ accordion

```json
{
  "name": "blockish/accordion",
  "attributes": { "faqSchema": true },
  "innerBlocks": [
    {
      "name": "blockish/accordion-item",
      "attributes": { "title": "What is Blockish?", "defaultOpen": true },
      "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Blockish is a Gutenberg block plugin." } } ]
    },
    {
      "name": "blockish/accordion-item",
      "attributes": { "title": "Is it free?" },
      "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Yes, the core plugin is free." } } ]
    }
  ]
}
```

### Site header (logo container + navigation menu)

A header is a `blockish/container` (row, space-between) holding a logo on the left and the navigation on the right. The `offcanvas` is left empty so it mirrors the desktop menu for mobile automatically.

```json
{
  "name": "blockish/container",
  "attributes": {
    "isVariationPicked": true,
    "tagName": { "label": "Header", "value": "header" },
    "justifyContent": { "Desktop": { "label": "Space Between", "value": "space-between" } },
    "alignItems": { "Desktop": { "label": "Center", "value": "center" } },
    "padding": { "top": "16px", "right": "40px", "bottom": "16px", "left": "40px" }
  },
  "innerBlocks": [
    { "name": "blockish/image", "attributes": { "image": { "id": 0, "url": "https://example.com/logo.png" }, "alt": "Logo", "imageWidth": { "Desktop": "140px" } } },
    {
      "name": "blockish/navigation",
      "attributes": { "hasStarted": true, "menuBreakpoint": "tablet" },
      "innerBlocks": [
        {
          "name": "blockish/navmenu",
          "attributes": { "navGap": { "Desktop": "28px" } },
          "innerBlocks": [
            { "name": "blockish/navmenu-item", "attributes": { "label": "Home", "url": "/" } },
            { "name": "blockish/navmenu-item", "attributes": { "label": "Features", "url": "/features" } },
            { "name": "blockish/navmenu-item", "attributes": { "label": "Pricing", "url": "/pricing" } },
            { "name": "blockish/navmenu-item", "attributes": { "label": "Contact", "url": "/contact" } }
          ]
        },
        { "name": "blockish/offcanvas", "attributes": { "offcanvasSide": "right" }, "innerBlocks": [] }
      ]
    }
  ]
}
```

---

