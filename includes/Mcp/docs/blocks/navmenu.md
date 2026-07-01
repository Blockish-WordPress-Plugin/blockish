### `blockish/navmenu`

The desktop menu row. Must be a child of `blockish/navigation`. **Accepts children: yes** (only `blockish/navmenu-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `isVertical` | Scalar (boolean) | `false` | Stack items vertically instead of in a row |
| `justifyContent` | Responsive-Option | unset | `"flex-start"` `"center"` `"flex-end"` `"space-between"` `"space-around"` `"space-evenly"` |
| `alignItems` | Responsive-Option | unset | `"flex-start"` `"center"` `"flex-end"` `"stretch"` |
| `navGap` | Responsive (length) | unset | Gap between items |
| `itemColorNormal` | Color | unset | Link text, normal |
| `itemColorHover` | Color | unset | Link text, hover |
| `itemColorActive` | Color | unset | Link text, current-page item |
| `itemBgNormal` | Stringified-JSON (Background) | unset | Normal |
| `itemBgHover` | Stringified-JSON (Background) | unset | Hover |
| `itemBgActive` | Stringified-JSON (Background) | unset | Current-page item |
| `itemTypography` | Stringified-JSON (Typography) | unset | Applies to all items |
| `itemBorderRadius` | Border-Radius | unset | |
| `itemPadding` | Spacing | unset | |

---

