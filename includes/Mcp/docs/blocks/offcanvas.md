### `blockish/offcanvas`

The mobile slide-in drawer + hamburger trigger. Must be a child of `blockish/navigation`. **Accepts children: yes** (only `blockish/navmenu-item`) — but with `syncWithMenu: true` (default) leave `innerBlocks` empty; it mirrors the sibling `navmenu`.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `syncWithMenu` | Scalar (boolean) | `true` | When `true`, items are an auto-copied, locked mirror of the sibling `navmenu` — leave `innerBlocks` empty. Set `false` to give the drawer its own `navmenu-item` children. |
| `offcanvasSide` | Scalar (string) | `"left"` | `"left"` `"right"` — edge the panel slides from |
| `offcanvasAnimation` | Scalar (string) | `"slide"` | `"slide"` `"fade"` `"slideFade"` `"scale"` |
| `hamburgerIcon` | Icon | unset | Custom trigger icon; unset = default three-bar icon |
| `hamburgerAlign` | Scalar (string) | `"left"` | `"left"` `"center"` `"right"` — position of the hamburger button |
| `hamburgerColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-hamburger` -> `color: {{VALUE}};` |
| `hamburgerSize` | Responsive (length) | unset | Sets button width+height <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-hamburger` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `headerType` | Scalar (string) | `"siteTitle"` | Panel header content: `"none"` `"siteTitle"` (live WP title) `"siteLogo"` (live theme logo) `"customImage"` (use `headerImage`) `"customText"` (use `headerText`) |
| `headerText` | Scalar (string) | `""` | Used when `headerType` = `"customText"` |
| `headerImage` | Image | unset | Used when `headerType` = `"customImage"` |
| `headerLogoWidth` | Responsive (length) | unset | For `siteLogo`/`customImage` <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-branding img` -> `width: {{VALUE}};` |
| `headerBg` | Stringified-JSON (Background) | unset | Panel header <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-offcanvas-header` |
| `headerPadding` | Spacing | unset | Panel header <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-header` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `headerBorder` | Stringified-JSON (Border) | unset | Panel header divider <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-offcanvas-header` |
| `headerTitleColor` | Color | unset | Title/text color <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-branding .blockish-offcanvas-site-title` -> `color: {{VALUE}};` |
| `headerTitleTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-offcanvas-branding .blockish-offcanvas-site-title` |
| `panelBg` | Stringified-JSON (Background) | unset | Drawer panel <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-offcanvas-panel` |
| `panelWidth` | Responsive (length) | unset | Drawer width (default `min(320px, 85vw)`) <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-panel` -> `width: {{VALUE}};` |
| `panelPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-panel` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `overlayBg` | Color | unset | Dimmed backdrop <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-overlay` -> `background: {{VALUE}};` |
| `closeIconColor` | Color | unset | Close button, normal <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-close` -> `color: {{VALUE}};` |
| `closeIconColorHover` | Color | unset | Close button, hover <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-close:hover` -> `color: {{VALUE}};` |
| `closeBgNormal` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-offcanvas-close` |
| `closeBgHover` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-offcanvas-close:hover` |
| `closeSize` | Responsive (length) | unset | Close button width+height <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-close` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `closeIconSize` | Responsive (length) | unset | Close glyph font-size <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-close` -> `font-size: {{VALUE}};` |
| `closeBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-offcanvas-close` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `itemColorNormal` | Color | unset | Drawer item text, normal <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item` -> `color: {{VALUE}};` |
| `itemColorHover` | Color | unset | Drawer item text, hover <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item:hover` -> `color: {{VALUE}};` |
| `itemTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-block-navmenu-item` |
| `itemPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |

---



### Markup & CSS Generation

**Frontend Markup Structure (from `save.js`):**
```jsx
// Could not extract markup automatically.
// Please check save.js
```
*Note: The actual HTML tag might be dynamic (e.g., `div`, `section`). A unique class `bb-[hash]` and `blockish-block-wrapper` are automatically injected server-side.*

**CSS Generation & Injection:**
Dynamic CSS is generated by `includes/Core/StyleGenerator.php` and injected in the `<head>` or footer as inline styles.



