### `blockish/navigation`

Top-level navigation wrapper that orchestrates a responsive site header. It handles the structural switching between a desktop navigation menu (`blockish/navmenu`) and a mobile-friendly slide-in offcanvas drawer (`blockish/offcanvas`) based on a specified breakpoint. This block acts as the primary container ensuring seamless transition between desktop and mobile layouts for site navigation. **Accepts children: yes** (only `blockish/navmenu` and `blockish/offcanvas`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|

| `menuBreakpoint` | Scalar (string) | `"tablet"` | `"tablet"` (collapse ≤1024px) `"mobile"` (collapse ≤768px) `"custom"` (use `menuCustomBreakpoint`) — below this width the desktop `navmenu` hides and the `offcanvas` hamburger shows |
| `menuCustomBreakpoint` | Scalar (number, px) | `1024` | Max-width threshold, used when `menuBreakpoint` = `"custom"` |
| `justifyContent` | Responsive-Option | unset | `"flex-start"` `"center"` `"flex-end"` `"space-between"` — horizontal placement of the menu/hamburger row |
| `anchor` | Scalar (string) | unset | WP-core HTML `id`. See §7.1. |
| `align` | Scalar (string) | unset | `"wide"` `"full"`. See §7.1. |

---

