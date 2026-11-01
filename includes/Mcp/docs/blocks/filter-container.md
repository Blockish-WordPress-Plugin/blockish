### `blockish/filter-container`

Search and filter container for inner blocks. Visitors filter children using category buttons and a live search input. **Accepts children: yes** — any inner blocks (e.g. `blockish/container`, cards, portfolio items, FAQ accordions).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `showSearch` | Scalar (bool) | Default `true`. Displays the search text input. |
| `searchPlaceholder` | Scalar (string) | Default `"Search…"`. Placeholder for the search input. |
| `searchInText` | Scalar (bool) | Default `false`. When `false`, search matches `searchKeywords` and `filterTerms`. When `true`, also matches text inside blocks. |
| `showFilters` | Scalar (bool) | Default `true`. Displays the category/term filter buttons. |
| `allLabel` | Scalar (string) | Default `"All"`. Label for the reset / view-all button. |
| `filterMode` | Scalar (string) | `"single"` (default) or `"multiple"`. Controls active button selection. |
| `emptyMessage` | Scalar (string) | Default `"No results found."`. Message shown when no items match. |
| `itemsLayout` | Scalar (string) | `"grid"` (default) or `"stack"`. Items layout wrapper. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Tagging Inner Blocks

Any inner block supports the following global Blockish attributes:
* `filterTerms`: Comma-separated categories/tags (e.g. `"Design, Branding"`). Generates filter buttons in the container automatically.
* `searchKeywords`: Comma-separated search synonyms/keywords (e.g. `"logo, identity, vector"`). Matches search queries even if words do not appear in visible text.

When a card container holds nested blocks with filter terms, the top-level card is filtered as a unit. Blocks without filter terms remain visible at all times.

#### Markup

Default (empty attributes):

```html
<div class="wp-block-blockish-filter-container blockish-filter-container" data-filter-mode="single" data-search-text="false">
  <div class="blockish-filter-controls">
    <div class="blockish-filter-buttons" role="group" aria-label="All" data-all-label="All"></div>
    <div class="blockish-filter-search-box">
      <svg class="blockish-filter-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="7" cy="7" r="5"></circle>
        <path d="M11 11l3.5 3.5"></path>
      </svg>
      <input type="search" class="blockish-filter-search" placeholder="Search…" aria-label="Search…" />
    </div>
  </div>
  <div class="blockish-filter-items is-layout-grid">
    <!-- innerBlocks -->
  </div>
  <p class="blockish-filter-empty" hidden>No results found.</p>
  <p class="blockish-filter-status" aria-live="polite"></p>
</div>
```

| When | What changes |
|---|---|
| `showFilters: false` | Omit `.blockish-filter-buttons`. |
| `showSearch: false` | Omit `.blockish-filter-search-box`. |
| `itemsLayout: "stack"` | Items container gets class `is-layout-stack` instead of `is-layout-grid`. |
| `filterMode: "multiple"` | Root attribute `data-filter-mode="multiple"`. |
| `searchInText: true` | Root attribute `data-search-text="true"`. |

Style with convert-css against `.blockish-filter-container`, `.blockish-filter-controls`, `.blockish-filter-search`, `.blockish-filter-search-icon`, `.blockish-filter-button`, `.blockish-filter-items` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-filter-container { display: flex; flex-direction: column; row-gap: 28px; }
.blockish-filter-controls { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 12px 16px; }
.blockish-filter-buttons { display: flex; flex-wrap: wrap; gap: 8px; }
.blockish-filter-button { box-sizing: border-box; display: inline-flex; align-items: center; min-height: 40px; padding: 8px 16px; border: 1px solid rgba(127, 127, 127, 0.3); border-radius: 999px; background: transparent; color: inherit; font-size: 15px; font-weight: 500; cursor: pointer; user-select: none; }
.blockish-filter-button.is-active { border-color: #1e1e1e; background: #1e1e1e; color: #fff; }
.blockish-filter-search-box { position: relative; display: flex; align-items: center; max-width: 100%; }
.blockish-filter-search-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); width: 16px; height: 16px; color: inherit; opacity: 0.55; pointer-events: none; flex-shrink: 0; }
.blockish-filter-search { width: 240px; max-width: 100%; min-height: 42px; padding: 8px 16px 8px 38px; border: 1px solid rgba(127, 127, 127, 0.3); border-radius: 999px; background: transparent; color: inherit; font-size: 15px; box-sizing: border-box; }
.blockish-filter-items.is-layout-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
.blockish-filter-items.is-layout-stack { display: flex; flex-direction: column; gap: 12px; }
```

#### Minimal schema

```json
{
  "name": "blockish/filter-container",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/container",
      "attributes": {
        "isVariationPicked": true,
        "filterTerms": "Design"
      },
      "innerBlocks": [
        {
          "name": "blockish/heading",
          "attributes": { "content": "Project One", "tag": { "label": "H3", "value": "h3" } }
        }
      ]
    },
    {
      "name": "blockish/container",
      "attributes": {
        "isVariationPicked": true,
        "filterTerms": "Development"
      },
      "innerBlocks": [
        {
          "name": "blockish/heading",
          "attributes": { "content": "Project Two", "tag": { "label": "H3", "value": "h3" } }
        }
      ]
    }
  ]
}
```
