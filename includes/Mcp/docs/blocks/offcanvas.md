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

**Generated HTML Structure (from `render.php`):**
```html
<div class="blockish-offcanvas offcanvas-animation-{animation} offcanvas-side-{side} hamburger-align-{hamburgerAlign}">
  
  <!-- Hamburger button -->
  <!-- If `hamburgerIcon` is set, it renders the SVG and adds `has-icon` class. Otherwise, it renders 3 spans for the default icon. -->
  <button type="button" class="blockish-offcanvas-hamburger [has-icon]" aria-label="Toggle menu" aria-expanded="false">
    <span></span><span></span><span></span>
  </button>
  
  <!-- Overlay background -->
  <div class="blockish-offcanvas-overlay" aria-hidden="true"></div>
  
  <!-- The sliding/fading panel -->
  <div class="blockish-offcanvas-panel">
    
    <div class="blockish-offcanvas-header">
      <div class="blockish-offcanvas-branding">
        <!-- Renders site title, site logo, custom image, or custom text based on `headerType` -->
      </div>
      <button type="button" class="blockish-offcanvas-close" aria-label="Close menu">&times;</button>
    </div>
    
    <nav class="blockish-offcanvas-nav" aria-label="Mobile navigation">
      <!-- Inner blocks (e.g. blockish/navmenu-item) are rendered here -->
      ...
    </nav>

  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
// Lock page scroll while a panel is open (toggled on <body> by view.js).
body.blockish-offcanvas-open {
	overflow: hidden;
}

.blockish-offcanvas {
	// Blockish's global attributes stamp an (identity) `transform` on every
	// block wrapper by default. Any non-`none` transform makes an element the
	// containing block for its `position: fixed` descendants — which would pin
	// the panel/overlay to this small wrapper box (clipped, mis-sized) instead
	// of the viewport. Neutralize it so the fixed panel is truly viewport-fixed.
	&,
	&:hover {
		transform: none !important;
	}

	// Flex wrapper so the (only in-flow child) hamburger can be aligned.
	// The overlay/panel are position: fixed, so they're out of this flow.
	display: flex;

	&.hamburger-align-left {
		justify-content: flex-start;
	}

	&.hamburger-align-center {
		justify-content: center;
	}

	&.hamburger-align-right {
		justify-content: flex-end;
	}

	.blockish-offcanvas-hamburger {
		display: inline-flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		gap: 4px;
		width: 44px;
		height: 44px;
		padding: 10px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		cursor: pointer;
		transition: background 0.15s ease;

		&:hover {
			background: rgba( 0, 0, 0, 0.06 );
		}

		span {
			display: block;
			width: 100%;
			height: 2px;
			background: currentColor;
			border-radius: 1px;
		}

		// When a custom icon is picked the column bar layout is irrelevant —
		// just center the SVG.
		&.has-icon {
			gap: 0;

			svg {
				display: block;
				width: 24px;
				height: 24px;
				fill: currentColor;
			}
		}
	}

	// WordPress's own Popover (block toolbar) sits at z-index 1000000 in the
	// editor — clear it so the panel/overlay aren't hidden underneath.
	.blockish-offcanvas-overlay {
		position: fixed;
		inset: 0;
		background: rgba( 0, 0, 0, 0.45 );
		opacity: 0;
		visibility: hidden;
		transition: opacity 0.4s ease, visibility 0.4s ease;
		z-index: 1000010;
	}

	.blockish-offcanvas-panel {
		display: flex;
		flex-direction: column;
		position: fixed;
		top: 0;
		bottom: 0;
		width: min( 320px, 85vw );
		max-width: 100%;
		height: 100%;
		background: #fff;
		box-shadow: 0 0 24px rgba( 0, 0, 0, 0.15 );
		z-index: 1000011;
		overflow-y: auto;
		padding: 20px;
		visibility: hidden;
		pointer-events: none;
		transition: transform 0.4s ease, opacity 0.4s ease, visibility 0.4s ease;
	}

	// Which edge the panel attaches to.
	&.offcanvas-side-left .blockish-offcanvas-panel {
		left: 0;
		right: auto;
	}

	&.offcanvas-side-right .blockish-offcanvas-panel {
		right: 0;
		left: auto;
	}

	.blockish-offcanvas-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 16px;
		padding-bottom: 12px;
		border-bottom: 1px solid rgba( 0, 0, 0, 0.08 );
	}

	.blockish-offcanvas-branding {
		display: inline-flex;
		align-items: center;
		min-width: 0;

		img {
			display: block;
			max-width: 100%;
			height: auto;
			width: 120px;
		}

		.blockish-offcanvas-site-title {
			font-size: 18px;
			font-weight: 600;
			line-height: 1.2;
			color: inherit;
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}
	}

	.blockish-offcanvas-close {
		flex-shrink: 0;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border: none;
		border-radius: 4px;
		background: transparent;
		color: inherit;
		cursor: pointer;
		font-size: 24px;
		line-height: 1;
		transition: background 0.15s ease;

		&:hover {
			background: rgba( 0, 0, 0, 0.06 );
		}
	}

	.blockish-offcanvas-nav {
		display: flex;
		flex-direction: column;
		align-items: stretch;
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.blockish-block-navmenu-item {
		display: flex;
		width: 100%;

		.blockish-navmenu-item-link {
			display: flex;
			align-items: center;
			width: 100%;
			padding: 12px 8px;
			color: inherit;
			text-decoration: none;
			white-space: normal;
			border-radius: 4px;
			transition: background 0.15s ease;

			&:hover {
				background: rgba( 0, 0, 0, 0.05 );
			}
		}
	}

	&:not( .is-open ) {
		&.offcanvas-animation-slide,
		&.offcanvas-animation-slideFade {
			&.offcanvas-side-left .blockish-offcanvas-panel {
				transform: translateX( -100% );
			}

			&.offcanvas-side-right .blockish-offcanvas-panel {
				transform: translateX( 100% );
			}
		}

		&.offcanvas-animation-fade .blockish-offcanvas-panel,
		&.offcanvas-animation-slideFade .blockish-offcanvas-panel {
			opacity: 0;
		}

		&.offcanvas-animation-scale .blockish-offcanvas-panel {
			transform: scale( 0.92 );
			opacity: 0;
			transform-origin: center;
		}
	}

	&.is-open {
		.blockish-offcanvas-overlay {
			opacity: 1;
			visibility: visible;
		}

		.blockish-offcanvas-panel {
			visibility: visible;
			pointer-events: auto;
		}
	}
}
```



