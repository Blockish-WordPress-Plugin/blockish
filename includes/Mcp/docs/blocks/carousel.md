### `blockish/carousel`

InnerBlocks carousel for hero, testimonials, or logo strips. **Accepts children: yes** — only `blockish/carousel-slide`.

> [!WARNING]
> **Hard rule — no nested Container:** Do not put `blockish/container` inside slides. Slide background and flex layout live on the slide itself (convert-css / slide attrs). Loop mode clones slides on the frontend so wrap-around does not rewind.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `slidesPerView` / `slidesPerViewTablet` / `slidesPerViewMobile` | Scalar | Default `1` each. Visible slides; written to CSS vars + `data-blockish-carousel` JSON. |
| `gap` | Scalar | Default `16` (px). Track gap + CSS `--bc-gap`. |
| `showArrows` / `showDots` | Scalar | Default `true`. Omit arrow buttons / dots markup when `false`. |
| `loop` | Scalar | Default `true`. Seamless wrap via clones. |
| `autoplay` / `pauseOnHover` | Scalar | Default `false` / `true`. |
| `autoplaySpeed` | Scalar | Default `4000` (ms). |
| `transitionSpeed` | Scalar | Default `450` (ms) → `--bc-transition`. |
| `arrowsPosition` | Scalar | `"inside"` (default) \| `"outside"` \| `"overlay"` → root class `is-arrows-*`. |
| `dotsPosition` | Scalar | `"below"` (default) \| `"overlay"` → `is-dots-*`. |
| `dotsAlign` | Scalar | `"center"` (default) \| `"flex-start"`/`"start"` \| `"flex-end"`/`"end"` → `is-dots-center` / `is-dots-start` / `is-dots-end`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default:

```html
<div
  class="wp-block-blockish-carousel blockish-carousel is-arrows-inside is-dots-below is-dots-center"
  style="--bc-per-view:1;--bc-per-view-tablet:1;--bc-per-view-mobile:1;--bc-gap:16px;--bc-transition:450ms"
  data-blockish-carousel='{"slidesPerView":1,"slidesPerViewTablet":1,"slidesPerViewMobile":1,"gap":16,"showArrows":true,"showDots":true,"autoplay":false,"autoplaySpeed":4000,"loop":true,"pauseOnHover":true,"transitionSpeed":450}'
>
  <div class="blockish-carousel__viewport">
    <div class="blockish-carousel__track">
      <!-- carousel-slide innerBlocks -->
    </div>
  </div>
  <button type="button" class="blockish-carousel__arrow is-prev" aria-label="Previous slide">‹</button>
  <button type="button" class="blockish-carousel__arrow is-next" aria-label="Next slide">›</button>
  <div class="blockish-carousel__dots" role="tablist"></div>
</div>
```

| When | What changes |
|---|---|
| `showArrows: false` | Arrow `<button>`s omitted. |
| `showDots: false` | `.blockish-carousel__dots` omitted. |
| `arrowsPosition` / `dotsPosition` / `dotsAlign` | Root layout classes (`is-arrows-*`, `is-dots-*`). |
| Per-view / gap / transition | Inline CSS vars + JSON in `data-blockish-carousel`. |
| Loop clones (view script) | Extra `.is-clone` slides in the track. |

Style with convert-css against `.blockish-carousel`, `.blockish-carousel__arrow`, `.blockish-carousel__dot`, etc.

#### Already-there CSS

```css
/* Defaults from attributes (also inlined as CSS vars on the root) */
.blockish-carousel {
  --bc-per-view: 1;
  --bc-per-view-tablet: 1;
  --bc-per-view-mobile: 1;
  --bc-gap: 16px;
  --bc-transition: 450ms;
}

/* Stylesheet */
.blockish-carousel {
  position: relative;
  --bc-per-view: 1;
  --bc-gap: 16px;
  --bc-transition: 0.45s;
}

.blockish-carousel__viewport {
  min-width: 0;
  overflow: hidden;
  width: 100%;
}

.blockish-carousel__track {
  box-sizing: border-box;
  display: flex;
  gap: var(--bc-gap);
  min-width: 0;
  transition: transform var(--bc-transition) ease;
  width: 100%;
  will-change: transform;
}

.blockish-carousel__track.is-no-transition {
  transition: none!important;
}

.blockish-carousel__track>.blockish-carousel__slide,
.blockish-carousel__track>.wp-block-blockish-carousel-slide {
  box-sizing: border-box;
  flex: 0 0 calc((100% - (var(--bc-per-view) - 1)*var(--bc-gap))/var(--bc-per-view));
  max-width: calc((100% - (var(--bc-per-view) - 1)*var(--bc-gap))/var(--bc-per-view));
  min-width: 0;
  width: calc((100% - (var(--bc-per-view) - 1)*var(--bc-gap))/var(--bc-per-view));
}

.blockish-carousel__track>.blockish-carousel__slide.is-clone,
.blockish-carousel__track>.wp-block-blockish-carousel-slide.is-clone {
  pointer-events: none;
  -webkit-user-select: none;
  user-select: none;
}

.blockish-carousel__slide-inner {
  height: 100%;
  min-width: 0;
}

.blockish-carousel__arrow {
  align-items: center;
  background: hsla(0,0%,100%,.92);
  border: 0;
  border-radius: 999px;
  box-shadow: 0 2px 10px rgba(0,0,0,.12);
  color: #1e1e1e;
  cursor: pointer;
  display: inline-flex;
  font-size: 28px;
  height: 40px;
  justify-content: center;
  line-height: 1;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: color .2s ease,background-color .2s ease,box-shadow .2s ease,opacity .2s ease;
  width: 40px;
  z-index: 2;
}

.blockish-carousel__arrow:disabled {
  cursor: default;
  opacity: .35;
}

.blockish-carousel__arrow.is-prev {
  left: 10px;
}

.blockish-carousel__arrow.is-next {
  right: 10px;
}

.blockish-carousel.is-arrows-outside .blockish-carousel__viewport {
  margin-left: 52px;
  margin-right: 52px;
}

.blockish-carousel.is-arrows-outside .blockish-carousel__arrow.is-prev {
  left: 0;
}

.blockish-carousel.is-arrows-outside .blockish-carousel__arrow.is-next {
  right: 0;
}

.blockish-carousel.is-arrows-overlay .blockish-carousel__arrow.is-prev {
  border-radius: 0 999px 999px 0;
  left: 0;
}

.blockish-carousel.is-arrows-overlay .blockish-carousel__arrow.is-next {
  border-radius: 999px 0 0 999px;
  right: 0;
}

.blockish-carousel__dots {
  align-items: center;
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 14px;
  z-index: 2;
}

.blockish-carousel.is-dots-overlay .blockish-carousel__dots {
  bottom: 16px;
  left: 0;
  margin-top: 0;
  position: absolute;
  right: 0;
}

.blockish-carousel.is-dots-start .blockish-carousel__dots {
  justify-content: flex-start;
  padding-left: 16px;
}

.blockish-carousel.is-dots-end .blockish-carousel__dots {
  justify-content: flex-end;
  padding-right: 16px;
}

.blockish-carousel.is-dots-center .blockish-carousel__dots {
  justify-content: center;
}

.blockish-carousel__dot {
  background: #c3c4c7;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  height: 8px;
  padding: 0;
  transition: background-color .2s ease,transform .2s ease,width .2s ease,height .2s ease;
  width: 8px;
}

.blockish-carousel__dot.is-active {
  background: var(--wp-admin-theme-color,#3858e9);
  transform: scale(1.15);
}

@media(max-width:1024px) {
  .blockish-carousel {
    --bc-per-view: var(--bc-per-view-tablet,var(--bc-per-view));
  }
  ;
}

@media(max-width:781px) {
  .blockish-carousel {
    --bc-per-view: var(--bc-per-view-mobile,var(--bc-per-view));
  }
  .blockish-carousel.is-arrows-outside .blockish-carousel__viewport {
    margin-left: 40px;
    margin-right: 40px;
  }
  ;
}
```

#### Minimal schema

```json
{
  "name": "blockish/carousel",
  "attributes": {},
  "innerBlocks": [
    {
      "name": "blockish/carousel-slide",
      "attributes": {},
      "innerBlocks": [
        {
          "name": "blockish/heading",
          "attributes": {
            "content": "Build faster",
            "tag": { "label": "H2", "value": "h2" }
          }
        },
        {
          "name": "blockish/button",
          "attributes": {
            "text": "Get started",
            "url": { "url": "/signup", "newTab": false }
          }
        }
      ]
    }
  ]
}
```
