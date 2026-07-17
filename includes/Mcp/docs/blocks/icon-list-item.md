### `blockish/icon-list-item`

Must be a child of `blockish/icon-list`. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `text` | Scalar (string, HTML allowed) | `"Icon list item"` | |
| `icon` | Icon | star icon | |
| `link` | Link | unset | |
| `iconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item .blockish-icon-list-item-link .blockish-icon-list-item-icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `iconColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item .blockish-icon-list-item-link .blockish-icon-list-item-icon svg` -> `fill: {{VALUE}};` |
| `iconHoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item:hover .blockish-icon-list-item-link .blockish-icon-list-item-icon svg` -> `fill: {{VALUE}};` |
| `textColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item .blockish-icon-list-item-link .blockish-icon-list-item-text` -> `color: {{VALUE}};` |
| `textHoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item:hover .blockish-icon-list-item-link .blockish-icon-list-item-text` -> `color: {{VALUE}};` |
| `iconHoverTransition` | Scalar (number, seconds) | `0.2` | <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item` -> `--blockish-icon-list-item-icon-hover-transition: {{VALUE}}s;` |
| `textHoverTransition` | Scalar (number, seconds) | `0.2` | <br>**CSS:** `.{{WRAPPER}}.blockish-icon-list-item` -> `--blockish-icon-list-item-text-hover-transition: {{VALUE}}s;` |

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<li class="blockish-icon-list-item">
  
  <!-- Wrapper is <a> if link is provided, otherwise it defaults to <span> -->
  <a class="blockish-icon-list-item-link" href="..." target="_blank" rel="noopener noreferrer">
    
    <span class="blockish-icon-list-item-icon" aria-hidden="true">
      <!-- The icon <svg> is ONLY rendered if `icon` attribute exists AND has both `viewBox` and `path` -->
      <svg width="20" height="20" fill="currentColor">...</svg>
    </span>

    <span class="blockish-icon-list-item-text">
      List Item Text
    </span>

  </a>

</li>
```

**Base CSS (`style.scss`):**
```scss
.blockish-icon-list-item.blockish-icon-list-item {
	--blockish-icon-list-item-icon-hover-transition: 0.2s;
	--blockish-icon-list-item-text-hover-transition: 0.2s;

	.blockish-icon-list-item-link {
		color: inherit;
	}

	.blockish-icon-list-item-icon {
		line-height: 1;
		display: inline-flex;
	}

	.blockish-icon-list-item-link .blockish-icon-list-item-icon svg {
		transition-property: fill, color;
		transition-timing-function: ease;
		transition-duration: var(
			--blockish-icon-list-item-icon-hover-transition
		);
	}

	.blockish-icon-list-item-link .blockish-icon-list-item-text {
		transition-property: color, fill;
		transition-timing-function: ease;
		transition-duration: var(
			--blockish-icon-list-item-text-hover-transition
		);
	}
}
```



