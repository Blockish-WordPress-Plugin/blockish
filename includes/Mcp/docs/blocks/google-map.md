### `blockish/google-map`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `location` | Scalar (string) | `"New York, NY"` | Always override |
| `zoom` | Scalar (integer) | `14` | `1` (world) – `20` (building) |
| `mapHeight` | Scalar (string, CSS length) | `"360px"` | <br>**CSS:** `.{{WRAPPER}} .blockish-google-map__iframe` -> `height: {{VALUE}};` |
| `mapCSSFiltersNormal` | Stringified-JSON (CSS Filters) | unset | <br>**CSS:** Uses `BlockishCSSFilters` on `.{{WRAPPER}} .blockish-google-map__iframe` |
| `mapCSSFiltersHover` | Stringified-JSON (CSS Filters) | unset | <br>**CSS:** Uses `BlockishCSSFilters` on `.{{WRAPPER}} .blockish-google-map__iframe:hover` |
| `mapHoverTransition` | Scalar (number, seconds) | unset | <br>**CSS:** `.{{WRAPPER}}` -> `--blockish-google-map-hover-transition: {{VALUE}}s;` |

Minimal schema:
```json
{
  "name": "blockish/google-map",
  "attributes": { "location": "1600 Amphitheatre Parkway, Mountain View, CA", "zoom": 14 }
}
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-google-map-wrapper">
  
  <!-- `src` is dynamically generated using Google Maps Embed API based on `location` and `zoom` attributes -->
  <iframe
    class="blockish-google-map__iframe"
    title="Google Map"
    src="..."
    loading="lazy"
    allowfullscreen
    referrerpolicy="no-referrer-when-downgrade"
  ></iframe>

</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-google-map-wrapper {
	--blockish-google-map-hover-transition: 0s;
	width: 100%;

	.blockish-google-map__iframe {
		display: block;
		width: 100%;
		height: 360px;
		max-width: 100%;
		border: 0;
		transition: filter var(--blockish-google-map-hover-transition);
	}
}
```



