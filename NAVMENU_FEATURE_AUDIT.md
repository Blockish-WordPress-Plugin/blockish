# Navmenu Feature Parity Audit — blockish vs gutenkit

Full re-read of all files in `gutenkit/src/blocks/nav-menu`, `nav-menu-item`, `nav-menu-submenu`
against the current `blockish/src/blocks/navmenu`, `navmenu-item`, `navmenu-submenu`.

## 1. blockish/navmenu vs gutenkit/nav-menu

### Wrong / misunderstood — needs fixing

- **"Menu Animation" is the wrong feature entirely.** In `gutenkit/nav-menu/settings.js` the
  `menuAnimation` control options are `None / Fade In Up / Transform / Transform Perspective /
  Rotate Y` — these are **submenu dropdown opening animations** (applied as a class on
  `.gkit-nav-menu`, consumed in `nav-menu-item/style.scss` via `.gkit-nav-menu.fadeInUp
  .wp-block-gutenkit-nav-menu-item > .gkit-nav-menu-submenu`, etc. — scaleY transform, 3D tilt,
  3D flip, or just repositioning before the hover-reveal). I built `menuAnimation` as
  **none/slide/fade for the offcanvas panel's open/close transition** instead. That's a
  different concept I invented. GutenKit's offcanvas slide-in is **fixed** (`left: -100vw` →
  `left: 0`, hardcoded transition, never user-configurable) — there is no "offcanvas animation"
  setting at all.
  - **Fix:** rename the concept. `menuAnimation` options become
    `none/fadeInUp/transform/transformPerspective/rotateY`, applied as a class on
    `.blockish-navmenu-nav`, with matching submenu-opening CSS (scaleY / 3D perspective tilt /
    3D flip / repositioned fade) in `navmenu-item/style.scss`. The offcanvas panel keeps a
    plain, fixed slide transition, not tied to this attribute.

- **Editor visibility of hamburger/close/overlay — I over-engineered this.** GutenKit has
  **no editor-specific override** forcing the hamburger to show or hide. The same dynamically
  generated responsive CSS (`GkitStyle`, real `@media` queries) is injected in both the editor
  and the frontend — if the editor canvas happens to be narrower than the breakpoint, the
  hamburger genuinely shows there too (and that's treated as a *feature*: shrink your editor
  canvas to preview mobile). I went back and forth between forcing it always-hidden,
  always-visible-with-nav, etc. — all of that was unnecessary. The fix is to **delete the
  editor-specific hide/show rules** and let `style.scss`'s real breakpoint CSS apply
  identically in the editor, exactly like the frontend.

### Present and structurally correct

- Hamburger + overlay + sidebar wrapper + close button markup (mine has an extra
  `.blockish-navmenu-wrapper-header` wrapping logo+close, GutenKit has `.gkit-nav-identity-panel`
  — same concept, fine)
- Tablet/Mobile/Custom breakpoint (custom needs JS matchMedia since CSS can't do a dynamic
  per-block media query — this part is correct, just shouldn't be editor-overridden as above)
- Scroll lock for offcanvas
- Justify Content / Align Items (responsive, correctly switched to Select since >3 options)
- Vertical Menu toggle
- Hamburger icon position (left/center/right) — GutenKit does this via `margin-left/right: auto`
  on a fixed-width button in normal block flow, not flexbox `justify-content`. Mechanism differs
  but the visual outcome is equivalent; not treating this as a bug.
- Mobile Menu Logo (upload, home/custom link, width/height/padding/margin)
- Item Normal/Hover/Active styling, item background/typography/border-radius/padding
- Hamburger Style panel (size, button width/height/radius, normal/hover bg/icon-color/border)
- Close Button Style panel (same set)
- "Start Blank" placeholder (their remote pattern-picker is intentionally not replicated — no
  backend for it)

### Confirmed intentionally out of scope (matches GutenKit's own boundaries)

- Remote pattern library (wpmet.com SaaS API — GutenKit-proprietary, no Blockish equivalent)
- Mega Menu (GutenKit Pro-gates this too)

## 2. blockish/navmenu-item vs gutenkit/nav-menu-item

### Present and correct

- Submenu add/remove via toolbar, chevron indicator shown only when a submenu child exists
- Submenu Indicator styling (icon size, left spacing, border, padding, border-radius) — matches
  `nav-menu-item/style.js` exactly (font-size/width/height/border/padding/border-radius/margin-left)
- `linkId`/`linkKind`/`linkType` captured from LinkControl (previously discarded — fixed)
- Editor-only broken-link indicator via `useEntityRecord`
- Active-item detection via `data-id` + body `page-id-X`/`postid-X` class (matches
  `nav-menu-item/frontend.js` exactly), with URL-compare fallback for custom links
- Nested (2nd level+) submenus open to the side (`left: 100%; top: 0`) — matches
  `nav-menu-item/style.scss`'s `.wp-block-gutenkit-nav-menu-submenu .gkit-nav-menu-submenu` rule
- Item Normal/Hover/Active typography and color

### Confirmed intentionally skipped (minor, non-functional gaps)

- `link-url-popover/get-suggestion-query.js`'s LinkControl suggestion-query filtering (only
  changes which search suggestions appear based on previously-selected link type) — core's
  default LinkControl behavior is already reasonable; this is UX polish, not a missing feature
- Custom submenu-indicator icon picker (GutenKit lets you swap the chevron SVG entirely via
  `GkitIconPicker`) — I kept a fixed chevron and only exposed size/spacing/border/padding/radius.
  This is a real, smaller gap, not yet built.

### Found this pass, not yet fixed

- Megamenu-specific class (`gkit-nav-menu-submenu-type-megamenu`) forces
  `position: static !important; transform: none !important;` — irrelevant since megamenu is
  out of scope (dropdown-only), no action needed.

## 3. blockish/navmenu-submenu vs gutenkit/nav-menu-submenu

### Present and correct (fixed this session after initially misreading it)

- Container width (responsive range)
- Alignment — corrected from "panel position" (wrong, invented) to `justify-content` on each
  item's own link row (`.gkit-nav-menu-link`), matching `nav-menu-submenu/style.js` line 67
  exactly
- Item gap (`gkitSubMenuItemSpaceBetween` → `itemGap`)
- Panel background/border/box-shadow/border-radius/padding
- Cascading Submenu Item styling (Normal/Hover/Active background/color/border, typography,
  padding, border-radius) applied via descendant selector to all child items

### Confirmed intentionally out of scope

- `appender-button.js` — same Inserter-with-custom-label pattern as nav-menu's; functionally
  identical to the default appender I use, just a different label. Not rebuilding for a label
  difference.

## Action items from this audit

1. Fix `menuAnimation`: change meaning from offcanvas-transition to submenu-dropdown-animation
   (none/fadeInUp/transform/transformPerspective/rotateY), move CSS to `navmenu-item/style.scss`
   targeting the submenu reveal, give the offcanvas panel a fixed non-configurable slide instead.
2. Delete `navmenu/editor.scss`'s hamburger/overlay/close/wrapper-header hide-show rules
   entirely (keep only the appender-positioning fix) — let `style.scss`'s real breakpoint CSS
   apply unmodified in the editor, exactly like GutenKit.
