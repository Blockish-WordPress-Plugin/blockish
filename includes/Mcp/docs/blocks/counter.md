### `blockish/counter`

An animated counting number. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `startNumber` | Scalar (number) | `0` | |
| `endNumber` | Scalar (number) | `100` | |
| `numberPrefix` | Scalar (string) | `""` | |
| `numberSuffix` | Scalar (string) | `""` | |
| `animationDuration` | Scalar (number, seconds) | `2` | |
| `thousandSeparator` | Scalar (boolean) | `true` | `true` → `1,000`; `false` → `1000` |
| `separator` | Option | `{"label":"Default","value":"default"}` | Only shown/used when `thousandSeparator` is `true`. `Default (,)`/`default` · `Dot (.)`/`dot` · `Space`/`space` · `Underscore (_)`/`underscore` · `Apostrophe (')`/`apostrophe` |
| `title` | Scalar (string) | `"Cool Number"` | |
| `titleTag` | Option | `{"label":"H3","value":"h3"}` | Same enum as heading's `tag` (§Heading): `h1`–`h6`, `p`, `span`, `div` |
| `titlePosition` | Scalar (string) | `"before"` | `"before"` (above number) `"after"` (below) `"start"` (left, in a row) `"end"` (right, in a row) — `"start"`/`"end"` also enable `titleVerticalAlignment` |
| `titleHorizontalAlignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `titleVerticalAlignment` | Responsive | `{"Desktop":"center"}` | `"top"` `"center"` `"bottom"` |
| `titleGap` | Responsive | `{"Desktop":"8px"}` | |
| `numberPosition` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` |
| `numberTextColor` | Color | unset | |
| `numberTypography` | Stringified-JSON (Typography) | unset | |
| `titleTextColor` | Color | unset | |
| `titleTypography` | Stringified-JSON (Typography) | unset | |

Minimal schema:
```json
{
  "name": "blockish/counter",
  "attributes": { "endNumber": 500, "numberSuffix": "+", "title": "Happy Clients" }
}
```

---

