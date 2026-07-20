### `blockish/before-after-slider`

**Accepts children: no.**

| Attribute | Type | Default | Notes/enum |
|---|---|---|---|
| `beforeImage` | Image | unset | |
| `afterImage` | Image | unset | |
| `sliderPosition` | Scalar (number) | `50` | Initial slider position (percentage 0-100) <br>**CSS:** `.{{WRAPPER}}` -> `--slider-pos: {{VALUE}}%;` |
| `beforeLabel` | Scalar (string) | `"Before"` | Text overlay on the before image |
| `afterLabel` | Scalar (string) | `"After"` | Text overlay on the after image |
| `labelTypography` | Stringified-JSON (Typography) | unset | <br>**CSS:** Uses `BlockishTypography` on `.{{WRAPPER}} .blockish-slider-label` |
| `labelColor` | Scalar (string, color) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-label` -> `color: {{VALUE}};` |
| `labelBackgroundColor` | Scalar (string, color) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-label` -> `background-color: {{VALUE}};` |
| `labelPadding` | Object (Padding) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-label` -> `padding: {{TOP}} {{RIGHT}} {{BOTTOM}} {{LEFT}};` |
| `labelBorderRadius` | Border-Radius | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-label` -> `border-radius: {{TOP_LEFT}} {{TOP_RIGHT}} {{BOTTOM_RIGHT}} {{BOTTOM_LEFT}};` |
| `handleColor` | Scalar (string, color) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-handle` -> `background-color: {{VALUE}};` |
| `handleArrowColor` | Scalar (string, color) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-handle-arrows` -> `color: {{VALUE}};` |
| `handleArrowBackground` | Scalar (string, color) | unset | <br>**CSS:** `.{{WRAPPER}} .blockish-slider-handle-arrows` -> `background-color: {{VALUE}};` |
| `handleArrowBoxShadow` | Stringified-JSON (Box Shadow) | unset | <br>**CSS:** Uses `BlockishBoxShadow` on `.{{WRAPPER}} .blockish-slider-handle-arrows` |

Minimal schema:
```json
{
  "name": "blockish/before-after-slider",
  "attributes": { 
    "beforeImage": { "url": "https://example.com/before.jpg" },
    "afterImage": { "url": "https://example.com/after.jpg" }
  }
}
```

---

### Markup & CSS Generation

**Generated HTML Structure:**
```html
<div class="blockish-before-after-slider">
    <div class="blockish-slider-wrapper">
        <img class="blockish-image-after blockish-image-base" src="..." alt="..." />
        <!-- Rendered if afterLabel is not empty -->
        <span class="blockish-slider-label after-label">After</span>
        
        <div class="blockish-image-before-wrapper">
            <img class="blockish-image-before blockish-image-base" src="..." alt="..." />
            <!-- Rendered if beforeLabel is not empty -->
            <span class="blockish-slider-label before-label">Before</span>
        </div>
        
        <div class="blockish-slider-handle">
            <div class="blockish-slider-handle-arrows">
                <!-- SVG Icon -->
            </div>
        </div>
    </div>
</div>
```

**Base CSS (`style.scss`):**
```scss
.blockish-before-after-slider {
    position: relative;
    width: 100%;
    overflow: hidden;
    --slider-pos: 50%;
}
.blockish-slider-wrapper {
    position: relative;
    width: 100%;
    display: block;
    user-select: none;
}
.blockish-image-base {
    display: block;
    width: 100%;
    height: auto;
    object-fit: cover;
    pointer-events: none;
}
.blockish-image-before-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
    z-index: 1;
    clip-path: polygon(0 0, var(--slider-pos) 0, var(--slider-pos) 100%, 0 100%);
}
.blockish-image-before {
    position: static;
    width: 100%;
}
.blockish-slider-label {
    position: absolute;
    top: 20px;
    padding: 5px 12px;
    background-color: rgba(0, 0, 0, 0.6);
    color: #fff;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 500;
    pointer-events: none;
    line-height: 1.2;
}
.before-label {
    left: 20px;
    z-index: 5;
}
.after-label {
    right: 20px;
    z-index: 0;
}
.blockish-slider-handle {
    position: absolute;
    top: 0;
    bottom: 0;
    left: var(--slider-pos);
    width: 2px;
    background-color: #fff;
    cursor: ew-resize;
    z-index: 2;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    justify-content: center;
}
.blockish-slider-handle-arrows {
    width: 40px;
    height: 40px;
    flex-shrink: 0;
    aspect-ratio: 1/1;
    background-color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    color: #333;
    pointer-events: none;
}
```
