### `blockish/icon`

A single standalone SVG icon. **Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `icon` | Icon | 5-point star | |
| `link` | Link | unset | Makes the icon a link |
| `size` | Responsive | unset | <br>**CSS:** `.{{WRAPPER}} svg` -> `width: {{VALUE}}; height: {{VALUE}};` |
| `color` | Color | unset | Normal <br>**CSS:** `.{{WRAPPER}} svg` -> `fill: {{VALUE}};` |
| `hoverColor` | Color | unset | Hover <br>**CSS:** `.{{WRAPPER}} svg:hover` -> `fill: {{VALUE}};` |
| `alignment` | Responsive | `{"Desktop":"center"}` | `"left"` `"center"` `"right"` <br>**CSS:** `.{{WRAPPER}}` -> `text-align: {{VALUE}};` |
| `rotation` | Responsive | unset | Normal <br>**CSS:** `.{{WRAPPER}} svg` -> `transform: rotate({{VALUE}}deg);` |
| `rotationHover` | Responsive | unset | Hover <br>**CSS:** `.{{WRAPPER}} svg:hover` -> `transform: rotate({{VALUE}}deg);` |

Minimal schema:
```json
{ "name": "blockish/icon", "attributes": {} }
```

---



### Markup & CSS Generation

**Generated HTML Structure:**
```html
<!-- The wrapper tag is <a> if a link is provided, otherwise it defaults to <div> -->
<a class="blockish-icon" href="..." target="_blank" rel="noopener noreferrer">
  
  <!-- The icon <svg> is ONLY rendered if `icon` attribute exists AND has both `viewBox` and `path` -->
  <svg class="blockish-icon" fill="currentColor" width="24" height="24">...</svg>

</a>
```

**Base CSS (`style.scss`):**
```scss
.blockish-icon{
    line-height: 1;
    svg{
        transition: all .2s ease-in-out;
        pointer-events: all !important;
    }
}

a.blockish-icon{
    text-decoration: none;
    display: block;
}
```
