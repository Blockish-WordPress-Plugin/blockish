### `blockish/icon-list`

A list of icon+text rows. **Accepts children: yes** (only `blockish/icon-list-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `layout` | Scalar (string) | `"column"` | `"column"` (stacked) `"row"` (horizontal) <br>**CSS:** `.{{WRAPPER}}` -> `flex-direction: {{VALUE}};` |
| `rowGap` | Responsive | `{"Desktop":"12px"}` | <br>**CSS:** `.{{WRAPPER}}` -> `row-gap: {{VALUE}};` |
| `columnGap` | Responsive | `{"Desktop":"12px"}` | Used when `layout` = `"row"` <br>**CSS:** `.{{WRAPPER}}` -> `column-gap: {{VALUE}};` |
| `itemPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item-link` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `itemContentSpacing` | Responsive | `{"Desktop":"10px"}` | Gap between icon and text <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item-link` -> `column-gap: {{VALUE}};` |
| `itemIconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item-icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `itemIconColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item-icon svg` -> `fill: {{VALUE}};` |
| `itemIconHoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item:hover .blockish-icon-list-item-icon svg` -> `fill: {{VALUE}};` |
| `itemIconHoverTransition` | Scalar (number, seconds) | `0.2` | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-icon-list-icon-hover-transition: {{VALUE}}s;` |
| `itemTextColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item-text` -> `color: {{VALUE}};` |
| `itemTextHoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}} .blockish-icon-list-item:hover .blockish-icon-list-item-text` -> `color: {{VALUE}};` |
| `itemTextHoverTransition` | Scalar (number, seconds) | `0.2` | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-icon-list-text-hover-transition: {{VALUE}}s;` |
| `itemTextTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-icon-list-item-text` |

Minimal schema:
```json
{
  "name": "blockish/icon-list",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/icon-list-item", "attributes": { "text": "Free forever plan" } }
  ]
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The `icon-list` block is just a `<ul>` wrapper. -->
<ul class="blockish-icon-list">
  
  <!-- Inner blocks (blockish/icon-list-item) are rendered directly here -->
  ...

</ul>
```

**Base CSS (`style.scss`):**
```scss
.blockish-icon-list {
	margin: 0;
	padding: 0;
	display: flex;
	flex-direction: column;
	flex-wrap: wrap;
	list-style: none;

	.blockish-icon-list-item {
		list-style: none;
	}

	.blockish-icon-list-item-link {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		text-decoration: none !important;
	}

	.blockish-icon-list-item-icon svg,
	.blockish-icon-list-item-text {
		transition-property: color, fill;
		transition-timing-function: ease;
	}

	.blockish-icon-list-item-icon svg {
		transition-duration: var(--blockish-icon-list-icon-hover-transition, 0.2s);
	}

	.blockish-icon-list-item-text {
		transition-duration: var(--blockish-icon-list-text-hover-transition, 0.2s);
	}
}
```
