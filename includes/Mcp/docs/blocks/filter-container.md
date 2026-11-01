### `blockish/filter-container`

Search and filter container for inner blocks. Visitors filter children using category buttons and a live search input. **Accepts children: yes** — any inner blocks (e.g. `blockish/container`, `blockish/heading`, cards, portfolios, FAQ items).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `showSearch` | Boolean | `true` (default). Displays the search text input. |
| `searchPlaceholder` | String | `"Search…"` (default). Placeholder for the search input. |
| `searchInText` | Boolean | `false` (default). When `false`, search matches `searchKeywords` and `filterTerms`. When `true`, also matches text inside blocks. |
| `showFilters` | Boolean | `true` (default). Displays the category/term filter buttons. |
| `allLabel` | String | `"All"` (default). Label for the reset / view-all button. |
| `filterMode` | String | `"single"` (default). Currently supports single-term active selection. |
| `emptyMessage` | String | `"No results found."` (default). Text shown when no items match the filter or search. |
| `itemsLayout` | String | `"grid"` (default). Layout wrapper for items (`is-layout-grid`). |
| `columns` | Object | Responsive column count for grid layout (e.g. `{"desktop": 3, "tablet": 2, "mobile": 1}`). |
| `itemsGap` | Object | Responsive gap between items. |
| `controlsAlign` | Object | Alignment of search & buttons header (`flex-start`, `center`, `flex-end`, `space-between`). |

#### Tagging Inner Blocks

Any block placed inside `blockish/filter-container` supports the following global Blockish attributes:
* `filterTerms`: Comma-separated categories/tags (e.g. `"Design, Branding"`). Generates filter buttons in the container automatically.
* `searchKeywords`: Comma-separated search synonyms/keywords (e.g. `"logo, identity, vector"`). Matches search queries even if words do not appear in visible text.

When a card container holds nested blocks with filter terms, the top-level card is filtered as a unit. Blocks without any filter terms remain visible at all times.

#### Dynamic Rendering & Markup

As a dynamic block (`render.php`), only the inner blocks are stored in the post content; the outer controls, wrappers, and empty status elements are rendered dynamically by WordPress on page load.

```html
<div class="wp-block-blockish-filter-container blockish-filter-container" data-search-text="false" data-filter-mode="single">
  <div class="blockish-filter-controls">
    <div class="blockish-filter-buttons" role="group" aria-label="All" data-all-label="All">
      <!-- Buttons dynamically populated on the front-end by view.js -->
      <button type="button" class="blockish-filter-button is-active" aria-pressed="true">All</button>
      <button type="button" class="blockish-filter-button" data-term="Design" aria-pressed="false">Design</button>
    </div>
    <div class="blockish-filter-search-box">
      <svg class="blockish-filter-search-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true">
        <circle cx="7" cy="7" r="5"></circle>
        <path d="M11 11l3.5 3.5"></path>
      </svg>
      <input type="search" class="blockish-filter-search" placeholder="Search…" aria-label="Search…" />
    </div>
  </div>
  <div class="blockish-filter-items is-layout-grid">
    <!-- inner blocks with data-blockish-filter-terms and data-blockish-search-keywords -->
  </div>
  <p class="blockish-filter-empty" hidden>No results found.</p>
  <p class="blockish-filter-status" aria-live="polite"></p>
</div>
```

#### Styling Selectors

Target these classes with Class Manager or custom CSS:
* `.blockish-filter-container` — Root wrapper.
* `.blockish-filter-controls` — Controls bar holding search and buttons.
* `.blockish-filter-search` — Search input element.
* `.blockish-filter-buttons` — Filter button group wrapper.
* `.blockish-filter-button` — Individual filter buttons.
* `.blockish-filter-button.is-active` — Currently active filter button.
* `.blockish-filter-items` — Grid/layout container for children.
* `.blockish-filter-empty` — Message element displayed when 0 items match.

