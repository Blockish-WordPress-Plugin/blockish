### `blockish/navmenu-submenu`

Dropdown / flyout panel under a menu item. **Parent: `blockish/navmenu-item` only.** **Accepts children: yes** — only nested `blockish/navmenu-item` (those may nest another submenu).

> [!WARNING]
> **Hard rule — nesting:** Never place at page root. Nest under the `navmenu-item` that opens it. A given `navmenu-item` may have **either** one `navmenu-submenu` **or** one `navmenu-megamenu` — not both.
>
> **Offcanvas:** Synced mobile drawer renders the same tree as accordion. Desktop card chrome (white bg / shadow / radius) is **stripped** inside `.blockish-offcanvas` — do not restyle the submenu as a floating card for mobile; inherit the offcanvas panel.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `alignment` | Responsive select | Link `justify-content` inside nested items: `flex-start` \| `center` \| `flex-end` \| `space-between`. Prefer convert-css / style attrs. |
| `itemGap` | RangeUnit | Gap between nested items. Selectors hit wrapper + editor `__list`. |
| `positionAlign` | Scalar | `"left"` (default) \| `"center"` \| `"right"`. Desktop **top-level** dropdown align to the parent item. Ignored meaningfully for nested flyouts (side open). |
| `offsetY` | RangeUnit | Top distance for dropdown / flyout. |
| `offsetX` | RangeUnit | Horizontal offset. |

Position attrs are written to `data-position-align`, `data-offset-y`, `data-offset-x` for the view script. Offcanvas accordion **ignores** desktop positioning JS.

#### Markup

Frontend default:

```html
<ul
  class="wp-block-blockish-navmenu-submenu blockish-navmenu-submenu"
  data-position-align="left"
  data-offset-y=""
  data-offset-x=""
>
  <!-- nested navmenu-item innerBlocks -->
</ul>
```

| When | What changes |
|---|---|
| Nested items | List children; parent item `render.php` adds toggle + `.blockish-navmenu-item-children`. |
| Inside offcanvas | Accordion (no fixed dropdown); transparent bg — inherits panel. |

#### Already-there CSS

```css
.blockish-navmenu-submenu {
  background: #fff;
  border: 1px solid rgba(0, 0, 0, .08);
  border-radius: 8px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, .1);
  box-sizing: border-box;
  display: none;
  flex-direction: column;
  gap: 2px;
  list-style: none;
  margin: 0;
  min-width: 200px;
  padding: 8px;
}

/* Inside offcanvas — card chrome reset (do not fight this with white bg) */
.blockish-offcanvas .blockish-navmenu-submenu {
  background: transparent !important;
  box-shadow: none !important;
  border-radius: 0;
  min-width: 0;
  width: 100%;
}
```

#### Minimal schema

```json
{
  "name": "blockish/navmenu-submenu",
  "attributes": {
    "positionAlign": "left"
  },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-item",
      "attributes": { "label": "App", "url": "/app" }
    },
    {
      "name": "blockish/navmenu-item",
      "attributes": { "label": "API", "url": "/api" }
    }
  ]
}
```
