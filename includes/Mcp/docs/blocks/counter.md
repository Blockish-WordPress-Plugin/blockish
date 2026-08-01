### `blockish/counter`

Animated counting number with optional title. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `startNumber` | Scalar (number) | Default `0`. |
| `endNumber` | Scalar (number) | Default `100`. |
| `numberPrefix` / `numberSuffix` | Scalar | Default `""`. |
| `animationDuration` | Scalar (number, seconds) | Default `2`. |
| `thousandSeparator` | Scalar (bool) | Default `true` → `1,000`; `false` → `1000`. |
| `separator` | Option | Only when `thousandSeparator` is true. Default `{"label":"Default","value":"default"}` (`,`). Other values: `dot` `.` `space` `underscore` `_` `apostrophe` `'`. |
| `title` | Scalar | Default `"Cool Number"`. |
| `titleTag` | Option | Default `{"label":"H3","value":"h3"}`. `h1`–`h6` `p` `span` `div`. |
| `titlePosition` | Scalar | `"before"` (default, above) `"after"` (below) `"start"` (left) `"end"` (right). |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes):

```html
<div class="wp-block-blockish-counter blockish-counter is-title-before" data-blockish-counter="true" data-start-number="0" data-end-number="100" data-animation-duration="2" data-thousand-separator="true" data-separator-type="default" data-prefix="" data-suffix="" data-decimals="0">
  <div class="blockish-counter__inner">
    <h3 class="blockish-counter__title">Cool Number</h3>
    <span class="blockish-counter__number">
      <span data-counter-value class="blockish-counter__number-value">0</span>
    </span>
  </div>
</div>
```

| When | What changes |
|---|---|
| `titlePosition` | Root class `is-title-before` \| `is-title-after` \| `is-title-start` \| `is-title-end`; title rendered before or after the number. |
| `titleTag.value` | Title element tag. |
| Counter settings attrs | Matching `data-*` on the root (`data-start-number`, `data-end-number`, `data-prefix`, …). |

Style with convert-css against `.blockish-counter`, `.blockish-counter__number`, `.blockish-counter__title` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-counter) { --blockish-counter-title-horizontal: center; --blockish-counter-title-vertical: center; }
:where(.blockish-counter .blockish-counter__inner) { gap: 8px; }
:where(.blockish-counter .blockish-counter__number) { align-self: center; }
.blockish-counter .blockish-counter__inner { display: flex; }
.blockish-counter.is-title-after .blockish-counter__inner,
.blockish-counter.is-title-before .blockish-counter__inner { align-items: var(--blockish-counter-title-horizontal); flex-direction: column; }
.blockish-counter.is-title-end .blockish-counter__inner,
.blockish-counter.is-title-start .blockish-counter__inner { align-items: var(--blockish-counter-title-vertical); flex-direction: row; justify-content: var(--blockish-counter-title-horizontal); }
.blockish-counter .blockish-counter__number,
.blockish-counter .blockish-counter__title { margin: 0; }
.blockish-counter .blockish-counter__number { font-size: 44px; font-weight: 600; line-height: 1.15; text-align: center; }
.blockish-counter .blockish-counter__number-value { display: inline-block; white-space: nowrap; }
.blockish-counter .blockish-counter__title { line-height: 1.3; }
```

#### Minimal schema

```json
{
  "name": "blockish/counter",
  "attributes": {
    "endNumber": 500,
    "numberSuffix": "+",
    "title": "Happy Clients"
  }
}
```
