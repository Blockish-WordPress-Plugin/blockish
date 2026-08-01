### `blockish/before-after-slider`

Interactive before/after image comparison slider. **Accepts children: no.**

> [!WARNING]
> Both `beforeImage` and `afterImage` are required. Save returns `null` until both are set.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `beforeImage` | Image | Required. |
| `afterImage` | Image | Required. |
| `beforeLabel` | Scalar | Default `"Before"`. Overlay on the before image; omit empty to hide. |
| `afterLabel` | Scalar | Default `"After"`. Overlay on the after image; omit empty to hide. |
| `sliderPosition` | Scalar (number) | Default `50`. Initial split percent (`0`–`100`) via `--slider-pos`. |
| `align` | Scalar | `"wide"` \| `"full"`. |

#### Markup

Empty attributes (missing images) → nothing saved.

With both images (defaults for labels/position):

```html
<div class="wp-block-blockish-before-after-slider blockish-before-after-slider" style="--slider-pos: 50%;">
  <div class="blockish-slider-wrapper">
    <img src="…" alt="…" class="blockish-image-after blockish-image-base" />
    <span class="blockish-slider-label after-label">After</span>
    <div class="blockish-image-before-wrapper">
      <img src="…" alt="…" class="blockish-image-before blockish-image-base" />
      <span class="blockish-slider-label before-label">Before</span>
    </div>
    <div class="blockish-slider-handle">
      <div class="blockish-slider-handle-arrows">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">…</svg>
      </div>
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `sliderPosition` | Inline / attr `--slider-pos: {n}%` on root. |
| Empty `beforeLabel` / `afterLabel` | Corresponding `.blockish-slider-label` omitted. |

Style with convert-css against `.blockish-before-after-slider`, `.blockish-slider-label`, `.blockish-slider-handle…` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Defaults from attributes */
.wp-block-blockish-before-after-slider.blockish-before-after-slider { --slider-pos: 50%; }

/* Stylesheet */
.blockish-before-after-slider { overflow: hidden; position: relative; width: 100%; --slider-pos: 50%; }
.blockish-slider-wrapper { display: block; position: relative; -webkit-user-select: none; user-select: none; width: 100%; }
.blockish-image-base { display: block; height: auto; object-fit: cover; pointer-events: none; width: 100%; }
.blockish-image-before-wrapper { height: 100%; left: 0; overflow: hidden; position: absolute; top: 0; width: var(--slider-pos); z-index: 1; }
.blockish-image-before { height: 100%; left: 0; position: absolute; top: 0; width: 100vw; }
.blockish-slider-wrapper .blockish-image-before-wrapper { clip-path: polygon(0 0, var(--slider-pos) 0, var(--slider-pos) 100%, 0 100%); width: 100%; }
.blockish-slider-wrapper .blockish-image-before { position: static; width: 100%; }
.blockish-slider-wrapper .blockish-slider-label { background-color: rgba(0, 0, 0, .6); border-radius: 4px; color: #fff; font-size: 14px; font-weight: 500; line-height: 1.2; padding: 5px 12px; pointer-events: none; position: absolute; top: 20px; }
.blockish-slider-wrapper .before-label { left: 20px; z-index: 5; }
.blockish-slider-wrapper .after-label { right: 20px; z-index: 0; }
.blockish-slider-handle { align-items: center; background-color: #fff; bottom: 0; cursor: ew-resize; display: flex; justify-content: center; left: var(--slider-pos); position: absolute; top: 0; transform: translateX(-50%); width: 2px; z-index: 2; }
.blockish-slider-handle:before { background: transparent; bottom: 0; content: ""; left: -20px; position: absolute; top: 0; width: 40px; }
.blockish-slider-handle-arrows { align-items: center; aspect-ratio: 1 / 1; background-color: #fff; border-radius: 50%; box-shadow: 0 2px 6px rgba(0, 0, 0, .3); color: #333; display: flex; flex-shrink: 0; height: 40px; justify-content: center; pointer-events: none; width: 40px; }
```

#### Minimal schema

```json
{
  "name": "blockish/before-after-slider",
  "attributes": {
    "beforeImage": {
      "url": "https://example.com/before.jpg"
    },
    "afterImage": {
      "url": "https://example.com/after.jpg"
    }
  }
}
```
