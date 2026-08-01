### `blockish/rating`

Star/icon rating display. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `rating` | Scalar (number) | Default `5`. Decimals allowed (rounded to nearest half). |
| `ratingScale` | Scalar (integer) | Default `5`. Clamped `1`–`10`. |
| `icon` | Icon | Default filled star. Prefer `get-icons`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes — 5 full stars):

```html
<div class="wp-block-blockish-rating blockish-rating">
  <div class="blockish-rating-icons">
    <span class="blockish-rating-icon" style="--blockish-rating-fill: 100%;" aria-hidden="true">
      <span class="blockish-rating-icon-base"><svg class="blockish-icon" …></svg></span>
      <span class="blockish-rating-icon-fill"><svg class="blockish-icon" …></svg></span>
    </span>
    <!-- repeated ratingScale times; fill = clamp(rating - index, 0, 1) * 100% -->
  </div>
</div>
```

| When | What changes |
|---|---|
| `ratingScale` | Number of `.blockish-rating-icon` spans. |
| `rating` | Per-icon `--blockish-rating-fill` (half-steps supported, e.g. `4.5` → last icon `50%`). |
| Custom `icon` | Both base and fill SVGs use that icon. |

Style with convert-css against `.blockish-rating`, `.blockish-rating-icons`, `.blockish-rating-icon-base` / `-fill` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-rating) { text-align: center; }
:where(.blockish-rating .blockish-rating-icons) { gap: 6px; }
:where(.blockish-rating .blockish-rating-icon-base svg), :where(.blockish-rating .blockish-rating-icon-fill svg) { width: 24px; height: 24px; }
.blockish-rating .blockish-rating-icons { align-items: center; display: inline-flex; }
.blockish-rating .blockish-rating-icon { display: inline-grid; line-height: 1; place-items: center; }
.blockish-rating .blockish-rating-icon-base,
.blockish-rating .blockish-rating-icon-fill { display: inline-flex; grid-area: 1 / 1; }
.blockish-rating .blockish-rating-icon-fill { clip-path: inset(0 calc(100% - var(--blockish-rating-fill, 0%)) 0 0); }
.blockish-rating .blockish-rating-icon-base svg,
.blockish-rating .blockish-rating-icon-fill svg { height: 24px; width: 24px; }
.blockish-rating .blockish-rating-icon-fill svg { fill: #f5c518; }
.blockish-rating .blockish-rating-icon-base svg { fill: #d0d5dd; }
```

#### Minimal schema

```json
{
  "name": "blockish/rating",
  "attributes": {
    "rating": 4.5
  }
}
```
