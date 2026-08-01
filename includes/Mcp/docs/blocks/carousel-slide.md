### `blockish/carousel-slide`

One slide inside a carousel. **Parent: `blockish/carousel` only.** **Accepts children: yes** — limited allow-list (no Container).

> [!WARNING]
> **Hard rule — no nested Container:** Apply hero background/overlay via convert-css on the slide. Allowed children only: `blockish/heading`, `blockish/paragraph`, `blockish/button`, `blockish/image`, `blockish/icon`, `blockish/icon-list`, `blockish/rating`, `blockish/counter`, `blockish/social-icons`.

#### Content / structure

No content-only attributes beyond layout/style (handled via convert-css / Already-there defaults). Use `innerBlocks` for slide content. Optional `anchor`.

Overlay: when `slideBackgroundOverlay` has `enabled: true`, root gains `has-background-overlay` (styles `::before`).

#### Markup

Default:

```html
<div class="wp-block-blockish-carousel-slide blockish-carousel__slide is-default-styled">
  <div class="blockish-carousel__slide-inner">
    <!-- allowed innerBlocks -->
  </div>
</div>
```

| When | What changes |
|---|---|
| Background overlay enabled | Root class `has-background-overlay`. |
| Custom min-height / padding / flex via attrs or convert-css | Overrides `.is-default-styled` / `.blockish-carousel__slide-inner` defaults. |

#### Already-there CSS

```css
/* Defaults from attributes (background only — slideBackground attr) */
.blockish-carousel__slide.is-default-styled {
  background: linear-gradient(145deg, #0f172a 0%, #1e293b 52%, #334155 100%);
  color: #f8fafc;
}

/* Stylesheet (:where layout defaults) */
:where(.blockish-carousel__slide) { min-height: 360px; }
:where(.blockish-carousel__slide .blockish-carousel__slide-inner) {
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 48px 40px;
  min-height: 360px;
}
@media (max-width: 1024px) {
  :where(.blockish-carousel__slide), :where(.blockish-carousel__slide .blockish-carousel__slide-inner) { min-height: 320px; }
  :where(.blockish-carousel__slide .blockish-carousel__slide-inner) { padding: 40px 28px; }
}
@media (max-width: 768px) {
  :where(.blockish-carousel__slide), :where(.blockish-carousel__slide .blockish-carousel__slide-inner) { min-height: 280px; }
  :where(.blockish-carousel__slide .blockish-carousel__slide-inner) { padding: 32px 20px; }
}

/* Stylesheet */
.blockish-carousel__slide {
  border-radius: 20px;
  box-shadow: inset 0 1px 0 hsla(0,0%,100%,.06),0 18px 48px rgba(15,23,42,.18);
  box-sizing: border-box;
  isolation: isolate;
  min-width: 0;
  overflow: hidden;
  position: relative;
}

.blockish-carousel__slide.is-default-styled {
  background: linear-gradient(145deg,#0f172a,#1e293b 52%,#334155);
  color: #f8fafc;
  min-height: 360px;
}

.blockish-carousel__slide.has-background-overlay:before {
  border-radius: inherit;
  content: "";
  inset: 0;
  pointer-events: none;
  position: absolute;
  z-index: 0;
}

.blockish-carousel__slide .blockish-carousel__slide-inner {
  align-items: center;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
  height: 100%;
  justify-content: center;
  min-height: inherit;
  min-width: 0;
  padding: 48px 40px;
  position: relative;
  text-align: center;
  width: 100%;
  z-index: 1;
}

@media(max-width:781px) {
  .blockish-carousel__slide.is-default-styled {
    border-radius: 16px;
    min-height: 280px;
  }
  .blockish-carousel__slide .blockish-carousel__slide-inner {
    padding: 32px 20px;
  }
  ;
}
```

#### Minimal schema

```json
{
  "name": "blockish/carousel-slide",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/heading",
      "attributes": {
        "content": "Slide title",
        "tag": { "label": "H2", "value": "h2" }
      }
    }
  ]
}
```
