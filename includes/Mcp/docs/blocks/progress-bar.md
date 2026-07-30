### `blockish/progress-bar`

Animated progress / completion bar. **Accepts children: no.**

> [!WARNING]
> Default `innerText` is a placeholder (`"Web Deigner"`) — always override or clear when unused.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `title` | Scalar | Default `"Progress"`. |
| `titleTag` | Option | Default `{"label":"H4","value":"h4"}`. `h1`–`h6` `p` `span` `div`. |
| `showTitle` | Scalar (bool) | Default `true`. |
| `percentage` | Scalar (number) | Default `50`. Clamped `0`–`100`; also produced when convert-css maps fill width. |
| `animationDuration` | Scalar (number, seconds) | Default `2`. |
| `displayPercentage` | Scalar (bool) | Default `true`. Shows `{n}%` label inside the fill. |
| `innerText` | Scalar | Placeholder default — always override. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes):

```html
<div class="wp-block-blockish-progress-bar blockish-progress-bar">
  <div class="blockish-progress-bar__header">
    <h4 class="blockish-progress-bar__title">Progress</h4>
  </div>
  <div class="blockish-progress-bar__track">
    <div class="blockish-progress-bar__fill" data-target-percentage="50" data-animation-duration="2" style="width: 0%; transition-duration: 2s;">
      <div class="blockish-progress-bar__fill-content has-percentage">
        <span class="blockish-progress-bar__inner-text">Web Deigner</span>
        <span class="blockish-progress-bar__percentage">50%</span>
      </div>
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `showTitle: false` | No `.blockish-progress-bar__header`. |
| `titleTag.value` | Title element tag. |
| `displayPercentage: false` | No `.has-percentage` / no `.blockish-progress-bar__percentage` span. |
| `percentage` / `animationDuration` | `data-target-percentage`, `data-animation-duration`, and inline `transition-duration` on `.blockish-progress-bar__fill` (saved width starts at `0%`; view script animates). |

Style with convert-css against `.blockish-progress-bar`, `.blockish-progress-bar__track`, `.blockish-progress-bar__fill`, title/inner text selectors — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-progress-bar .blockish-progress-bar__header { align-items: center; column-gap: 12px; display: flex; justify-content: space-between; margin-bottom: 10px; }
.blockish-progress-bar .blockish-progress-bar__percentage,
.blockish-progress-bar .blockish-progress-bar__title { margin: 0; }
.blockish-progress-bar .blockish-progress-bar__percentage { font-weight: 600; }
.blockish-progress-bar .blockish-progress-bar__track { background: #e5e7eb; border-radius: 999px; height: 25px; overflow: hidden; position: relative; width: 100%; }
.blockish-progress-bar .blockish-progress-bar__fill { align-items: center; background: #2563eb; display: flex; height: 100%; min-width: 0; overflow: hidden; transition-duration: .3s; transition-property: width; transition-timing-function: cubic-bezier(.22, 1, .36, 1); will-change: width; }
.blockish-progress-bar .blockish-progress-bar__fill-content { align-items: center; box-sizing: border-box; display: flex; gap: 8px; justify-content: space-between; max-width: 100%; min-width: 0; padding-inline: 15px; width: 100%; }
.blockish-progress-bar .blockish-progress-bar__inner-text { color: #fff; flex: 0 1 auto; font-size: 11px; line-height: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.blockish-progress-bar .blockish-progress-bar__percentage { color: #fff; flex-shrink: 0; font-size: 11px; line-height: 1; white-space: nowrap; }
```

#### Minimal schema

```json
{
  "name": "blockish/progress-bar",
  "attributes": {
    "title": "JavaScript",
    "percentage": 85,
    "innerText": ""
  }
}
```
