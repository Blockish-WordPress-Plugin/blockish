### `blockish/social-icons`

**Accepts children: yes** (only `blockish/social-icon-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `shape` | Scalar (string) | `"circle"` | `"circle"` `"square"` `"rounded"` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `justify-content: {{VALUE}};` |
| `columns` | Responsive | `{"Desktop":"auto-fit"}` | `"auto-fit"` or an integer. <br>**Warning:** If placed inside a `blockish/container` with auto grid layout (`gridLayoutType: "auto"`), `"auto-fit"` will cause the icons to collapse. Set `columns` to an explicit integer instead. <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-social-icons-columns: {{VALUE}};` |
| `iconColorMode` | Scalar (string) | `"official"` | `"official"` (brand colors) `"custom"` (use `iconColor`) |
| `iconColor` | Color | unset | Active when `iconColorMode` = `"custom"` <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-social-icons-primary-color: {{VALUE}};` |
| `iconSecondaryColor` | Color | `"#FFFFFF"` | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-social-icons-secondary-color: {{VALUE}};` |
| `iconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-social-icon-item__icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `iconPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-social-icon-item__link` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `iconSpacing` | Responsive | `{"Desktop":"12px"}` | <br>**CSS:** `.{{WRAPPER}}` -> `column-gap: {{VALUE}};` |
| `iconRowsGap` | Responsive | `{"Desktop":"12px"}` | <br>**CSS:** `.{{WRAPPER}}` -> `row-gap: {{VALUE}};` |
| `iconBorder` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-social-icon-item__link` |
| `iconBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-social-icon-item__link` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `hoverAnimation` | Scalar (string) | `"none"` | `"none"` `"float"` `"sink"` `"grow"` `"spin"` `"pulse"` <br>**CSS:** `.{{WRAPPER}} .blockish-social-icon-item__link:hover` -> `animation-name: {{VALUE}};` |

Minimal schema:
```json
{
  "name": "blockish/social-icons",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/social-icon-item", "attributes": { "network": "instagram", "label": "Instagram", "officialColor": "#E1306C", "link": { "url": "https://instagram.com/username", "newTab": true } } }
  ]
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- `shape-{shape}` sets `shape-square`, `shape-rounded`, or `shape-circle`. -->
<!-- `is-color-{colorMode}` sets `is-color-custom` or `is-color-official`. -->
<ul class="blockish-social-icons shape-[shape] is-color-[colorMode]">
  
  <!-- Inner blocks (blockish/social-icon) are rendered directly here -->
  ...

</ul>
```

**Base CSS (`style.scss`):**
```scss
.blockish-social-icons {
	display: grid;
	grid-template-columns: repeat(
		var(--blockish-social-icons-columns, auto-fit),
		minmax(0, max-content)
	);
	align-items: center;
	list-style: none;
	margin: 0;
	padding: 0;
	column-gap: 12px;
	row-gap: 12px;

	&.is-color-official {
		.blockish-social-icon-item__link {
			background-color: var(--blockish-social-icon-official-color, #2563eb);
		}
	}

	&.is-color-custom {
		.blockish-social-icon-item__link {
			background-color: var(--blockish-social-icons-primary-color, #111827);
		}
	}

	&.shape-square {
		.blockish-social-icon-item__link {
			border-radius: 0;
		}
	}

	&.shape-rounded {
		.blockish-social-icon-item__link {
			border-radius: 8px;
		}
	}

	&.shape-circle {
		.blockish-social-icon-item__link {
			border-radius: 999px;
		}
	}

	.blockish-social-icon-item {
		margin: 0;
		padding: 0;
		list-style: none;
	}

	.blockish-social-icon-item__link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		padding: 10px;
		color: var(--blockish-social-icons-secondary-color, #ffffff);
		border: 0;
		line-height: 1;
		text-decoration: none;
		animation-duration: 0.6s;
		animation-fill-mode: both;
	}

	.blockish-social-icon-item__icon {
		display: inline-flex;
		line-height: 1;
	}

	.blockish-social-icon-item__icon svg {
		width: 18px;
		height: 18px;
		fill: currentColor;
	}
}

:where(.blockish-social-icons){
	width: 100%;
}
```
