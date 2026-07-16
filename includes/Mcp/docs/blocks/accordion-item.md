### `blockish/accordion-item`

Must be a child of `blockish/accordion`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Accordion item"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Options: `[{"label":"H1","value":"h1"},{"label":"H2","value":"h2"},{"label":"H3","value":"h3"},{"label":"H4","value":"h4"},{"label":"H5","value":"h5"},{"label":"H6","value":"h6"},{"label":"P","value":"p"},{"label":"Span","value":"span"},{"label":"Div","value":"div"}]` |
| `defaultOpen` | Scalar (boolean) | `false` | Set `true` on exactly one item to open it by default |
| `expandIcon` | Icon | plus icon | Shown while panel is collapsed |
| `collapseIcon` | Icon | minus icon | Shown while panel is expanded |
| `itemId` | Scalar (string) | auto-generated | Leave unset |

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-accordion-item">
  
  <!-- `open` attribute is ONLY added if `defaultOpen` is true -->
  <details class="blockish-accordion-item-details" open>
    <summary class="blockish-accordion-item-trigger">
      
      <span class="blockish-accordion-item-icons">
        <span class="blockish-accordion-item-icon" data-icon-state="closed" aria-hidden="true">
          <!-- The `expandIcon` SVG (or default plus icon) is rendered here -->
          <svg ...></svg>
        </span>
        <span class="blockish-accordion-item-icon" data-icon-state="open" aria-hidden="true">
          <!-- The `collapseIcon` SVG (or default minus icon) is rendered here -->
          <svg ...></svg>
        </span>
      </span>
      
      <!-- The wrapper tag (h1-h6, p, div, span) depends on the `titleTag` attribute. Default is h3. -->
      <h3 class="blockish-accordion-item-heading">
        <span class="blockish-accordion-item-title-text">
          Item Title Text
        </span>
      </h3>
      
    </summary>
  </details>
  
  <div class="blockish-accordion-item-panel">
    <!-- Inner blocks are rendered inside this inner wrapper -->
    <div class="blockish-accordion-item-content-inner">
      ...
    </div>
  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-accordion-item {
	.blockish-accordion-item-content-inner > :first-child {
		margin-top: 0;
	}

	.blockish-accordion-item-content-inner > :last-child {
		margin-bottom: 0;
	}
}
```
*(Note: Most of the structural styling for accordion-items, like `display: flex` and borders, is actually located in the parent `blockish/accordion` block's CSS).*

