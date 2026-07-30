### `blockish/accordion-item`

Single collapsible panel. **Parent: `blockish/accordion` only.** **Accepts children: yes** (panel body — any blocks).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `title` | Scalar | Default `"Accordion item"`. Header label. |
| `titleTag` | Option | Default `{"label":"H3","value":"h3"}`. Heading tag wrapping the title text. |
| `defaultOpen` | Scalar | `false` (default). When `true`, `<details open>`. With parent `maxItemExpanded: "one"`, open at most one item. |
| `expandIcon` | Icon | Plus-style icon shown while collapsed. Prefer `get-icons`. |
| `collapseIcon` | Icon | Minus-style icon shown while expanded. Prefer `get-icons`. |
| `itemId` | Scalar | Leave unset (editor may generate). |
| `anchor` | Scalar | Optional HTML `id`. |

#### Markup

Default:

```html
<div class="wp-block-blockish-accordion-item blockish-accordion-item">
  <details class="blockish-accordion-item-details">
    <summary class="blockish-accordion-item-trigger">
      <span class="blockish-accordion-item-icons">
        <span class="blockish-accordion-item-icon" data-icon-state="closed" aria-hidden="true"><!-- expandIcon svg --></span>
        <span class="blockish-accordion-item-icon" data-icon-state="open" aria-hidden="true"><!-- collapseIcon svg --></span>
      </span>
      <h3 class="blockish-accordion-item-heading">
        <span class="blockish-accordion-item-title-text">Accordion item</span>
      </h3>
    </summary>
  </details>
  <div class="blockish-accordion-item-panel">
    <div class="blockish-accordion-item-content-inner">
      <!-- innerBlocks -->
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `defaultOpen: true` | `<details … open>`. |
| `titleTag.value` not `h3` | Heading element tag changes (`h1`–`h6`, `p`, `span`, `div`). |
| Custom `expandIcon` / `collapseIcon` | SVG paths inside the closed/open icon spans. |

Open/closed icon visibility is CSS (`[data-icon-state]` + `[open]`). Panel expand uses sibling `.blockish-accordion-item-details[open] + .blockish-accordion-item-panel`.

#### Already-there CSS

Stylesheet (item-local; most chrome lives on the parent accordion stylesheet):

```css
.blockish-accordion-item .blockish-accordion-item-content-inner>:first-child {
  margin-top: 0;
}

.blockish-accordion-item .blockish-accordion-item-content-inner>:last-child {
  margin-bottom: 0;
}
```

Parent accordion stylesheet supplies trigger/panel/icon defaults — see `accordion.md`.

#### Minimal schema

```json
{
  "name": "blockish/accordion-item",
  "attributes": {
    "title": "Is it free?",
    "defaultOpen": false
  },
  "innerBlocks": [
    {
      "name": "core/paragraph",
      "attributes": {
        "content": "Yes, the core plugin is free."
      }
    }
  ]
}
```
