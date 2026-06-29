### `blockish/tab`

**Accepts children: yes** (only `blockish/tab-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `direction` | Responsive | `{"Desktop":"column"}` | `"column"` (nav on top) `"row"` (nav on side) |
| `defaultActiveTab` | Scalar (integer) | `0` | Zero-based index — must match the `tab-item` with `defaultActive: true` |
| `justify` | Responsive | `{"Desktop":"flex-start"}` | `"flex-start"` `"center"` `"flex-end"` `"space-between"` |
| `alignTitle` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` |
| `navGap` | Responsive | `{"Desktop":"10px"}` | |
| `distanceFromContent` | Responsive | `{"Desktop":"10px"}` | |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon left) `"row-reverse"` (icon right) |
| `tabsBackgroundNormal` | Stringified-JSON (Background) | unset | |
| `tabsBackgroundHover` | Stringified-JSON (Background) | unset | |
| `tabsBackgroundActive` | Stringified-JSON (Background) | unset | |
| `tabsBorderNormal` | Stringified-JSON (Border) | unset | |
| `tabsBorderActive` | Stringified-JSON (Border) | unset | |
| `tabsBorderRadius` | Border-Radius | unset | |
| `tabsPadding` | Spacing | unset | |
| `titleTypography` | Stringified-JSON (Typography) | unset | |
| `titleColorNormal` | Color | unset | |
| `titleColorHover` | Color | unset | |
| `titleColorActive` | Color | unset | |
| `iconSize` | Responsive | unset | |
| `iconColorNormal` | Color | unset | |
| `iconColorActive` | Color | unset | |
| `contentBackground` | Stringified-JSON (Background) | unset | |
| `contentColor` | Color | unset | |
| `contentBorder` | Stringified-JSON (Border) | unset | |
| `contentBorderRadius` | Border-Radius | unset | |
| `contentPadding` | Spacing | unset | |

Minimal schema:
```json
{
  "name": "blockish/tab",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/tab-item", "attributes": { "title": "Overview", "defaultActive": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Overview content here." } } ] },
    { "name": "blockish/tab-item", "attributes": { "title": "Features" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Features content here." } } ] }
  ]
}
```

---

