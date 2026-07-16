### `blockish/button`

A call-to-action link. **Accepts children: no.**

**Hard rule — check this every single time you place a button:** does this button need to be centered, right-aligned, or anything other than flush-left in its parent? If yes, you **must** set `buttonPlacement` on the button itself. Setting `alignItems`/`justifyContent` on the parent `blockish/container` has **no effect** on a button's position — that is the single most common mistake when placing buttons. There is no other attribute, on any block, that positions a button. If a button looks stuck on the left when it should be centered, the fix is always `buttonPlacement`, never a parent attribute.

**The button's own wrapper is hard-coded `width: 100%`** in its stylesheet (unlike other blocks, where the global `widthType` defaults to unset/auto-sizing). This is harmless for `buttonPlacement` (which works regardless), but if you instead need to move the button using `position`/`margin`/transform-style attributes, the 100% wrapper width will fight you. In that case set the global `widthType` to `{"value":"auto"}` on the button first — that emits an explicit `width: auto` that overrides the hard-coded 100%, only then will positioning attributes move the visible button rather than just shifting empty space.

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `text` | Scalar (string) | `"Click Here"` | |
| `url` | Link | unset | |
| `icon` | Icon | unset | |
| `iconPosition` | Scalar (string) | `"row"` | Options: `[{"value":"row-reverse","label":"Left"},{"value":"row","label":"Right"}]` — order of icon vs. text inside the button <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `flex-direction: {{VALUE}};` |
| `buttonPlacement` | Responsive-Option | unset | **Required whenever the button isn't meant to sit flush-left.** Options: `[{"value":"flex-start","label":"Left"},{"value":"center","label":"Center"},{"value":"flex-end","label":"Right"}]` — horizontal position of the **whole button** within its parent container. The parent's `alignItems`/`justifyContent` does NOT center a button; use this instead. Mobile-only centering: `{"Desktop":{"value":"flex-end"},"Mobile":{"value":"center"}}` <br>**CSS:** `.{{WRAPPER}}` -> `justify-content: {{VALUE}};` |
| `buttonAlignment` | Responsive-Option | unset | Options: `[{"value":"start","label":"Left"},{"value":"center","label":"Center"},{"value":"end","label":"Right"}]` — aligns the icon+text **inside** the button (text-align + justify-content on the inner link), independent of `buttonPlacement` <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `text-align: {{VALUE}}; justify-content: {{VALUE}};` |
| `buttonContentSpacing` | Responsive | unset | Gap between icon and text inside the button <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `gap: {{VALUE}};` |
| `buttonTextColor` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `color: {{VALUE}};` |
| `buttonHoverTextColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}} .blockish-button-link:hover` -> `color: {{VALUE}};` |
| `buttonBackground` | Stringified-JSON (Background) | unset | Normal <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-button-link` |
| `buttonHoverBackground` | Stringified-JSON (Background) | unset | Hover <br>**CSS:** Uses `BlockishBackground` on `.{{WRAPPER}} .blockish-button-link:hover` |
| `buttonBorder` | Stringified-JSON (Border) | unset | Normal <br>**CSS:** Uses `BlockishBorder` on `.{{WRAPPER}} .blockish-button-link` |
| `buttonHoverBorderColor` | Color | unset | Hover border color override <br>**CSS:** `.{{WRAPPER}} .blockish-button-link:hover` -> `border-color: {{VALUE}};` |
| `buttonBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `buttonPadding` | Spacing | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `buttonTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-button-link` |
| `buttonTextShadow` | Stringified-JSON (Text Shadow) | unset | <br>**CSS:** Uses `BlockishTextShadow` on `.{{WRAPPER}} .blockish-button-link` |
| `buttonBoxShadow` | Stringified-JSON (Box Shadow) | unset | Normal <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}} .blockish-button-link` |
| `buttonHoverBoxShadow` | Stringified-JSON (Box Shadow) | unset | Hover <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}} .blockish-button-link:hover` |
| `buttonHoverTransition` | Scalar (number, seconds) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `--blockish-button-hover-transition: {{VALUE}}s;` |
| `buttonWidth` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `width: {{VALUE}};` |
| `buttonMinHeight` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link` -> `min-height: {{VALUE}};` |
| `buttonIconSize` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-button-link .blockish-button-icon` -> `width: {{VALUE}}; height: {{VALUE}};` |

`blockish/button` does **not** support `anchor` or `align` (no `id`, no wide/full alignment) — unlike almost every other Blockish block. See §7.1.

Minimal schema:
```json
{
  "name": "blockish/button",
  "attributes": { "text": "Get Started Free", "url": { "url": "/signup", "newTab": false } }
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-button">
  
  <!-- The <a> tag is always rendered, even if URL is empty -->
  <a class="blockish-button-link" href="..." target="_blank" rel="noopener noreferrer">
    
    <!-- Button text is rendered as a span -->
    <span>Button Text Content</span>
    
    <!-- The icon <svg> is ONLY rendered if `icon` attribute exists AND has both `viewBox` and `path` -->
    <svg class="blockish-icon blockish-button-icon" fill="currentColor">...</svg>

  </a>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-button {
	display: flex;
	align-items: center;

	.blockish-button-link {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		text-decoration: none;
		cursor: pointer;
		box-sizing: border-box;
		background-color: #000;
		color: #fff;
		padding: 10px 20px;
		transition: all 0.3s ease;

		& > span {
			white-space: nowrap;
		}
	}

	.blockish-button-icon {
		width: 1em;
		height: 1em;
	}
}
```



