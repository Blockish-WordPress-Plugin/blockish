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

**Frontend Markup Structure (from `save.js`):**
```jsx
<div {...blockProps}>
			<div className={clsx('blockish-block-tab-layout', directionClass)}>
				<div
					className="blockish-block-tab-nav"
					role="tablist"
					aria-label="Tabs"
				/>
				<div {...innerBlocksProps} />
			</div>
		</div>
```
*Note: The actual HTML tag might be dynamic (e.g., `div`, `section`). A unique class `bb-[hash]` and `blockish-block-wrapper` are automatically injected server-side.*

**CSS Generation & Injection:**
Dynamic CSS is generated by `includes/Core/StyleGenerator.php` and injected in the `<head>` or footer as inline styles.



