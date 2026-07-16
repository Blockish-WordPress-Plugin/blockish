### `blockish/navigation`

Top-level navigation wrapper that orchestrates a responsive site header. It handles the structural switching between a desktop navigation menu (`blockish/navmenu`) and a mobile-friendly slide-in offcanvas drawer (`blockish/offcanvas`) based on a specified breakpoint. This block acts as the primary container ensuring seamless transition between desktop and mobile layouts for site navigation. **Accepts children: yes** (only `blockish/navmenu` and `blockish/offcanvas`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|

| `menuBreakpoint` | Scalar (string) | `"tablet"` | `"tablet"` (collapse ≤1024px) `"mobile"` (collapse ≤768px) `"custom"` (use `menuCustomBreakpoint`) — below this width the desktop `navmenu` hides and the `offcanvas` hamburger shows |
| `menuCustomBreakpoint` | Scalar (number, px) | `1024` | Max-width threshold, used when `menuBreakpoint` = `"custom"` |
| `justifyContent` | Responsive-Option | unset | Options: `[{"label":"Start","value":"flex-start"},{"label":"Center","value":"center"},{"label":"End","value":"flex-end"},{"label":"Space Between","value":"space-between"}]` — horizontal placement of the menu/hamburger row <br>**CSS:** `.{{WRAPPER}} .blockish-navigation-inner` -> `justify-content: {{VALUE}};` |
| `anchor` | Scalar (string) | unset | WP-core HTML `id`. See §7.1. |
| `align` | Scalar (string) | unset | `"wide"` `"full"`. See §7.1. |

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- `data-menu-breakpoint` specifies when the nav collapses ('tablet', 'mobile', or 'custom'). -->
<!-- `data-custom-breakpoint` holds the custom width value if breakpoint is 'custom'. -->
<div class="blockish-navigation" data-menu-breakpoint="tablet" data-custom-breakpoint="">
  
  <div class="blockish-navigation-inner">
    <!-- Inner blocks (typically `blockish/navmenu` and `blockish/offcanvas`) are rendered directly here -->
    ...
  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
// Shared collapsed state: hide the desktop nav, let the offcanvas fill the
// row (so its hamburger alignment works), and force the hamburger visible
// (overrides the offcanvas's own desktop-hidden rule below).
@mixin blockish-navigation-collapsed {
	.blockish-navmenu {
		display: none;
	}

	.blockish-offcanvas {
		flex: 1;
	}

	.blockish-offcanvas-hamburger {
		display: inline-flex;
	}
}

.blockish-navigation {
	// The offcanvas panel inside this wrapper is `position: fixed`. Blockish's
	// global identity `transform` on this wrapper would otherwise make it the
	// containing block for that fixed panel (pinning it to this box instead of
	// the viewport), so neutralize it here too — same reason as in the
	// offcanvas block's own stylesheet.
	&,
	&:hover {
		transform: none !important;
	}

	.blockish-navigation-inner {
		display: flex;
		align-items: center;
		gap: 12px;
	}

	// Desktop: the offcanvas is present but its trigger is hidden (only the
	// desktop nav shows). The 3-class selector beats the offcanvas block's
	// own `.blockish-offcanvas .blockish-offcanvas-hamburger { display: flex }`
	// default, so the offcanvas still works standalone outside this wrapper.
	&:not( .is-collapsed ) .blockish-offcanvas-hamburger {
		display: none;
	}

	// Collapsed (mobile) — applied by view.js (matchMedia) so it also covers
	// the dynamic "custom" breakpoint.
	&.is-collapsed {
		@include blockish-navigation-collapsed;
	}

	// Pre-JS fallback for the fixed breakpoints so there's no flash of the
	// desktop menu before view.js runs. "Custom" has no static width, so it
	// still relies on the JS is-collapsed toggle above. These come after the
	// :not(.is-collapsed) rule so they win on source order at equal specificity.
	@media ( max-width: 1024px ) {
		&[data-menu-breakpoint='tablet'] {
			@include blockish-navigation-collapsed;
		}
	}

	@media ( max-width: 768px ) {
		&[data-menu-breakpoint='mobile'] {
			@include blockish-navigation-collapsed;
		}
	}
}
```



