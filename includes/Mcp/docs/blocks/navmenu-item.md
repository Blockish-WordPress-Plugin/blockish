### `blockish/navmenu-item`

A single menu link. Must be a child of `blockish/navmenu` or `blockish/offcanvas`. **Accepts children: no.** Does **not** support `anchor`.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `label` | Scalar (string, HTML allowed) | `""` | Link text (bold/italic allowed) |
| `url` | Scalar (string, URL) | unset | Plain href, e.g. `"/about"` or `"https://…"`. (Internal `linkId`/`linkKind`/`linkType` exist for WP-entity links set via the editor UI — don't set them yourself; just use `url`.) |
| `openInNewTab` | Scalar (boolean) | `false` | |
| `rel` | Scalar (string) | `""` | `rel` attribute, space-separated |
| `description` | Scalar (string) | `""` | Optional sub-text (theme-dependent) |
| `icon` | Icon | unset | Optional icon next to the label |
| `iconPosition` | Scalar (string) | `"left"` | `"left"` (before label) `"right"` (after) |
| `iconSize` | Responsive (length) | unset | |
| `itemTextColor` | Color | unset | Per-item text override (normal) — use to style one item as a button (combine with the global Advanced `background`/`border`/`padding`) |
| `itemTextColorHover` | Color | unset | Per-item text override (hover) |
| `itemTypography` | Stringified-JSON (Typography) | unset | Per-item typography override |

---

