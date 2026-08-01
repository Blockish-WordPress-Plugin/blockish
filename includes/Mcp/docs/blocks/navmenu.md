### `blockish/navmenu`

Desktop menu row. **Parent: `blockish/navigation` only.** **Accepts children: yes** — only `blockish/navmenu-item` (see that doc for `label` / `url` / icon / submenu).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `isVertical` | Scalar (bool) | `false` (default). When `true`, root class `is-vertical` → nav stacks as a column. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Item labels, hrefs, icons, and dropdowns live on **child** `blockish/navmenu-item` nodes — not on this block.

#### Markup

Default:

```html
<div class="wp-block-blockish-navmenu blockish-navmenu">
  <nav class="blockish-navmenu-nav" aria-label="Navigation">
    <!-- navmenu-item innerBlocks -->
  </nav>
</div>
```

| When | What changes |
|---|---|
| `isVertical: true` | Root class `is-vertical` (nav becomes column). |

Style with convert-css:
- row alignment / gap → `{{ROOT}} .blockish-navmenu-nav { justify-content: …; align-items: …; gap: …; }`
- item color / hover (selectors live on this block) → `{{ROOT}} .blockish-block-navmenu-item { color: …; }` and `{{ROOT}} .blockish-block-navmenu-item:hover { … }`
- item padding / radius / background → target `.blockish-navmenu-item-link` via convert-css on **navmenu-item**, or Class Manager if shared
Already-there gap is `12px` — only convert when different.
Do not invent markup.

#### Already-there CSS

```css
.blockish-navmenu {
  z-index: 5;
}

.blockish-navmenu .blockish-navmenu-nav {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}

:where(.blockish-navmenu .blockish-navmenu-nav) {
  gap: 12px;
}

.blockish-navmenu.is-vertical .blockish-navmenu-nav {
  align-items: stretch;
  flex-direction: column;
}
```

#### Minimal schema

```json
{
  "name": "blockish/navmenu",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/navmenu-item",
      "attributes": {
        "label": "Home",
        "url": "/"
      }
    }
  ]
}
```
