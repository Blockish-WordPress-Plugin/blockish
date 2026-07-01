### `blockish/accordion`

**Accepts children: yes** (only `blockish/accordion-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `maxItemExpanded` | Scalar (string) | `"one"` | `"one"` (single open panel) `"many"` (multiple allowed) |
| `faqSchema` | Scalar (boolean) | `false` | Adds `FAQPage` JSON-LD |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon right) `"row-reverse"` (icon left) |
| `itemPosition` | Responsive | `{"Desktop":"start"}` | `"start"` `"center"` `"end"` |
| `itemsSpaceBetween` | Responsive | unset | |
| `distanceBetweenContent` | Responsive | unset | |
| `accordionBackgroundNormal` | Stringified-JSON (Background) | unset | |
| `accordionBorderNormal` | Stringified-JSON (Border) | unset | |
| `accordionBorderRadius` | Border-Radius | unset | |
| `accordionPadding` | Spacing | unset | |
| `headerTypography` | Stringified-JSON (Typography) | unset | |
| `headerTextColor` | Color | unset | Normal |
| `headerTextColorHover` | Color | unset | Hover |
| `headerTextColorActive` | Color | unset | Active/open |
| `iconColor` | Color | unset | Toggle icon, normal |
| `iconColorHover` | Color | unset | Toggle icon, hover |
| `iconColorActive` | Color | unset | Toggle icon, active |
| `iconSize` | Responsive | unset | |
| `contentBackground` | Stringified-JSON (Background) | unset | |
| `contentTextColor` | Color | unset | |
| `contentPadding` | Spacing | unset | |

Minimal schema:
```json
{
  "name": "blockish/accordion",
  "attributes": { "faqSchema": true },
  "innerBlocks": [
    { "name": "blockish/accordion-item", "attributes": { "title": "What is Blockish?", "defaultOpen": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Blockish is a Gutenberg block plugin." } } ] },
    { "name": "blockish/accordion-item", "attributes": { "title": "Is it free?" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Yes, the core plugin is free." } } ] }
  ]
}
```

(`maxItemExpanded` is omitted because `"one"` is already the default.)

---

