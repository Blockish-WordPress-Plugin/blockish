### `blockish/icon-list`

A list of icon+text rows. **Accepts children: yes** (only `blockish/icon-list-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `layout` | Scalar (string) | `"column"` | `"column"` (stacked) `"row"` (horizontal) |
| `rowGap` | Responsive | `{"Desktop":"12px"}` | |
| `columnGap` | Responsive | `{"Desktop":"12px"}` | Used when `layout` = `"row"` |
| `itemPadding` | Spacing | unset | |
| `itemContentSpacing` | Responsive | `{"Desktop":"10px"}` | Gap between icon and text |
| `itemIconSize` | Responsive | unset | |
| `itemIconColor` | Color | unset | Normal |
| `itemIconHoverColor` | Color | unset | Hover |
| `itemIconHoverTransition` | Scalar (number, seconds) | `0.2` | |
| `itemTextColor` | Color | unset | Normal |
| `itemTextHoverColor` | Color | unset | Hover |
| `itemTextHoverTransition` | Scalar (number, seconds) | `0.2` | |
| `itemTextTypography` | Stringified-JSON (Typography) | unset | |

Minimal schema:
```json
{
  "name": "blockish/icon-list",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/icon-list-item", "attributes": { "text": "Free forever plan" } }
  ]
}
```

---

