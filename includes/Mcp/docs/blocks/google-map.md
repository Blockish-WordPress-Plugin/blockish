### `blockish/google-map`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `location` | Scalar (string) | `"New York, NY"` | Always override |
| `zoom` | Scalar (integer) | `14` | `1` (world) – `20` (building) |
| `mapHeight` | Scalar (string, CSS length) | `"360px"` | |
| `mapCSSFiltersNormal` | Stringified-JSON (CSS Filters) | unset | |
| `mapCSSFiltersHover` | Stringified-JSON (CSS Filters) | unset | |
| `mapHoverTransition` | Scalar (number, seconds) | unset | |

Minimal schema:
```json
{
  "name": "blockish/google-map",
  "attributes": { "location": "1600 Amphitheatre Parkway, Mountain View, CA", "zoom": 14 }
}
```

---

