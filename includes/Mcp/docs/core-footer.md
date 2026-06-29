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

## 9. TODO / needs verification

None open — every item previously flagged here (`flexWrap`/`justifyContent`/`alignItems` labels, `tag` p/span labels, `objectFit` enum, `videoAspectRatio` enum, `separator` enum, `position` enum, the stats-row `gridLayoutType` example bug) has been re-verified directly against the relevant `inspector.js`/`block.json` source and corrected in place above. If you add a new attribute reference without reading its inspector source, flag it here rather than guessing.

---

## 10. Runtime gotchas (learned by driving the MCP, not obvious from source)

These are behaviors confirmed by actually using the abilities end-to-end, not just by reading code. If something here ever looks wrong, re-verify against the actual ability/block source before trusting either source over the other.

- **`block_schema` REPLACES the staged schema, it does not merge or append.** Calling `blockish/manage-post` with `block_schema` again before the previous one has been applied in the editor discards the old pending schema entirely. There is no "add to the pending schema" — always submit the complete schema you want staged.
- **`get-posts`' `content` field reflects only what's already been *applied* in the editor**, not whatever schema is currently pending/staged. Read it to know the real, live state of a post before building an edit — it will not show you what an unapplied pending schema would add.
- **There is no single-attribute patch for an already-applied block.** To correct something a human already approved into real blocks: read the post's current `content`, find the block in question, build a corrected replacement schema for that block/section (reproducing every attribute they already have — not just the one you're changing, or you will silently revert their other edits), stage it, then have the human select the old block in the editor and apply via **Replace**. Never write raw `<!-- wp:blockish/... -->` markup into `post_content` directly — that bypasses the whole apply flow and produces invalid/empty blocks (see earlier sections on why hand-written markup fails).
- **Naming blocks up front is what makes that "find the block in question" step reliable.** Every block you emit should carry a `metadata.name` (see §7.1). The saved markup records it as `{"metadata":{"name":"Hero Section"}}` in the block delimiter, so when you read a post's `content` later you can match the exact block by its readable name instead of inferring it from a pile of attributes — and tell the human precisely which named block to select before applying a **Replace**. Unnamed blocks force you to guess, which is where wrong-block edits happen.
- **Very large or deeply nested schemas (~4+ levels deep) can fail with a misleading error** like `name is a required property of block_schema[0]` — this is a size/depth limit being hit, not an actual schema mistake. If you see this error on a structurally-correct schema: flatten unnecessary wrapper levels (e.g. put an icon directly on a card-like block instead of wrapping it in an extra container "chip"), and split a large page into multiple `manage-post` calls (e.g. stage and apply one section at a time) rather than one giant nested tree.
- **Featured image is two calls, in order:** `blockish/get-media` first (check if a suitable image already exists) → `blockish/upload-media` only if needed (public, direct `.jpg`/`.jpeg`/`.png`/`.gif`/`.webp` URL) → pass the resulting `attachment_id` as `featured_media` to `blockish/manage-post`.
- **Global Styles are reachable through `blockish/manage-post` too** — they're an ordinary post of type `wp_global_styles`, one per active theme, with the style overrides stored as JSON in `post_content`. This lets you override theme.json-level settings (which you otherwise cannot touch via any ability) without modifying any file — fully reversible the same way. No ability reports which theme is active or which `wp_global_styles` post belongs to it; infer it as the most-recently-modified `wp_global_styles` post (via `blockish/get-posts` with `post_type: "wp_global_styles"`), or ask. Example payload to remove block gap site-wide:
  ```json
  {"version":3,"isGlobalStylesUserThemeJSON":true,"styles":{"spacing":{"blockGap":"0px"}}}
  ```
