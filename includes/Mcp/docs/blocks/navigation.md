### `blockish/navigation`

Responsive nav wrapper that pairs a desktop `navmenu` with a mobile `offcanvas`, switching at a breakpoint. **Accepts children: yes** — only `blockish/navmenu` and `blockish/offcanvas`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `menuBreakpoint` | Scalar | `"tablet"` (default, ≤1024px) \| `"mobile"` (≤768px) \| `"custom"`. Written to `data-menu-breakpoint`. |
| `menuCustomBreakpoint` | Scalar | Default `1024`. Used only when `menuBreakpoint` is `"custom"` → `data-custom-breakpoint`. |
| `hasStarted` | Scalar | Editor bootstrap flag — leave unset / `true` after children exist; do not invent. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Typical children: one `blockish/navmenu` + one `blockish/offcanvas`. With offcanvas `syncWithMenu: true`, put menu items only under the navmenu.

#### Markup

Default:

```html
<div
  class="wp-block-blockish-navigation blockish-navigation"
  data-menu-breakpoint="tablet"
  data-custom-breakpoint=""
>
  <div class="blockish-navigation-inner">
    <!-- navmenu + offcanvas -->
  </div>
</div>
```

| When | What changes |
|---|---|
| `menuBreakpoint: "mobile"` / `"custom"` | `data-menu-breakpoint` updates. |
| `menuBreakpoint: "custom"` + `menuCustomBreakpoint` | `data-custom-breakpoint` set to that px value. |
| Collapsed (view / editor) | Root gains `is-collapsed` — hides `.blockish-navmenu`, shows offcanvas hamburger. |

Style with convert-css against `{{ROOT}} .blockish-navigation-inner` for justify/align — not invented chrome.

#### Already-there CSS

```css
.blockish-navigation,
.blockish-navigation:hover {
  transform: none!important;
}

.blockish-navigation .blockish-navigation-inner {
  align-items: center;
  display: flex;
  gap: 12px;
}

.blockish-navigation.is-collapsed .blockish-navmenu,
.blockish-navigation:not(.is-collapsed) .blockish-offcanvas-hamburger {
  display: none;
}

.blockish-navigation.is-collapsed .blockish-offcanvas {
  flex: 1;
}

.blockish-navigation.is-collapsed .blockish-offcanvas-hamburger {
  display: inline-flex;
}

@media(max-width:1024px) {
  .blockish-navigation[data-menu-breakpoint=tablet] .blockish-navmenu {
    display: none;
  }
  .blockish-navigation[data-menu-breakpoint=tablet] .blockish-offcanvas {
    flex: 1;
  }
  .blockish-navigation[data-menu-breakpoint=tablet] .blockish-offcanvas-hamburger {
    display: inline-flex;
  }
  ;
}

@media(max-width:768px) {
  .blockish-navigation[data-menu-breakpoint=mobile] .blockish-navmenu {
    display: none;
  }
  .blockish-navigation[data-menu-breakpoint=mobile] .blockish-offcanvas {
    flex: 1;
  }
  .blockish-navigation[data-menu-breakpoint=mobile] .blockish-offcanvas-hamburger {
    display: inline-flex;
  }
  ;
}
```

#### Minimal schema

```json
{
  "name": "blockish/navigation",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/navmenu",
      "attributes": {},
      "innerBlocks": [
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "Home", "url": "/" }
        },
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "Pricing", "url": "/pricing" }
        }
      ]
    },
    {
      "name": "blockish/offcanvas",
      "attributes": { "syncWithMenu": true },
      "innerBlocks": []
    }
  ]
}
```
