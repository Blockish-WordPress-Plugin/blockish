### `blockish/accordion-item`

Must be a child of `blockish/accordion`. **Accepts children: yes** (any blocks — this is the panel's content area).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Accordion item"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Same enum as heading's `tag` (§Heading) |
| `defaultOpen` | Scalar (boolean) | `false` | Set `true` on exactly one item to open it by default |
| `expandIcon` | Icon | plus icon | Shown while panel is collapsed |
| `collapseIcon` | Icon | minus icon | Shown while panel is expanded |
| `itemId` | Scalar (string) | auto-generated | Leave unset |

---

