### `blockish/accordion`

**Accepts children: yes** (only `blockish/accordion-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `maxItemExpanded` | Scalar (string) | `"one"` | `"one"` (single open panel) `"many"` (multiple allowed) |
| `faqSchema` | Scalar (boolean) | `false` | Adds `FAQPage` JSON-LD |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon right) `"row-reverse"` (icon left) <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-trigger` -> `flex-direction: {{VALUE}};` |
| `itemPosition` | Responsive | `{"Desktop":"start"}` | `"start"` `"center"` `"end"` <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-trigger` -> `justify-content: {{VALUE}};` |
| `itemsSpaceBetween` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-items` -> `row-gap: {{VALUE}};` |
| `distanceBetweenContent` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item` -> `gap: {{VALUE}};` |
| `accordionBackgroundNormal` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-accordion-item` |
| `accordionBorderNormal` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-accordion-item` |
| `accordionBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `accordionPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-trigger` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `headerTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-accordion-item-title-text` |
| `headerTextColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-title-text` -> `color: {{VALUE}};` |
| `headerTextColorHover` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item:hover .blockish-accordion-item-title-text` -> `color: {{VALUE}};` |
| `headerTextColorActive` | Color | unset | Active/open <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-details[open] .blockish-accordion-item-title-text` -> `color: {{VALUE}};` |
| `iconColor` | Color | unset | Toggle icon, normal <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-icon` -> `color: {{VALUE}};` |
| `iconColorHover` | Color | unset | Toggle icon, hover <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item:hover .blockish-accordion-item-icon` -> `color: {{VALUE}};` |
| `iconColorActive` | Color | unset | Toggle icon, active <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-details[open] .blockish-accordion-item-icon` -> `color: {{VALUE}};` |
| `iconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-icon svg` -> `width: {{TOP}}; height: {{TOP}};` |
| `contentBackground` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-accordion-item-content-inner` |
| `contentTextColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-content-inner` -> `color: {{VALUE}};` |
| `contentPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-accordion-item-content-inner` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |

Minimal schema:
```json
{
  "name": "blockish/accordion",
  "attributes": { "faqSchema": true },
  "innerBlocks": [
    { "name": "blockish/accordion-item", "attributes": { "title": "What is Blockish?", "defaultOpen": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Blockish is a Gutenberg block plugin." } } ] },
    { "name": "blockish/accordion-item", "attributes": { "title": "Is it free?" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Yes, the core plugin is free." } } ] }
  ]
}
```

(`maxItemExpanded` is omitted because `"one"` is already the default.)

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- `data-faq-schema` is "true" if `faqSchema` attribute is true, otherwise "false". -->
<!-- `data-max-expanded` is the value of `maxItemExpanded` attribute (default "one"). -->
<div class="blockish-accordion" data-faq-schema="false" data-max-expanded="one">
  
  <!-- Inner blocks (blockish/accordion-item) are rendered directly here -->
  ...

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-accordion {
	--blockish-accordion-border-color: #d1d5db;
	--blockish-accordion-icon-size: 18px;

	.blockish-accordion-items {
		display: grid;
	}

	.blockish-accordion-item-heading {
		margin: 0;
	}
	.blockish-accordion-item-panel {
		border: 0 solid var(--blockish-accordion-border-color);
		display: grid;
		grid-template-rows: minmax(0, 0fr);
		overflow: hidden;
		transition:
			grid-template-rows 0.3s ease,
			border-width 0.3s ease;
	}

	.blockish-accordion-item {
		box-sizing: border-box;
		display: flex;
		flex-direction: column;
		overflow: clip;
	}

	.blockish-accordion-item-content-inner {
		min-height: 0;
		overflow: hidden;
		padding: 16px;
	}

	.blockish-accordion-item-trigger {
		align-items: center;
		background: transparent;
		border: 1px solid var(--blockish-accordion-border-color);
		box-sizing: border-box;
		color: inherit;
		cursor: pointer;
		display: flex;
		flex-direction: row;
		gap: 14px;
		justify-content: start;
		padding: 18px 22px;
		position: relative;
		text-align: left;
		width: 100%;
	}

	.blockish-accordion-item-trigger:focus {
		outline: none;
	}

	.blockish-accordion-item-trigger:focus-visible {
		outline: 2px solid currentColor;
		outline-offset: 2px;
	}

	.blockish-accordion-item-heading {
		min-width: 0;
	}

	.blockish-accordion-item-title-text {
		display: block;
	}

	.blockish-accordion-item-trigger::-webkit-details-marker {
		display: none;
	}

	.blockish-accordion-item-trigger::marker {
		content: "";
	}

	.blockish-accordion-item-title-text {
		color: #111827;
		text-align: start;
	}

	.blockish-accordion-item-details[open] .blockish-accordion-item-title-text {
		color: #111827;
	}

	.blockish-accordion-item-icon {
		align-items: center;
		color: #111827;
		display: inline-flex;
		justify-content: center;
		line-height: 1;
	}

	.blockish-accordion-item-icon svg {
		fill: currentColor;
		height: var(--blockish-accordion-icon-size);
		width: var(--blockish-accordion-icon-size);
	}

	.blockish-accordion-item-details[open] .blockish-accordion-item-icon {
		color: #111827;
	}

	.blockish-accordion-item-icon[data-icon-state="open"] {
		display: none;
	}

	.blockish-accordion-item-icons {
		display: block;
		flex: 0 0 auto;
		line-height: 0;
	}

	.blockish-accordion-item-details[open]
		.blockish-accordion-item-icon[data-icon-state="open"] {
		display: inline-flex;
	}

	.blockish-accordion-item-details[open]
		.blockish-accordion-item-icon[data-icon-state="closed"] {
		display: none;
	}

	.blockish-accordion-item-details[open] + .blockish-accordion-item-panel {
		border-width: 0 1px 1px 1px;
		grid-template-rows: minmax(0, 1fr);
	}
}
```



