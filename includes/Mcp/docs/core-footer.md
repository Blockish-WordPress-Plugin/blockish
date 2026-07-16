## 8. Composite examples

### Hero section (nested container + heading + button)

```json
{
  "name": "blockish/container",
  "attributes": {
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
        "buttonPlacement": { "Desktop": { "label": "Center", "value": "center" } },
        "buttonBackground": "{\"backgroundType\":\"classic\",\"backgroundColor\":\"#1a73e8\"}",
        "buttonTextColor": "#ffffff",
        "buttonPadding": { "top": "14px", "right": "28px", "bottom": "14px", "left": "28px" },
        "buttonBorderRadius": { "Desktop": { "topLeft": "6px", "topRight": "6px", "bottomRight": "6px", "bottomLeft": "6px" } }
      }
    }
  ]
}
```

`buttonPlacement` is set here even though the container's `alignItems` is already Center — that container setting only affects how the button's wrapper *box* is sized in the column, not where the visible button sits inside it (the wrapper is hard-width: 100% regardless). Without `buttonPlacement: {"Desktop":{"label":"Center","value":"center"}}`, this button would render flush-left despite the "centered" hero layout.

Note what's omitted because it already matches the container's defaults: `display` (defaults `"flex"`), `alignItems`/`justifyContent` (both default Center), `containerWidth` (defaults `"alignfull"`). Only `flexDirection`, `containerMinHeight`, `containerBackground`, and `padding` actually differ from default.

### Stats row (grid container with three counters)

```json
{
  "name": "blockish/container",
  "attributes": {
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

### Site header / Template parts

**CRITICAL RULE FOR HEADERS & FOOTERS:**
1. **When adding a header/footer to a page layout:** Do NOT build a custom `blockish/container` with `"tagName": {"value": "header"}`. Headers and footers are global. You MUST use the WordPress native `core/template-part` block so it remains reusable.
```json
{
  "name": "core/template-part",
  "attributes": {
    "slug": "header",
    "theme": "twentytwentyfive" 
  }
}
```
*(Use `"slug": "footer"` for footers).*

2. **When DESIGNING a header/footer template part itself:** If you are asked to design the actual header layout (e.g. logo + navigation), you will use `blockish/container`, but **DO NOT set `"tagName": {"label": "Header", "value": "header"}`**. WordPress already wraps the entire template part in a `<header>` tag natively on the frontend. If you set `tagName` to `header` on your container, it will render double `<header>` tags. Leave it as the default `div`.

Example of designing the inside of a header template part (logo + navigation):

```json
{
  "name": "blockish/container",
  "attributes": {
    "justifyContent": { "Desktop": { "label": "Space Between", "value": "space-between" } },
    "alignItems": { "Desktop": { "label": "Center", "value": "center" } },
    "padding": { "top": "16px", "right": "40px", "bottom": "16px", "left": "40px" }
  },
  "innerBlocks": [
    { "name": "blockish/image", "attributes": { "image": { "id": 0, "url": "https://example.com/logo.png" }, "alt": "Logo", "imageWidth": { "Desktop": "140px" } } },
    {
      "name": "blockish/navigation",
      "attributes": { "menuBreakpoint": "tablet" },
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

## 8. Interactions Extension (interactionData)

All Blockish blocks accept the `interactionData` attribute. This allows you to add custom vanilla JavaScript interactions (animations, event listeners) to a specific block.

**Attribute Structure:**
```json
"interactionData": [
  {
    "id": "unique-id-123",
    "scope": "block",
    "event": "click",
    "selector": ".trigger-element", // Optional. Event delegation selector relative to this block
    "callbacks": [
      "console.log('Clicked!', event); blockElement.classList.toggle('active');" // Raw JS string. 'event' and 'blockElement' variables are exposed.
    ]
  }
]
```
Note: Do not use this for global interactions. For global interactions, use the `blockish/manage-global-interactions` ability instead.

**CRITICAL RULE FOR ANIMATIONS & INTERACTIONS (BOTH BLOCK-LEVEL & GLOBAL):**
Many Blockish blocks (like `blockish/button`) use an outer wrapper `<div>` and inner elements (like an `<a>` tag for the actual button with styles). By default, interactions are applied to the outermost wrapper `<div>`.
If a user complains about an animation looking weird (e.g., "the shadow is appearing behind the button when it scales", or they provide an image showing a styling issue during animation), **DO NOT guess the fix**. 
1. **INSPECT THE RAW MARKUP:** Use the `blockish/get-posts` MCP tool to fetch the post and look at the raw HTML structure inside the `content` property, OR ask the user for a screenshot of the raw markup.
2. **USE THE `selector` PROPERTY:** Once you see the HTML structure (e.g., `<div class="wp-block-blockish-button ..."><a class="blockish-button-link">`), add the correct `selector` (e.g., `"selector": ".blockish-button-link"`) to your `interactionData` schema (or global interaction schema) so that the animation applies exactly to the inner target element instead of the outer wrapper. (When `selector` is used, the `blockElement` variable in the callback automatically refers to the matched inner element).
3. **COMBINE WITH CLASS MANAGER:** To ensure animations or interactions reliably target a specific block (especially when using Global Interactions or when you need to target a block from another block's event), always assign a unique CSS class to the target block using the **Class Manager** extension (or the block's `className` attribute). This guarantees you have a unique selector to query the element without affecting other blocks on the page.
