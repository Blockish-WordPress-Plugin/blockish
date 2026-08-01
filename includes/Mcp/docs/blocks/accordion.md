### `blockish/accordion`

Accordion container for collapsible FAQ-style panels. **Accepts children: yes** — only `blockish/accordion-item`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `faqSchema` | Scalar | `false` (default). When `true`, frontend emits FAQPage JSON-LD (`data-faq-schema="true"`). |
| `maxItemExpanded` | Scalar | `"one"` (default) or `"many"`. Controls how many panels may stay open (`data-max-expanded`). |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Children must be `blockish/accordion-item` only.

#### Markup

Default (empty attributes):

```html
<div class="wp-block-blockish-accordion blockish-accordion" data-faq-schema="false" data-max-expanded="one">
  <!-- accordion-item innerBlocks -->
</div>
```

| When | What changes |
|---|---|
| `faqSchema: true` | Root `data-faq-schema="true"` (view script may inject FAQ JSON-LD). |
| `maxItemExpanded: "many"` | Root `data-max-expanded="many"`. |

Style with convert-css against `.blockish-accordion`, `.blockish-accordion-item-trigger`, `.blockish-accordion-item-content-inner`, etc. — not invented markup. (Editor wraps items in `.blockish-accordion-items`; save puts items as direct children of the root.)

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet (:where defaults — omit unless overriding) */
:where(.blockish-accordion .blockish-accordion-item-trigger) { justify-content: start; flex-direction: row; }

/* Stylesheet */
.blockish-accordion {
  --blockish-accordion-border-color: #d1d5db;
  --blockish-accordion-icon-size: 18px;
}

.blockish-accordion .blockish-accordion-items {
  display: grid;
}

.blockish-accordion .blockish-accordion-item-heading {
  margin: 0;
}

.blockish-accordion .blockish-accordion-item-panel {
  border: 0 solid var(--blockish-accordion-border-color);
  display: grid;
  grid-template-rows: minmax(0,0fr);
  overflow: hidden;
  transition: grid-template-rows .3s ease,border-width .3s ease;
}

.blockish-accordion .blockish-accordion-item {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  overflow: clip;
}

.blockish-accordion .blockish-accordion-item-content-inner {
  min-height: 0;
  overflow: hidden;
  padding: 16px;
}

.blockish-accordion .blockish-accordion-item-trigger {
  align-items: center;
  background: transparent;
  border: 1px solid var(--blockish-accordion-border-color);
  box-sizing: border-box;
  color: inherit;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  gap: 14px;
  justify-content: start;
  padding: 18px 22px;
  position: relative;
  text-align: left;
  width: 100%;
}

.blockish-accordion .blockish-accordion-item-trigger:focus {
  outline: none;
}

.blockish-accordion .blockish-accordion-item-trigger:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 2px;
}

.blockish-accordion .blockish-accordion-item-heading {
  min-width: 0;
}

.blockish-accordion .blockish-accordion-item-title-text {
  display: block;
}

.blockish-accordion .blockish-accordion-item-trigger::-webkit-details-marker {
  display: none;
}

.blockish-accordion .blockish-accordion-item-trigger::marker {
  content: "";
}

.blockish-accordion .blockish-accordion-item-title-text {
  color: #111827;
  text-align: start;
}

.blockish-accordion .blockish-accordion-item-details[open] .blockish-accordion-item-title-text {
  color: #111827;
}

.blockish-accordion .blockish-accordion-item-icon {
  align-items: center;
  color: #111827;
  display: inline-flex;
  justify-content: center;
  line-height: 1;
}

.blockish-accordion .blockish-accordion-item-icon svg {
  fill: currentColor;
  height: var(--blockish-accordion-icon-size);
  width: var(--blockish-accordion-icon-size);
}

.blockish-accordion .blockish-accordion-item-details[open] .blockish-accordion-item-icon {
  color: #111827;
}

.blockish-accordion .blockish-accordion-item-icon[data-icon-state=open] {
  display: none;
}

.blockish-accordion .blockish-accordion-item-icons {
  display: block;
  flex: 0 0 auto;
  line-height: 0;
}

.blockish-accordion .blockish-accordion-item-details[open] .blockish-accordion-item-icon[data-icon-state=open] {
  display: inline-flex;
}

.blockish-accordion .blockish-accordion-item-details[open] .blockish-accordion-item-icon[data-icon-state=closed] {
  display: none;
}

.blockish-accordion .blockish-accordion-item-details[open]+.blockish-accordion-item-panel {
  border-width: 0 1px 1px;
  grid-template-rows: minmax(0,1fr);
}
```

#### Minimal schema

```json
{
  "name": "blockish/accordion",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/accordion-item",
      "attributes": {
        "title": "What is Blockish?",
        "defaultOpen": true
      },
      "innerBlocks": [
        {
          "name": "core/paragraph",
          "attributes": {
            "content": "Blockish is a Gutenberg block plugin."
          }
        }
      ]
    }
  ]
}
```
