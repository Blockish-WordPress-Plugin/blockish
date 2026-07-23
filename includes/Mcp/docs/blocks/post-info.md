### `blockish/post-info`

Post metadata row (author, dates, comments, terms). **Accepts children: no.** Items are a repeater in `items`.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `layout` | Option | `{"value":"row","label":"Row"}` | `"row"` \| `"column"` |
| `separator` | Option | `{"value":"dot","label":"Dot"}` | Separator style between items |
| `items` | Array | author + date + comments | See item shape |
| `alignment` | Responsive | `{"Desktop":"flex-start"}` | flex justify <br>**CSS:** `.{{WRAPPER}}` -> `justify-content: {{VALUE}};` |
| `alignItems` | Responsive | `{"Desktop":"center"}` | <br>**CSS:** `.{{WRAPPER}}` -> `align-items: {{VALUE}};` |
| `gap` | Responsive | `{"Desktop":"12px"}` | Between items |
| `typography` | Stringified-JSON (Typography) | unset | |
| `color` | Color | unset | |
| `hoverColor` | Color | unset | Link hover |
| `iconColor` | Color | unset | |
| `iconSize` | Responsive | unset | |
| `iconGap` | Responsive | `{"Desktop":"6px"}` | Icon ↔ text |
| `separatorColor` | Color | unset | |

**Item object**

| Key | Notes |
|---|---|
| `type` | Option: `"author"` `"date"` `"modified"` `"comments"` `"terms"` |
| `beforeText` | Optional prefix string |
| `link` | Boolean — link to author/archive/comments as applicable |
| `icon` | Option — typically `"default"` / none |
| `showAvatar` | Author only |
| `avatarSize` | Author only (number) |
| `dateFormat` | Date/modified only — Option (`default` or WP format) |
| `termsCount` / `termsSeparator` | Terms only |

```json
{
  "name": "blockish/post-info",
  "attributes": {
    "items": [
      { "type": { "value": "author", "label": "Author" }, "link": true, "icon": { "value": "default", "label": "Default" }, "showAvatar": false },
      { "type": { "value": "date", "label": "Date" }, "link": true, "icon": { "value": "default", "label": "Default" }, "dateFormat": { "value": "default", "label": "Default" } }
    ]
  }
}
```
