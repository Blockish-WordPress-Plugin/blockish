### `blockish/heading`

A heading element with full text styling. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `content` | Scalar (string, HTML allowed) | `"Heading Text"` | |
| `tag` | Option | `{"label":"H2","value":"h2"}` | Options: `[{"label":"H1","value":"h1"},{"label":"H2","value":"h2"},{"label":"H3","value":"h3"},{"label":"H4","value":"h4"},{"label":"H5","value":"h5"},{"label":"H6","value":"h6"},{"label":"P","value":"p"},{"label":"Span","value":"span"},{"label":"Div","value":"div"}]` — only these 9, no `section`/`article`/`main`/etc. (those belong to `blockish/container`'s `tagName`, a different attribute) |
| `alignment` | Responsive | `{"Desktop":"left"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `typography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}}` |
| `color` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}}` -> `color: {{VALUE}};` |
| `hoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}}:hover` -> `color: {{VALUE}};` |
| `textShadow` | Stringified-JSON (Box Shadow) | unset | Normal <br>**CSS:** Uses `BlockishTextShadow` on `.{{WRAPPER}}` |
| `textShadowHover` | Stringified-JSON (Box Shadow) | unset | Hover <br>**CSS:** Uses `BlockishTextShadow` on `.{{WRAPPER}}:hover` |

Minimal schema:
```json
{
  "name": "blockish/heading",
  "attributes": { "content": "Build Faster", "tag": { "label": "H1", "value": "h1" } }
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The tag is dynamic based on the 'tag' attribute (h1-h6, p, div, span). Default is h2. -->
<h2 class="blockish-heading">
  
  <!-- The <a> tag is ONLY rendered if a static URL (url.url) OR a dynamic URL (dynamicData.url) is set -->
  <a href="..." target="_blank" rel="noopener noreferrer">
    Heading Text Content
  </a>

</h2>
```

**Base CSS (`style.scss`):**
```scss
.blockish-heading {
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



