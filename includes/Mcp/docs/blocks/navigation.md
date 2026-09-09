### `blockish/navigation`

Responsive nav wrapper that pairs a desktop `navmenu` with a mobile `offcanvas`, switching at a breakpoint. **Accepts children: yes** — only `blockish/navmenu` and `blockish/offcanvas`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `menuBreakpoint` | Scalar | `"tablet"` (default, ≤1024px) \| `"mobile"` (≤768px) \| `"custom"`. Written to `data-menu-breakpoint`. |
| `menuCustomBreakpoint` | Scalar | Default `1024`. Used only when `menuBreakpoint` is `"custom"` → `data-custom-breakpoint`. |
| `hasStarted` | Scalar | Editor bootstrap flag — leave unset / `true` after children exist; do not invent. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Typical children: one `blockish/navmenu` + one `blockish/offcanvas`. With offcanvas `syncWithMenu: true`, put menu items (and nested `navmenu-submenu` / `navmenu-megamenu`) only under the navmenu — the drawer mirrors that tree as a mobile accordion.

Before staging headers: call `get-block-docs` for `navigation`, `navmenu`, `navmenu-item`, and (when used) `navmenu-submenu` / `navmenu-megamenu` / `offcanvas`.

> [!WARNING]
> **Hard rule — hamburger must not sit mid-header:** A common broken layout is `logo | nav (flex:1, centered) | CTA` with `space-between`. At the breakpoint the CTA hides but the **nav column still flex-grows in the middle**, so the offcanvas hamburger floats mid-bar with empty space on the right.
>
> When collapsed, the hamburger must read as **top-right** (or top-left if the design is intentionally left). Fix with Class Manager on the header, not by hoping `hamburgerAlign` alone moves it across columns:
> - At the nav breakpoint (usually `max-width: 1024px`): nav column `flex: 0 0 auto; margin-left: auto; justify-content: flex-end;` (or put `navigation` inside the right actions column).
> - Hide the empty actions column when its CTA is hidden (`display: none` on the actions wrapper, not only the button).
> - Prefer `hamburgerAlign: "right"` when the trigger lives on the right.
>
> Do **not** leave a centered `flex: 1` middle column as the only home for the hamburger.

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
  "attributes": {
    "menuBreakpoint": "tablet"
  },
  "innerBlocks": [
    {
      "name": "blockish/navmenu",
      "attributes": {
        "submenuTrigger": "hover",
        "submenuRevealAnimation": { "label": "Slide", "value": "slide" }
      },
      "innerBlocks": [
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "Home", "url": "/" }
        },
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "Products", "url": "/products" },
          "innerBlocks": [
            {
              "name": "blockish/navmenu-submenu",
              "attributes": { "positionAlign": "left" },
              "innerBlocks": [
                {
                  "name": "blockish/navmenu-item",
                  "attributes": { "label": "App", "url": "/app" }
                },
                {
                  "name": "blockish/navmenu-item",
                  "attributes": { "label": "API", "url": "/api" }
                }
              ]
            }
          ]
        },
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "Pricing", "url": "/pricing" }
        }
      ]
    },
    {
      "name": "blockish/offcanvas",
      "attributes": {
        "syncWithMenu": true,
        "offcanvasSide": "right",
        "hamburgerAlign": "right"
      },
      "innerBlocks": []
    }
  ]
}
```
