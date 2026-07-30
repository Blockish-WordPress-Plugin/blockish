### `blockish/offcanvas`

Mobile slide-in drawer + hamburger trigger. **Parent: `blockish/navigation` only.** **Accepts children: yes** — only `blockish/navmenu-item`. Dynamic block (`render.php`).

> [!WARNING]
> **Hard rule — no transform on the wrapper:** Do not apply CSS `transform` on the offcanvas root. Any transform makes it the containing block for the fixed panel/overlay and breaks viewport positioning (stylesheet forces `transform: none !important`).
>
> **Hard rule — sync:** With `syncWithMenu: true` (default), leave `innerBlocks` empty — items mirror the sibling `navmenu`. Set `false` only when the drawer should own its own `navmenu-item` children.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `syncWithMenu` | Scalar | `true` (default). Auto-mirrored locked copy of sibling navmenu items — leave children empty. |
| `offcanvasSide` | Scalar | `"left"` (default) \| `"right"` → class `offcanvas-side-*`. |
| `offcanvasAnimation` | Scalar | `"slide"` (default) \| `"fade"` \| `"slideFade"` \| `"scale"` → `offcanvas-animation-*`. |
| `hamburgerIcon` | Icon | Optional; unset = three-bar spans. Prefer `get-icons`. |
| `hamburgerAlign` | Scalar | `"left"` (default) \| `"center"` \| `"right"` → `hamburger-align-*`. |
| `headerType` | Scalar | `"siteTitle"` (default) \| `"none"` \| `"siteLogo"` \| `"customImage"` \| `"customText"`. |
| `headerText` | Scalar | Used when `headerType` is `"customText"`. |
| `headerImage` | Image | Used when `headerType` is `"customImage"` (`url` / `alt`). |
| `anchor` | Scalar | Optional HTML `id`. |

#### Markup

Default from `render.php` (`save.js` only serializes inner nav items):

```html
<div class="wp-block-blockish-offcanvas blockish-offcanvas offcanvas-animation-slide offcanvas-side-left hamburger-align-left">
  <button type="button" class="blockish-offcanvas-hamburger" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  <div class="blockish-offcanvas-overlay" aria-hidden="true"></div>
  <div class="blockish-offcanvas-panel">
    <div class="blockish-offcanvas-header">
      <div class="blockish-offcanvas-branding">
        <span class="blockish-offcanvas-site-title"><!-- blog name --></span>
      </div>
      <button type="button" class="blockish-offcanvas-close" aria-label="Close menu">&times;</button>
    </div>
    <nav class="blockish-offcanvas-nav" aria-label="Mobile navigation">
      <!-- navmenu-item innerBlocks (or synced mirror) -->
    </nav>
  </div>
</div>
```

| When | What changes |
|---|---|
| `offcanvasSide` / `offcanvasAnimation` / `hamburgerAlign` | Root modifier classes. |
| Custom `hamburgerIcon` | Hamburger gains `has-icon` + SVG instead of three spans. |
| `headerType: "none"` | Branding empty. |
| `headerType: "siteLogo"` | Theme custom logo `<img class="blockish-offcanvas-logo">` when set. |
| `headerType: "customImage"` | `<img class="blockish-offcanvas-logo">` from `headerImage`. |
| `headerType: "customText"` | Site-title span uses `headerText`. |
| Open state (view script) | Root `is-open`; `body.blockish-offcanvas-open`. |

#### Already-there CSS

```css
body.blockish-offcanvas-open {
  overflow: hidden;
}

.blockish-offcanvas,
.blockish-offcanvas:hover {
  transform: none!important;
}

.blockish-offcanvas {
  display: flex;
}

.blockish-offcanvas.hamburger-align-left {
  justify-content: flex-start;
}

.blockish-offcanvas.hamburger-align-center {
  justify-content: center;
}

.blockish-offcanvas.hamburger-align-right {
  justify-content: flex-end;
}

.blockish-offcanvas .blockish-offcanvas-hamburger {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  height: 44px;
  justify-content: center;
  padding: 10px;
  transition: background .15s ease;
  width: 44px;
}

.blockish-offcanvas .blockish-offcanvas-hamburger:hover {
  background: rgba(0,0,0,.06);
}

.blockish-offcanvas .blockish-offcanvas-hamburger span {
  background: currentColor;
  border-radius: 1px;
  display: block;
  height: 2px;
  width: 100%;
}

.blockish-offcanvas .blockish-offcanvas-hamburger.has-icon {
  gap: 0;
}

.blockish-offcanvas .blockish-offcanvas-hamburger.has-icon svg {
  display: block;
  fill: currentColor;
  height: 24px;
  width: 24px;
}

.blockish-offcanvas .blockish-offcanvas-overlay {
  background: rgba(0,0,0,.45);
  inset: 0;
  opacity: 0;
  position: fixed;
  transition: opacity .4s ease,visibility .4s ease;
  visibility: hidden;
  z-index: 1000010;
}

.blockish-offcanvas .blockish-offcanvas-panel {
  background: #fff;
  bottom: 0;
  box-shadow: 0 0 24px rgba(0,0,0,.15);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100%;
  overflow-y: auto;
  padding: 20px;
  pointer-events: none;
  position: fixed;
  top: 0;
  transition: transform .4s ease,opacity .4s ease,visibility .4s ease;
  visibility: hidden;
  width: min(320px,85vw);
  z-index: 1000011;
}

.blockish-offcanvas.offcanvas-side-left .blockish-offcanvas-panel {
  left: 0;
  right: auto;
}

.blockish-offcanvas.offcanvas-side-right .blockish-offcanvas-panel {
  left: auto;
  right: 0;
}

.blockish-offcanvas .blockish-offcanvas-header {
  align-items: center;
  border-bottom: 1px solid rgba(0,0,0,.08);
  display: flex;
  gap: 12px;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
}

.blockish-offcanvas .blockish-offcanvas-branding {
  align-items: center;
  display: inline-flex;
  min-width: 0;
}

.blockish-offcanvas .blockish-offcanvas-branding img {
  display: block;
  height: auto;
  max-width: 100%;
  width: 120px;
}

.blockish-offcanvas .blockish-offcanvas-branding .blockish-offcanvas-site-title {
  color: inherit;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.blockish-offcanvas .blockish-offcanvas-close {
  align-items: center;
  background: transparent;
  border: none;
  border-radius: 4px;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  font-size: 24px;
  height: 32px;
  justify-content: center;
  line-height: 1;
  transition: background .15s ease;
  width: 32px;
}

.blockish-offcanvas .blockish-offcanvas-close:hover {
  background: rgba(0,0,0,.06);
}

.blockish-offcanvas .blockish-offcanvas-nav {
  align-items: stretch;
  display: flex;
  flex-direction: column;
  list-style: none;
  margin: 0;
  padding: 0;
}

.blockish-offcanvas .blockish-block-navmenu-item {
  display: flex;
  width: 100%;
}

.blockish-offcanvas .blockish-block-navmenu-item .blockish-navmenu-item-link {
  align-items: center;
  border-radius: 4px;
  color: inherit;
  display: flex;
  padding: 12px 8px;
  text-decoration: none;
  transition: background .15s ease;
  white-space: normal;
  width: 100%;
}

.blockish-offcanvas .blockish-block-navmenu-item .blockish-navmenu-item-link:hover {
  background: rgba(0,0,0,.05);
}

.blockish-offcanvas:not(.is-open).offcanvas-animation-slide.offcanvas-side-left .blockish-offcanvas-panel,
.blockish-offcanvas:not(.is-open).offcanvas-animation-slideFade.offcanvas-side-left .blockish-offcanvas-panel {
  transform: translateX(-100%);
}

.blockish-offcanvas:not(.is-open).offcanvas-animation-slide.offcanvas-side-right .blockish-offcanvas-panel,
.blockish-offcanvas:not(.is-open).offcanvas-animation-slideFade.offcanvas-side-right .blockish-offcanvas-panel {
  transform: translateX(100%);
}

.blockish-offcanvas:not(.is-open).offcanvas-animation-fade .blockish-offcanvas-panel,
.blockish-offcanvas:not(.is-open).offcanvas-animation-slideFade .blockish-offcanvas-panel {
  opacity: 0;
}

.blockish-offcanvas:not(.is-open).offcanvas-animation-scale .blockish-offcanvas-panel {
  opacity: 0;
  transform: scale(.92);
  transform-origin: center;
}

.blockish-offcanvas.is-open .blockish-offcanvas-overlay {
  opacity: 1;
  visibility: visible;
}

.blockish-offcanvas.is-open .blockish-offcanvas-panel {
  pointer-events: auto;
  visibility: visible;
}
```

#### Minimal schema

```json
{
  "name": "blockish/offcanvas",
  "attributes": {
    "syncWithMenu": true
  },
  "innerBlocks": []
}
```
