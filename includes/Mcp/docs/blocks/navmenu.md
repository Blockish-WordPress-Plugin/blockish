### `blockish/navmenu`

The desktop menu row. Must be a child of `blockish/navigation`. **Accepts children: yes** (only `blockish/navmenu-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `isVertical` | Scalar (boolean) | `false` | Stack items vertically instead of in a row |
| `justifyContent` | Responsive-Option | e.g. `{"Desktop":{"label":"Start","value":"flex-start"}}` | Options: `[{"label":"Start","value":"flex-start"},{"label":"Center","value":"center"},{"label":"End","value":"flex-end"},{"label":"Space Between","value":"space-between"},{"label":"Space Around","value":"space-around"},{"label":"Space Evenly","value":"space-evenly"}]` <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-nav` -> `justify-content: {{VALUE}};` |
| `alignItems` | Responsive-Option | e.g. `{"Desktop":{"label":"Start","value":"flex-start"}}` | Options: `[{"label":"Start","value":"flex-start"},{"label":"Center","value":"center"},{"label":"End","value":"flex-end"},{"label":"Stretch","value":"stretch"}]` <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-nav` -> `align-items: {{VALUE}};` |
| `navGap` | Responsive (length) | unset | Gap between items <br>**CSS:** `.{{WRAPPER}} .blockish-navmenu-nav` -> `gap: {{VALUE}};` |
| `itemColorNormal` | Color | unset | Link text, normal <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item` -> `color: {{VALUE}};` |
| `itemColorHover` | Color | unset | Link text, hover <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item:hover` -> `color: {{VALUE}};` |
| `itemColorActive` | Color | unset | Link text, current-page item <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item.is-active` -> `color: {{VALUE}};` |
| `itemBgNormal` | Stringified-JSON (Background) | unset | Normal <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-navmenu-item` |
| `itemBgHover` | Stringified-JSON (Background) | unset | Hover <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-navmenu-item:hover` |
| `itemBgActive` | Stringified-JSON (Background) | unset | Current-page item <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-navmenu-item.is-active` |
| `itemTypography` | Stringified-JSON (Typography) | unset | Applies to all items <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-block-navmenu-item` |
| `itemBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `itemPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-navmenu-item` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The `is-vertical` class is conditionally added if `isVertical` attribute is true -->
<div class="blockish-navmenu [is-vertical]">
  
  <nav class="blockish-navmenu-nav" aria-label="Navigation">
    <!-- Inner blocks (blockish/navmenu-item) are rendered directly here -->
    ...
  </nav>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-navmenu {
	z-index: 5;

	.blockish-navmenu-nav {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		list-style: none;
		margin: 0;
		padding: 0;

		:where(&) {
			gap: 12px;
		}
	}

	&.is-vertical {
		.blockish-navmenu-nav {
			flex-direction: column;
			align-items: stretch;
		}
	}
}
```



