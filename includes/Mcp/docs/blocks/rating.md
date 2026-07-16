### `blockish/rating`

A star/icon rating display. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `rating` | Scalar (number) | `5` | Decimals allowed |
| `ratingScale` | Scalar (integer) | `5` | Typically `5` or `10` |
| `icon` | Icon | star icon | |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `iconSize` | Responsive | `{"Desktop":"24px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-rating-icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `iconSpacing` | Responsive | `{"Desktop":"6px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-rating-icons` -> `gap: {{VALUE}};` |
| `iconColor` | Color | unset | Filled/active <br>**CSS:** `.{{WRAPPER}} .blockish-rating-icon-fill svg` -> `fill: {{VALUE}};` |
| `unmarkedColor` | Color | unset | Unfilled <br>**CSS:** `.{{WRAPPER}} .blockish-rating-icon-base svg` -> `fill: {{VALUE}};` |

Minimal schema:
```json
{ "name": "blockish/rating", "attributes": { "rating": 4.5 } }
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-rating">
  
  <div class="blockish-rating-icons">
    <!-- Renders a loop of `ratingScale` number of icons -->
    <!-- The inline style `--blockish-rating-fill` sets the fill percentage (e.g. 100%, 50%, or 0%) for each icon to support fractional ratings. -->
    <span class="blockish-rating-icon" style="--blockish-rating-fill: 100%;" aria-hidden="true">
      
      <!-- Base (empty) icon -->
      <span class="blockish-rating-icon-base">
        <svg width="24" height="24" fill="currentColor">...</svg>
      </span>
      
      <!-- Filled icon, clipped by the CSS variable to show fractional values -->
      <span class="blockish-rating-icon-fill">
        <svg width="24" height="24" fill="currentColor">...</svg>
      </span>

    </span>
  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-rating {
	.blockish-rating-icons {
		display: inline-flex;
		align-items: center;
		gap: 6px;
	}

	.blockish-rating-icon {
		line-height: 1;
		display: inline-grid;
		place-items: center;
	}

	.blockish-rating-icon-base,
	.blockish-rating-icon-fill {
		grid-area: 1 / 1;
		display: inline-flex;
	}

	.blockish-rating-icon-fill {
		clip-path: inset(
			0 calc(100% - var(--blockish-rating-fill, 0%)) 0 0
		);
	}

	.blockish-rating-icon-base svg,
	.blockish-rating-icon-fill svg {
		width: 24px;
		height: 24px;
	}

	.blockish-rating-icon-fill svg {
		fill: #f5c518;
	}

	.blockish-rating-icon-base svg {
		fill: #d0d5dd;
	}
}
```
