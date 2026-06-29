### `blockish/rating`

A star/icon rating display. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `rating` | Scalar (number) | `5` | Decimals allowed |
| `ratingScale` | Scalar (integer) | `5` | Typically `5` or `10` |
| `icon` | Icon | star icon | |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `iconSize` | Responsive | `{"Desktop":"24px"}` | |
| `iconSpacing` | Responsive | `{"Desktop":"6px"}` | |
| `iconColor` | Color | unset | Filled/active |
| `unmarkedColor` | Color | unset | Unfilled |

Minimal schema:
```json
{ "name": "blockish/rating", "attributes": { "rating": 4.5 } }
```

---

