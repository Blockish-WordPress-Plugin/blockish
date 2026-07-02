### `blockish/social-icons`

**Accepts children: yes** (only `blockish/social-icon-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `shape` | Scalar (string) | `"circle"` | `"circle"` `"square"` `"rounded"` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `columns` | Responsive | `{"Desktop":"auto-fit"}` | `"auto-fit"` or an integer. <br>**Warning:** If placed inside a `blockish/container` with auto grid layout (`gridLayoutType: "auto"`), `"auto-fit"` will cause the icons to collapse. Set `columns` to an explicit integer instead. |
| `iconColorMode` | Scalar (string) | `"official"` | `"official"` (brand colors) `"custom"` (use `iconColor`) |
| `iconColor` | Color | unset | Active when `iconColorMode` = `"custom"` |
| `iconSecondaryColor` | Color | `"#FFFFFF"` | |
| `iconSize` | Responsive | unset | |
| `iconPadding` | Spacing | unset | |
| `iconSpacing` | Responsive | `{"Desktop":"12px"}` | |
| `iconRowsGap` | Responsive | `{"Desktop":"12px"}` | |
| `iconBorder` | Stringified-JSON (Border) | unset | |
| `iconBorderRadius` | Border-Radius | unset | |
| `hoverAnimation` | Scalar (string) | `"none"` | `"none"` `"float"` `"sink"` `"grow"` `"spin"` `"pulse"` |

Minimal schema:
```json
{
  "name": "blockish/social-icons",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/social-icon-item", "attributes": { "network": "instagram", "label": "Instagram", "officialColor": "#E1306C", "link": { "url": "https://instagram.com/username", "newTab": true } } }
  ]
}
```

---

