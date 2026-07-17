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
| `iconSize` | Responsive (length) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-item-icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `itemTextColor` | Color | unset | Per-item text override (normal) — use to style one item as a button (combine with the global Advanced `background`/`border`/`padding`) <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-item-link` -> `color: {{VALUE}};` |
| `itemTextColorHover` | Color | unset | Per-item text override (hover) <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-item-link:hover` -> `color: {{VALUE}};` |
| `itemTypography` | Stringified-JSON (Typography) | unset | Per-item typography override <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-navmenu-item-link` |

---



### Markup & CSS Generation

**Generated HTML Structure (from `render.php`):**
```html
<div class="blockish-block-navmenu-item" data-id="123">
  
  <a class="blockish-navmenu-item-link [has-icon] [icon-position-right]" href="..." target="_blank" rel="noopener noreferrer">
    <!-- Icon rendered here if iconPosition is 'left' -->
    <span class="blockish-navmenu-item-icon" aria-hidden="true"><svg>...</svg></span>
    
    <span>Menu Item Label</span>
    
    <!-- Icon rendered here if iconPosition is 'right' -->
  </a>

  <!-- The following toggle button and inner content (blockish/navmenu-submenu) are ONLY rendered if the item has a submenu (inner blocks) -->
  <button type="button" class="blockish-navmenu-submenu-toggle" aria-expanded="false" aria-label="Show submenu for Menu Item Label">
    <svg class="blockish-navmenu-submenu-arrow">...</svg>
  </button>
  
  <!-- Submenu content rendered here -->
  ...
  
</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-block-navmenu-item {
	position: relative;
	color: currentColor;
	display: inline-flex;
	align-items: center;
	gap: 6px;

	.blockish-navmenu-item-link {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		color: inherit;
		text-decoration: none;
		border-radius: 4px;
		white-space: nowrap;
		transition: background 0.15s ease, color 0.15s ease;
	}

	.blockish-navmenu-item-icon {
		display: inline-flex;
		align-items: center;
		line-height: 0;
		flex-shrink: 0;

		svg {
			display: block;
			width: 18px;
			height: 18px;
			fill: currentColor;
		}
	}

	.blockish-navmenu-submenu-toggle {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		padding: 4px;
		background: none;
		border: none;
		color: inherit;
		cursor: pointer;

		&:focus-visible {
			outline: 2px solid currentColor;
			outline-offset: 1px;
		}
	}

	.blockish-navmenu-submenu-arrow {
		flex-shrink: 0;
		transition: transform 0.15s ease;
	}
}

@keyframes blockishSubmenuRotateY {
	0% {
		transform: rotateY( 90deg );
	}

	80% {
		transform: rotateY( -10deg );
	}

	100% {
		transform: rotateY( 0 );
	}
}
```



