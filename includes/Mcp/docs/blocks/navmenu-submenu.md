### `blockish/navmenu-submenu`

Dropdown/flyout panel for a menu item. **Parent: `blockish/navmenu-item` only.** **Accepts children: yes** — only nested `blockish/navmenu-item`.

> [!WARNING]
> **Hard rule — nesting:** Do not place this at page root. Nest under the `navmenu-item` that opens the submenu. Allowed children are `blockish/navmenu-item` only.

#### Content / structure

No content-only attributes (panel width/gap/colors are style via convert-css). Structure is the nested `navmenu-item` list.

#### Markup

Default:

```html
<ul class="wp-block-blockish-navmenu-submenu blockish-navmenu-submenu">
  <!-- nested navmenu-item innerBlocks -->
</ul>
```

| When | What changes |
|---|---|
| Nested items present | Rendered as list children; parent item’s `render.php` adds the submenu toggle when this block is present. |

#### Already-there CSS

```css
:where(.blockish-navmenu-submenu) {
  background: #fff;
  border: 1px solid rgba(0,0,0,.1);
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,.12);
  font-size: 16px;
}

.blockish-navmenu-submenu {
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  min-width: 180px;
  padding: 12px;
}

:where(.blockish-navmenu-submenu .blockish-block-navmenu-item) {
  padding: 8px;
}
```

#### Minimal schema

```json
{
  "name": "blockish/navmenu-submenu",
  "attributes": {},
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
