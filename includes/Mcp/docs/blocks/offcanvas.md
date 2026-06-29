### `blockish/offcanvas`

The mobile slide-in drawer + hamburger trigger. Must be a child of `blockish/navigation`. **Accepts children: yes** (only `blockish/navmenu-item`) — but with `syncWithMenu: true` (default) leave `innerBlocks` empty; it mirrors the sibling `navmenu`.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `syncWithMenu` | Scalar (boolean) | `true` | When `true`, items are an auto-copied, locked mirror of the sibling `navmenu` — leave `innerBlocks` empty. Set `false` to give the drawer its own `navmenu-item` children. |
| `offcanvasSide` | Scalar (string) | `"left"` | `"left"` `"right"` — edge the panel slides from |
| `offcanvasAnimation` | Scalar (string) | `"slide"` | `"slide"` `"fade"` `"slideFade"` `"scale"` |
| `hamburgerIcon` | Icon | unset | Custom trigger icon; unset = default three-bar icon |
| `hamburgerAlign` | Scalar (string) | `"left"` | `"left"` `"center"` `"right"` — position of the hamburger button |
| `hamburgerColor` | Color | unset | |
| `hamburgerSize` | Responsive (length) | unset | Sets button width+height |
| `headerType` | Scalar (string) | `"siteTitle"` | Panel header content: `"none"` `"siteTitle"` (live WP title) `"siteLogo"` (live theme logo) `"customImage"` (use `headerImage`) `"customText"` (use `headerText`) |
| `headerText` | Scalar (string) | `""` | Used when `headerType` = `"customText"` |
| `headerImage` | Image | unset | Used when `headerType` = `"customImage"` |
| `headerLogoWidth` | Responsive (length) | unset | For `siteLogo`/`customImage` |
| `headerBg` | Stringified-JSON (Background) | unset | Panel header |
| `headerPadding` | Spacing | unset | Panel header |
| `headerBorder` | Stringified-JSON (Border) | unset | Panel header divider |
| `headerTitleColor` | Color | unset | Title/text color |
| `headerTitleTypography` | Stringified-JSON (Typography) | unset | |
| `panelBg` | Stringified-JSON (Background) | unset | Drawer panel |
| `panelWidth` | Responsive (length) | unset | Drawer width (default `min(320px, 85vw)`) |
| `panelPadding` | Spacing | unset | |
| `overlayBg` | Color | unset | Dimmed backdrop |
| `closeIconColor` | Color | unset | Close button, normal |
| `closeIconColorHover` | Color | unset | Close button, hover |
| `closeBgNormal` | Stringified-JSON (Background) | unset | |
| `closeBgHover` | Stringified-JSON (Background) | unset | |
| `closeSize` | Responsive (length) | unset | Close button width+height |
| `closeIconSize` | Responsive (length) | unset | Close glyph font-size |
| `closeBorderRadius` | Border-Radius | unset | |
| `itemColorNormal` | Color | unset | Drawer item text, normal |
| `itemColorHover` | Color | unset | Drawer item text, hover |
| `itemTypography` | Stringified-JSON (Typography) | unset | |
| `itemPadding` | Spacing | unset | |

---

