### `blockish/paragraph`

A standard paragraph block for rich text. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `content` | Scalar (string, HTML allowed) | `""` | |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}}` |
| `color` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}}` -> `color: {{VALUE}};` |
| `hoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}}:hover` -> `color: {{VALUE}};` |
| `textShadow` | Stringified-JSON (Box Shadow) | unset | Normal <br>**CSS:** Uses `BlockishTextShadow` on `.{{WRAPPER}}` |
| `textShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover <br>**CSS:** Uses `BlockishTextShadow` on `.{{WRAPPER}}:hover` |

Minimal schema:
```json
{
  "name": "blockish/paragraph",
  "attributes": { "content": "This is a paragraph." }
}
```

---


### Markup & CSS Generation

**Generated HTML Structure:**
```html
<p class="blockish-paragraph">
  
  <!-- The <a> tag is ONLY rendered if a static URL (url.url) OR a dynamic URL (dynamicData.url) is set -->
  <a href="..." target="_blank" rel="noopener noreferrer">
    Paragraph Text Content
  </a>

</p>
```

**Base CSS (`style.scss`):**
```scss
.blockish-paragraph {
	margin: 0;
	padding: 0;

	a {
		color: inherit !important;
		font-size: inherit !important;
		text-decoration: inherit !important;
		font-weight: inherit;
	}
}
```
