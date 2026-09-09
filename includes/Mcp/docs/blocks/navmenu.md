### `blockish/navmenu`

Desktop menu row. **Parent: `blockish/navigation` only.** **Accepts children: yes** — only `blockish/navmenu-item` (items may nest `navmenu-submenu` or `navmenu-megamenu`).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `isVertical` | Scalar (bool) | `false` (default). Root class `is-vertical` → column stack. |
| `submenuTrigger` | Scalar | `"hover"` (default) \| `"click"`. Root class `is-submenu-trigger-*`. |
| `submenuRevealAnimation` | Object / scalar | Prefer `{ "label": "Slide", "value": "slide" }`. Values: `fade` \| `slide` \| `scale` \| `soft`. Root class `submenu-reveal--{value}`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Item labels, hrefs, icons, dropdowns live on **child** `navmenu-item` nodes.

Style attrs (convert-css / inspector): `justifyContent`, `alignItems`, `navGap`, item color/bg/typography/padding/radius, active state — see block.json selectors on `.blockish-navmenu-nav` / `.blockish-block-navmenu-item`.

#### Markup

```html
<div class="wp-block-blockish-navmenu blockish-navmenu is-submenu-trigger-hover submenu-reveal--slide">
  <nav class="blockish-navmenu-nav" aria-label="Navigation">
    <!-- navmenu-item innerBlocks -->
  </nav>
</div>
```

| When | What changes |
|---|---|
| `isVertical: true` | Root `is-vertical`. |
| `submenuTrigger` | `is-submenu-trigger-hover` or `…-click`. |
| Reveal value set | `submenu-reveal--fade\|slide\|scale\|soft`. |

Style with convert-css:
- row → `{{ROOT}} .blockish-navmenu-nav { justify-content; align-items; gap }`
- items → `{{ROOT}} .blockish-block-navmenu-item { color; … }`
Default gap `12px` — only convert when different.

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
  "attributes": {
    "submenuTrigger": "hover",
    "submenuRevealAnimation": { "label": "Slide", "value": "slide" }
  },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-item",
      "attributes": { "label": "Home", "url": "/" }
    },
    {
      "name": "blockish/navmenu-item",
      "attributes": { "label": "Products", "url": "/products" },
      "innerBlocks": [
        {
          "name": "blockish/navmenu-submenu",
          "attributes": {},
          "innerBlocks": [
            {
              "name": "blockish/navmenu-item",
              "attributes": { "label": "App", "url": "/app" }
            }
          ]
        }
      ]
    }
  ]
}
```
