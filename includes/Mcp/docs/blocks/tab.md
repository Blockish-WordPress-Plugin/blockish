### `blockish/tab`

Tabbed content shell. **Accepts children: yes** — only `blockish/tab-item`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `defaultActiveTab` | Scalar | `0` (default). Zero-based index of the initially active panel. Must match the child with `defaultActive: true`. |
| `direction` | Responsive scalar | Default Desktop `"column"`. Saved as layout class `is-direction-{value}` (`column` \| `column-reverse` \| `row` \| `row-reverse`). |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Children must be `blockish/tab-item` only.

#### Markup

Default:

```html
<div class="wp-block-blockish-tab blockish-block-tab" data-default-tab="0">
  <div class="blockish-block-tab-layout is-direction-column">
    <div class="blockish-block-tab-nav" role="tablist" aria-label="Tabs"></div>
    <div class="blockish-block-tab-items">
      <!-- tab-item innerBlocks -->
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `defaultActiveTab` ≠ `0` | Root `data-default-tab` updates. |
| `direction.Desktop` | Layout class `is-direction-column` / `column-reverse` / `row` / `row-reverse`. |
| Frontend view script | Builds `.blockish-block-tab-trigger` buttons inside the empty `.blockish-block-tab-nav` from each item’s `data-title` / icon data attrs. |

Style with convert-css against `.blockish-block-tab-nav`, `.blockish-block-tab-trigger`, `.blockish-block-tab-item`, etc.

#### Already-there CSS

```css
/* Stylesheet */
:where(.blockish-block-tab .blockish-block-tab-layout) { flex-direction: column; gap: 10px; }
:where(.blockish-block-tab .blockish-block-tab-nav) { gap: 10px; justify-content: flex-start; align-self: stretch; }
:where(.blockish-block-tab .blockish-block-tab-trigger) { flex-direction: row; }
:where(.blockish-block-tab .blockish-block-tab-trigger-title) { text-align: left; }

/* Stylesheet */
.blockish-block-tab {
  --blockish-tab-border-color: #d1d5db;
  --blockish-tab-text-color: #111827;
  --blockish-tab-bg: #fff;
  --blockish-tab-panel-bg: #fff;
  --blockish-tab-active-bg: #111827;
  --blockish-tab-active-color: #fff;
  --blockish-tab-gap: 10px;
}

.blockish-block-tab .blockish-block-tab-layout {
  display: flex;
  flex-direction: column;
  gap: var(--blockish-tab-gap);
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-column {
  flex-direction: column;
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-column-reverse {
  flex-direction: column-reverse;
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-row {
  align-items: stretch;
  flex-direction: row;
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-row-reverse {
  align-items: stretch;
  flex-direction: row-reverse;
}

.blockish-block-tab .blockish-block-tab-nav {
  display: flex;
  flex-wrap: wrap;
  gap: var(--blockish-tab-gap);
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-row .blockish-block-tab-nav,
.blockish-block-tab .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-nav {
  align-content: flex-start;
  align-self: stretch;
  flex: 0 0 auto;
  flex-direction: column;
  flex-wrap: nowrap;
  min-height: 0;
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-row .blockish-block-tab-items,
.blockish-block-tab .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-items {
  flex: 1 1 auto;
  min-height: 0;
  min-width: 0;
}

.blockish-block-tab .blockish-block-tab-layout.is-direction-row .blockish-block-tab-trigger,
.blockish-block-tab .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-trigger {
  flex: 1 1 0;
}

.blockish-block-tab .blockish-block-tab-trigger {
  align-items: center;
  background: var(--blockish-tab-bg);
  border: 1px solid var(--blockish-tab-border-color);
  border-radius: 6px;
  color: var(--blockish-tab-text-color);
  cursor: pointer;
  display: inline-flex;
  font: inherit;
  gap: 10px;
  justify-content: center;
  margin: 0;
  padding: 10px 14px;
}

.blockish-block-tab .blockish-block-tab-trigger[aria-selected=true] {
  background: var(--blockish-tab-active-bg);
  border-color: var(--blockish-tab-active-bg);
  color: var(--blockish-tab-active-color);
}

.blockish-block-tab .blockish-block-tab-trigger-title {
  display: inline-block;
  line-height: 1.4;
  min-width: 0;
}

.blockish-block-tab .blockish-block-tab-trigger-icon {
  display: inline-flex;
  line-height: 0;
}

.blockish-block-tab .blockish-block-tab-trigger-icon svg {
  fill: currentColor;
}

.blockish-block-tab .blockish-block-tab-item {
  background: var(--blockish-tab-panel-bg);
  border: 1px solid var(--blockish-tab-border-color);
  border-radius: 8px;
  height: 100%;
  padding: 16px;
}
```

#### Minimal schema

```json
{
  "name": "blockish/tab",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/tab-item",
      "attributes": {
        "title": "Overview",
        "defaultActive": true
      },
      "innerBlocks": [
        {
          "name": "core/paragraph",
          "attributes": {
            "content": "Overview content here."
          }
        }
      ]
    },
    {
      "name": "blockish/tab-item",
      "attributes": {
        "title": "Features"
      },
      "innerBlocks": [
        {
          "name": "core/paragraph",
          "attributes": {
            "content": "Features content here."
          }
        }
      ]
    }
  ]
}
```
