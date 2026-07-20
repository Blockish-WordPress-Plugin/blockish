### `blockish/tab`

**Accepts children: yes** (only `blockish/tab-item`).

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `direction` | Responsive | `{"Desktop":"column"}` | `"column"` (nav on top) `"row"` (nav on side) <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-layout` -> `flex-direction: {{VALUE}};` |
| `defaultActiveTab` | Scalar (integer) | `0` | Zero-based index — must match the `tab-item` with `defaultActive: true` |
| `justify` | Responsive | `{"Desktop":"flex-start"}` | `"flex-start"` `"center"` `"flex-end"` `"space-between"` <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-nav` -> `justify-content: {{VALUE}};` |
| `alignTitle` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger-title` -> `text-align: {{VALUE}};` |
| `navGap` | Responsive | `{"Desktop":"10px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-nav` -> `gap: {{VALUE}};` |
| `distanceFromContent` | Responsive | `{"Desktop":"10px"}` | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-layout` -> `gap: {{VALUE}};` |
| `navAlign` | Responsive | `{"Desktop":"stretch"}` | `"stretch"` `"flex-start"` `"center"` `"flex-end"` <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-nav` -> `align-self: {{VALUE}};` |
| `navBackground` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-tab-nav` |
| `navBorder` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-block-tab-nav` |
| `navBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-nav` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `navPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-nav` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `iconPosition` | Responsive | `{"Desktop":"row"}` | `"row"` (icon left) `"row-reverse"` (icon right) <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger` -> `flex-direction: {{VALUE}};` |
| `tabsBackgroundNormal` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-tab-trigger` |
| `tabsBackgroundHover` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-tab-trigger:hover` |
| `tabsBackgroundActive` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-tab-trigger[aria-selected='true']` |
| `tabsBorderNormal` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-block-tab-trigger` |
| `tabsBorderActive` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-block-tab-trigger[aria-selected='true']` |
| `tabsBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `tabsPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `titleTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-block-tab-trigger-title` |
| `titleColorNormal` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger-title` -> `color: {{VALUE}};` |
| `titleColorHover` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger:hover .blockish-block-tab-trigger-title` -> `color: {{VALUE}};` |
| `titleColorActive` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger[aria-selected='true'] .blockish-block-tab-trigger-title` -> `color: {{VALUE}};` |
| `iconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger-icon svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `iconColorNormal` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger-icon` -> `color: {{VALUE}};` |
| `iconColorActive` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-trigger[aria-selected='true'] .blockish-block-tab-trigger-icon` -> `color: {{VALUE}};` |
| `contentBackground` | Stringified-JSON (Background) | unset | <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-block-tab-item` |
| `contentColor` | Color | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-item` -> `color: {{VALUE}};` |
| `contentBorder` | Stringified-JSON (Border) | unset | <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-block-tab-item` |
| `contentBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-item` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `contentPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-block-tab-item` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |

Minimal schema:
```json
{
  "name": "blockish/tab",
  "attributes": {},
  "innerBlocks": [
    { "name": "blockish/tab-item", "attributes": { "title": "Overview", "defaultActive": true }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Overview content here." } } ] },
    { "name": "blockish/tab-item", "attributes": { "title": "Features" }, "innerBlocks": [ { "name": "core/paragraph", "attributes": { "content": "Features content here." } } ] }
  ]
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-block-tab" data-default-tab="0">
  
  <div class="blockish-block-tab-layout is-direction-{direction}">
    
    <!-- Tab Navigation (Buttons generated dynamically by view.js based on inner items) -->
    <div class="blockish-block-tab-nav" role="tablist" aria-label="Tabs">
      <!-- Generated by view.js on frontend: -->
      <!--
      <button type="button" class="blockish-block-tab-trigger" role="tab" aria-selected="true" tabindex="0">
        <span class="blockish-block-tab-trigger-icon" aria-hidden="true"><svg>...</svg></span>
        <span class="blockish-block-tab-trigger-title">Tab 1</span>
      </button>
      -->
    </div>

    <!-- Tab Panels (Inner blocks: blockish/tab-item) -->
    <div class="blockish-block-tab-items">
      <!-- Inner blocks are rendered here -->
      ...
    </div>

  </div>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-block-tab {
	--blockish-tab-border-color: #d1d5db;
	--blockish-tab-text-color: #111827;
	--blockish-tab-bg: #ffffff;
	--blockish-tab-panel-bg: #ffffff;
	--blockish-tab-active-bg: #111827;
	--blockish-tab-active-color: #ffffff;
	--blockish-tab-gap: 10px;

	.blockish-block-tab-layout {
		display: flex;
		flex-direction: column;
		gap: var(--blockish-tab-gap);
	}

	& .blockish-block-tab-layout.is-direction-column {
		flex-direction: column;
	}

	& .blockish-block-tab-layout.is-direction-column-reverse {
		flex-direction: column-reverse;
	}

	& .blockish-block-tab-layout.is-direction-row {
		align-items: stretch;
		flex-direction: row;
	}

	& .blockish-block-tab-layout.is-direction-row-reverse {
		align-items: stretch;
		flex-direction: row-reverse;
	}

	.blockish-block-tab-nav {
		display: flex;
		flex-wrap: wrap;
		gap: var(--blockish-tab-gap);
	}

	& .blockish-block-tab-layout.is-direction-row .blockish-block-tab-nav,
	& .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-nav {
		align-content: flex-start;
		align-self: stretch;
		flex: 0 0 auto;
		flex-direction: column;
		flex-wrap: nowrap;
		min-height: 0;
	}

	& .blockish-block-tab-layout.is-direction-row .blockish-block-tab-items,
	& .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-items {
		flex: 1 1 auto;
		min-height: 0;
		min-width: 0;
	}

	& .blockish-block-tab-layout.is-direction-row .blockish-block-tab-trigger,
	& .blockish-block-tab-layout.is-direction-row-reverse .blockish-block-tab-trigger {
		flex: 1 1 0;
	}

	.blockish-block-tab-trigger {
		align-items: center;
		background: var(--blockish-tab-bg);
		border: 1px solid var(--blockish-tab-border-color);
		border-radius: 6px;
		color: var(--blockish-tab-text-color);
		cursor: pointer;
		display: inline-flex;
		font: inherit;
		gap: 10px;
		justify-content: center;
		margin: 0;
		padding: 10px 14px;
	}

	.blockish-block-tab-trigger[aria-selected='true'] {
		background: var(--blockish-tab-active-bg);
		border-color: var(--blockish-tab-active-bg);
		color: var(--blockish-tab-active-color);
	}

	.blockish-block-tab-trigger-title {
		display: inline-block;
		line-height: 1.4;
		min-width: 0;
	}

	.blockish-block-tab-trigger-icon {
		display: inline-flex;
		line-height: 0;
	}

	.blockish-block-tab-trigger-icon svg {
		fill: currentColor;
	}

	.blockish-block-tab-item {
		background: var(--blockish-tab-panel-bg);
		border: 1px solid var(--blockish-tab-border-color);
		border-radius: 8px;
		height: 100%;
		padding: 16px;
	}
}
```



