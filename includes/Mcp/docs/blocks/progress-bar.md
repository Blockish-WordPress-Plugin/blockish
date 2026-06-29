### `blockish/progress-bar`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `title` | Scalar (string) | `"Progress"` | |
| `titleTag` | Option | `{"label":"H4","value":"h4"}` | Same enum as heading's `tag` (§Heading) |
| `showTitle` | Scalar (boolean) | `true` | |
| `percentage` | Scalar (integer, 0–100) | `50` | |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `displayPercentage` | Scalar (boolean) | `true` | |
| `innerText` | Scalar (string) | placeholder text | Always override; replaces the percentage label when set |
| `percentageFillColor` | Color | unset | |
| `percentageBackgroundColor` | Color | unset | |
| `percentageHeight` | Responsive | unset | |
| `percentageBorderRadius` | Responsive | unset | |
| `titleTextColor` | Color | unset | |
| `innerTextColor` | Color | unset | |

Minimal schema:
```json
{
  "name": "blockish/progress-bar",
  "attributes": { "title": "JavaScript", "percentage": 85 }
}
```

---

