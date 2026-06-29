### `blockish/container`

The primary layout block — flexbox or CSS grid. **Accepts children: yes.**

**Hard requirement:** `isVariationPicked` defaults to `false` but must always be set to `true` in `attributes`. Without it, the block renders its empty layout-picker placeholder instead of any content — this is the one attribute that breaks the omit-if-default rule.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `isVariationPicked` | Scalar (boolean) | `false` | **Always set to `true`.** |
| `tagName` | Option | `{"label":"Div","value":"div"}` | `Div`/`div` · `Section`/`section` · `Article`/`article` · `Main`/`main` · `Aside`/`aside` · `Header`/`header` · `Footer`/`footer` |
| `display` | Scalar (string) | `"flex"` | `"flex"` `"grid"` |
| `containerWidth` | Scalar (string) | `"alignfull"` | `"alignfull"` `"alignwide"` `"align-custom-width"` (with `customWidthContainer`) — **the custom option's value is the literal string `"align-custom-width"`, not `"custom"`** |
| `customWidthContainer` | Responsive | `{"Desktop":"100%"}` | Active when `containerWidth` = `"align-custom-width"` |
| `containerMinHeight` | Responsive | `{"Desktop":"0"}` | |
| `overflow` | Responsive-Option | unset | `"visible"` `"hidden"` `"scroll"` `"auto"` |
| `flexDirection` | Responsive-Option | `{"Desktop":{"label":"Row","value":"row"}}` | `Row`/`row` · `Column`/`column` · `Row Reverse`/`row-reverse` · `Column Reverse`/`column-reverse` |
| `flexWrap` | Responsive-Option | unset | `Wrap`/`wrap` · `No Wrap`/`nowrap` · `Reverse`/`wrap-reverse` |
| `justifyContent` | Responsive-Option | `{"Desktop":{"label":"Center","value":"center"}}` | `Start`/`flex-start` · `End`/`flex-end` · `Center`/`center` · `Space Between`/`space-between` · `Space Around`/`space-around` · `Space Evenly`/`space-evenly` |
| `alignItems` | Responsive-Option | `{"Desktop":{"label":"Center","value":"center"}}` | `Start`/`flex-start` · `End`/`flex-end` · `Center`/`center` · `Stretch`/`stretch` — **no `baseline` option** (despite the global `alignSelf` attribute supporting it) |
| `columnGap` | Responsive | unset | |
| `rowGap` | Responsive | unset | |
| `gridLayoutType` | Scalar (string) | `"auto"` | `"auto"` (auto-fit columns) `"fixed"` (explicit count) |
| `gridColumns` | Responsive | `{"Desktop":3,"Tablet":2,"Mobile":1}` | Used when `gridLayoutType` = `"fixed"` |
| `gridRows` | Responsive | `{"Desktop":1}` | Used when `gridLayoutType` = `"fixed"` |
| `autoGridWidth` | Responsive | `{"Desktop":"12rem"}` | Used when `gridLayoutType` = `"auto"` |
| `autoGridHeight` | Responsive | unset | |
| `containerBackground` | Stringified-JSON (Background) | unset | Normal state. **Only this attribute supports `backgroundType:"video"`.** |
| `containerHoverBackground` | Stringified-JSON (Background) | unset | Hover state |
| `containerBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Normal state |
| `containerHoverBackgroundOverlay` | Stringified-JSON (Background Overlay) | unset | Hover state |
| `containerBorder` | Stringified-JSON (Border) | unset | Normal state |
| `containerHoverBorder` | Stringified-JSON (Border) | unset | Hover state |
| `containerBorderRadius` | Border-Radius | unset | Normal state |
| `containerHoverBorderRadius` | Border-Radius | unset | Hover state |
| `containerBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal state |
| `containerHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover state |
| `anchor` | Scalar (string) | unset | WP-core "HTML anchor" — sets the element's `id`. See §7.1. |
| `align` | Scalar (string) | unset | `"wide"` `"full"` — WP-core wide/full alignment. See §7.1. |

Minimal schema:
```json
{
  "name": "blockish/container",
  "attributes": { "isVariationPicked": true },
  "innerBlocks": []
}
```

---

