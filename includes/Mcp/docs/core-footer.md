## 7.1 Shared WP supports: `anchor` and `align`

Most Blockish blocks opt into WordPress core supports:

| Attribute | Type | Notes |
|---|---|---|
| `anchor` | Scalar (string) | Sets the wrapper element's HTML `id` (HTML anchor / jump target). |
| `align` | Scalar (string) | `"wide"` or `"full"` when the block declares `supports.align`. |

**Exceptions (do not set these):** `blockish/button` (no `anchor` / `align`), `blockish/navmenu-item` (no `anchor`), and some child-only blocks. If a per-block table says "See §7.1", that block supports the attributes above unless it explicitly says otherwise.

---

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

Note what's omitted because it already matches the container's defaults: `display` (defaults `"flex"`), `alignItems`/`justifyContent` on a **top-level** container (base CSS Center — omit), `containerWidth` (defaults `"alignfull"`). Only `flexDirection`, `containerMinHeight`, `containerBackground`, and `padding` actually differ from default. Nested containers do **not** inherit Center — set `alignItems`/`justifyContent` explicitly when a nested stack must align.

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

**CRITICAL — pages vs templates:**

1. **`manage-post` for a page/post:** Do **NOT** put `core/template-part` (header/footer) in the page `block_schema` or `post_content`. On block themes the active page template already wraps content with header + footer. Adding them again causes **duplicate** headers/footers. Create patterns first with real IDs, then assemble: empty page → `post_content` pattern-ref comments only; not-empty page → `block_schema` pattern refs only (Accept). Example ref node: `{"name":"core/block","attributes":{"ref":123}}`.

2. **`manage-template` for a `wp_template` layout** (e.g. designing `page` / `single` / `home`): THEN you may include reusable header/footer parts:
```json
{
  "name": "core/template-part",
  "attributes": {
    "slug": "header",
    "theme": "twentytwentyfive"
  }
}
```
*(Use `"slug": "footer"` for footers.)* Do **not** invent a page-level `blockish/container` with `"tagName": {"value": "header"}` as a fake site header.

3. **When DESIGNING a header/footer template part itself:** If you are asked to design the actual header layout (e.g. logo + navigation), you will use `blockish/container`, but **DO NOT set `"tagName": {"label": "Header", "value": "header"}`**. WordPress already wraps the entire template part in a `<header>` tag natively on the frontend. If you set `tagName` to `header` on your container, it will render double `<header>` tags. Leave it as the default `div`.

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
    { "name": "blockish/site-logo", "attributes": { "logoWidth": { "Desktop": "140px" }, "linkToHome": true } },
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

## 9. Extensions: Visibility & Interactions

### Visibility (`hideOn`)

Documented in **§4 Global attributes → Visibility**. Set `"hideOn": { "Desktop": false, "Tablet": true, "Mobile": true }` on any block to hide it on selected devices. Prefer this over `customCss` display hacks.

### Interactions (`interactionData`)

All Blockish blocks accept `interactionData` (array). Prefer the **structured** shape below. Legacy `{ event, selector, callbacks }` still works and is treated as `action.type: "custom"`.

**Structured interaction object:**

```json
{
  "id": "ix_unique",
  "title": "Entrance fade",
  "scope": "block",
  "when": {
    "source": "dom",
    "event": "inView",
    "selector": "",
    "eventName": "",
    "phase": "start"
  },
  "action": {
    "type": "preset",
    "preset": "fadeUp",
    "presetOptions": { "duration": 600, "delay": 0, "once": true },
    "eventName": "",
    "phase": "start",
    "callbacks": [""]
  }
}
```

| Field | Values / notes |
|---|---|
| `when.source` | `"dom"` (page action) \| `"listen"` (signal from another block) |
| `when.event` (dom) | `"ready"` (page load / boot) \| `"click"` \| `"mouseenter"` \| `"focus"` \| `"inView"` (scroll into view) |
| `when.selector` | Optional CSS selector **relative to this block** (event delegation / animation target) |
| `when.eventName` / `when.phase` | Used when `source` is `"listen"` — named signal + `"start"` \| `"end"` \| `"any"` |
| `action.type` | `"preset"` \| `"emit"` \| `"custom"` |
| `action.preset` | `"fadeIn"` `"fadeUp"` `"fadeDown"` `"fadeLeft"` `"fadeRight"` `"zoomIn"` |
| `action.presetOptions` | `{ duration, delay, once }` — ms / boolean |
| `action.eventName` / `action.phase` | Used when `type` is `"emit"` — broadcast a named signal (`"start"` \| `"end"`) |
| `action.callbacks` | Array of JS strings when `type` is `"custom"`. Exposed vars: `event`, `blockElement` |

**Entrance animation (recommended for AI layouts):**
```json
"interactionData": [
  {
    "id": "ix_hero_in",
    "title": "Hero entrance",
    "scope": "block",
    "when": { "source": "dom", "event": "inView", "selector": "", "eventName": "", "phase": "start" },
    "action": {
      "type": "preset",
      "preset": "fadeUp",
      "presetOptions": { "duration": 700, "delay": 0, "once": true },
      "eventName": "",
      "phase": "start",
      "callbacks": [""]
    }
  }
]
```

**Emit / listen (cross-block signals):** one block `action.type: "emit"` with `action.eventName: "open-menu"`; another block `when.source: "listen"`, `when.eventName: "open-menu"`.

**Custom JS:** `action.type: "custom"` + `callbacks`. Do **not** rely on `DOMContentLoaded` inside callbacks — use `when.event: "ready"` for one-time setup.

**Page / global libraries:** block-scoped data lives on `interactionData`. Page-level and site-wide libraries are managed via Blockish Interactions UI / REST (not by stuffing everything onto one block). For global reusable interactions, use the `blockish/manage-global-interactions` ability when available.

**CRITICAL — animation target:**
Many blocks wrap an outer `<div>` around an inner styled element (e.g. button `<a>`). Interactions default to the **outer wrapper**. If an animation looks wrong (shadow behind a scaling button, etc.):
1. Inspect markup (`blockish/get-posts` → `content`, or ask for a screenshot).
2. Set `when.selector` to the inner target (e.g. `".blockish-button-link"`).
3. Prefer Class Manager classes as stable cross-block selectors.

---
