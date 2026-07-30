### `blockish/icon-list`

List of icon + text rows. **Accepts children: yes** — only `blockish/icon-list-item`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `layout` | Scalar | `"column"` (default) or `"row"` — sets root `flex-direction`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Children must be `blockish/icon-list-item` only.

#### Markup

Default:

```html
<ul class="wp-block-blockish-icon-list blockish-icon-list">
  <!-- icon-list-item innerBlocks -->
</ul>
```

| When | What changes |
|---|---|
| `layout: "row"` | Root flex-direction becomes row (via attribute CSS). |

#### Already-there CSS

```css
/* Stylesheet */
:where(.blockish-icon-list) {
  flex-direction: column;
  row-gap: 12px;
  column-gap: 12px;
  --blockish-icon-list-icon-hover-transition: 0.2s;
  --blockish-icon-list-text-hover-transition: 0.2s;
}
:where(.blockish-icon-list .blockish-icon-list-item-link) { column-gap: 10px; }

/* Stylesheet */
.blockish-icon-list {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

.blockish-icon-list .blockish-icon-list-item {
  list-style: none;
}

.blockish-icon-list .blockish-icon-list-item-link {
  align-items: center;
  display: inline-flex;
  gap: 10px;
  text-decoration: none!important;
}

.blockish-icon-list .blockish-icon-list-item-icon svg,
.blockish-icon-list .blockish-icon-list-item-text {
  transition-property: color,fill;
  transition-timing-function: ease;
}

.blockish-icon-list .blockish-icon-list-item-icon svg {
  transition-duration: var(--blockish-icon-list-icon-hover-transition,.2s);
}

.blockish-icon-list .blockish-icon-list-item-text {
  transition-duration: var(--blockish-icon-list-text-hover-transition,.2s);
}
```

#### Minimal schema

```json
{
  "name": "blockish/icon-list",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/icon-list-item",
      "attributes": {
        "text": "Free forever plan"
      }
    }
  ]
}
```
