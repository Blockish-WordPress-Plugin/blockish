### `blockish/navmenu-submenu`

Dropdown/flyout panel for a `blockish/navmenu-item`. **Accepts children: yes** (nested `blockish/navmenu-item`s). **Parent: `blockish/navmenu-item` only.**

Do not place this at the root of a page — nest it under a nav item that needs a submenu.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `containerWidth` | Responsive | unset | Submenu panel width |
| `alignment` | Responsive | unset | |
| `itemGap` | Responsive | unset | Gap between sub-items |
| `panelBg` | Stringified-JSON (Background) | unset | Panel background |
| `panelBorder` | Stringified-JSON (Border) | unset | |
| `panelBoxShadow` | Stringified-JSON (Box Shadow) | unset | |
| `panelBorderRadius` | Border-Radius | unset | |
| `panelPadding` | Spacing (Responsive) | unset | |
| `subItemTypography` | Stringified-JSON (Typography) | unset | |
| `subItemColorNormal` / `subItemBgNormal` / `subItemBorderNormal` | Color / Background / Border | unset | Default sub-item |
| `subItemColorHover` / `subItemBgHover` / `subItemBorderColorHover` | Color | unset | Hover |
| `subItemColorActive` / `subItemBgActive` / `subItemBorderColorActive` | Color | unset | Active/current |
| `subItemPadding` | Spacing (Responsive) | unset | |
| `subItemBorderRadius` | Border-Radius | unset | |

```json
{
  "name": "blockish/navmenu-item",
  "attributes": { "label": "Products", "url": "/products" },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-submenu",
      "attributes": {},
      "innerBlocks": [
        { "name": "blockish/navmenu-item", "attributes": { "label": "App", "url": "/app" } },
        { "name": "blockish/navmenu-item", "attributes": { "label": "API", "url": "/api" } }
      ]
    }
  ]
}
```
