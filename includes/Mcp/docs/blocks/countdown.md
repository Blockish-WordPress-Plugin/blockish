### `blockish/countdown`

Live countdown to a target date/time with five design layouts. **Accepts children: no.** Static block: saved HTML always uses `00` placeholders; `view.js` fills live values on the frontend (same pattern as `blockish/counter`).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `dueDate` | Scalar (string) | Local datetime `YYYY-MM-DDTHH:mm`. Default `"2026-09-17T12:00"` (~1 week). Saved HTML always shows `00` placeholders — live values come from view script via `data-due-date`. |
| `layout` | Option | Design. Default `{"label":"Boxes","value":"boxes"}`. Other values: `inline` `stacked` `circular` `flip`. `flip` uses an inlined flip-digit clock (calendar-page animation). |
| `showDays` / `showHours` / `showMinutes` / `showSeconds` | Scalar (bool) | Default `true`. Hide units you do not need. |
| `daysLabel` / `hoursLabel` / `minutesLabel` / `secondsLabel` | Scalar | Defaults `"Days"` `"Hours"` `"Minutes"` `"Seconds"`. |
| `showLabels` | Scalar (bool) | Default `true`. |
| `padZeros` | Scalar (bool) | Default `true` → `05`; `false` → `5`. |
| `separator` | Option | Inline layout only. Default `{"label":"Colon (:)","value":":"}`. Other values: `\|` `•` `/` `none`. |
| `circularDaysMax` | Scalar (number) | Circular layout only. Default `30`. Days ring fill = days ÷ this max (clamped 0–1). |
| `expiredMessage` | Scalar | Default `"This offer has ended"`. |
| `showExpiredMessage` | Scalar (bool) | Default `true`. When expired, units hide and message shows. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes, due date filled by editor):

```html
<div class="wp-block-blockish-countdown blockish-countdown is-layout-boxes" data-blockish-countdown="true" data-due-date="2026-09-17T12:00" data-layout="boxes" data-pad-zeros="true" data-show-labels="true" data-separator=":" data-circular-days-max="30" data-show-expired-message="true" data-show-days="true" data-show-hours="true" data-show-minutes="true" data-show-seconds="true" data-days-label="Days" data-hours-label="Hours" data-minutes-label="Minutes" data-seconds-label="Seconds">
  <div class="blockish-countdown__inner">
    <div class="blockish-countdown__units">
      <div class="blockish-countdown__unit is-unit-days" data-unit="days" data-progress="0.0000">
        <div class="blockish-countdown__unit-surface">
          <span class="blockish-countdown__value" data-countdown-value>00</span>
        </div>
        <span class="blockish-countdown__label">Days</span>
      </div>
      <!-- hours / minutes / seconds units … -->
    </div>
    <div class="blockish-countdown__expired-wrap is-hidden" aria-hidden="true">
      <p class="blockish-countdown__expired">This offer has ended</p>
    </div>
  </div>
</div>
```

| When | What changes |
|---|---|
| `layout` | Root class `is-layout-boxes` \| `is-layout-inline` \| `is-layout-stacked` \| `is-layout-circular` \| `is-layout-flip`. |
| `layout:"inline"` | Separators (`.blockish-countdown__separator`) between units when `separator.value` ≠ `"none"`. |
| `layout:"circular"` | Each `.blockish-countdown__unit-surface` contains `.blockish-countdown__ring` SVG (track + progress). |
| `layout:"flip"` | Empty `.blockish-countdown__flipdown` mount; `view.js` / editor mount `.blockish-flip` rotor clock. |
| Expired | Root gets `is-expired`; units `hidden`; expired wrap shown when `showExpiredMessage`. |
| Unit toggles / labels | Matching `data-*` on root; only visible units rendered. |

Style with convert-css against `.blockish-countdown`, `.blockish-countdown__unit-surface`, `.blockish-countdown__value`, `.blockish-countdown__label`, `.blockish-countdown__ring-*`, `.blockish-countdown__flip-face` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-countdown) { --blockish-countdown-ring-stroke: 6px; }
:where(.blockish-countdown .blockish-countdown__inner) { gap: 1rem; align-items: center; }
:where(.blockish-countdown .blockish-countdown__units) { gap: 1rem; justify-content: center; }
:where(.blockish-countdown .blockish-countdown__unit) { gap: 0.45rem; }
:where(.blockish-countdown .blockish-countdown__label) { color: color-mix(in srgb, currentColor 65%, transparent); font-size: 0.75rem; font-weight: 600; }
:where(.blockish-countdown.is-layout-boxes .blockish-countdown__unit-surface),
:where(.blockish-countdown.is-layout-stacked .blockish-countdown__unit-surface),
:where(.blockish-countdown.is-layout-flip .blockish-countdown__unit-surface) { background: color-mix(in srgb, currentColor 6%, transparent); border-radius: 12px; }
:where(.blockish-countdown.is-layout-flip .blockish-countdown__flip-face) { background: color-mix(in srgb, currentColor 10%, transparent); border-radius: 8px; }
:where(.blockish-countdown .blockish-countdown__ring-track) { stroke: color-mix(in srgb, currentColor 15%, transparent); }
:where(.blockish-countdown .blockish-countdown__ring-progress) { stroke: currentColor; transition: stroke-dashoffset 0.35s ease; }
.blockish-countdown .blockish-countdown__inner { display: flex; flex-direction: column; width: 100%; }
.blockish-countdown .blockish-countdown__units { display: flex; flex-wrap: wrap; align-items: center; width: 100%; }
.blockish-countdown .blockish-countdown__unit { display: flex; flex-direction: column; align-items: center; }
.blockish-countdown .blockish-countdown__unit-surface { position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; }
.blockish-countdown .blockish-countdown__value { display: inline-block; font-variant-numeric: tabular-nums; line-height: 1; white-space: nowrap; }
.blockish-countdown.is-layout-boxes .blockish-countdown__unit-surface { min-width: 4.5rem; padding: 0.85rem 1rem; }
.blockish-countdown.is-layout-boxes .blockish-countdown__value { font-size: 2.25rem; font-weight: 700; }
.blockish-countdown.is-layout-inline .blockish-countdown__units { flex-wrap: nowrap; }
.blockish-countdown.is-layout-inline .blockish-countdown__value { font-size: 2.5rem; font-weight: 700; }
.blockish-countdown.is-layout-stacked .blockish-countdown__units { flex-direction: column; align-items: stretch; }
.blockish-countdown.is-layout-stacked .blockish-countdown__unit { flex-direction: row; justify-content: space-between; width: 100%; max-width: 20rem; }
.blockish-countdown.is-layout-circular .blockish-countdown__unit-surface { width: 6.5rem; height: 6.5rem; background: transparent; border: 0; box-shadow: none; padding: 0; }
.blockish-countdown.is-layout-circular .blockish-countdown__value { position: relative; z-index: 1; font-size: 1.65rem; font-weight: 700; }
.blockish-countdown.is-layout-flip .blockish-countdown__flip-face { font-size: 2rem; font-weight: 700; }
```

#### Minimal schema

```json
{
  "name": "blockish/countdown",
  "attributes": {
    "dueDate": "2026-12-31T23:59",
    "layout": {"label":"Boxes","value":"boxes"}
  }
}
```

Circular rings:

```json
{
  "name": "blockish/countdown",
  "attributes": {
    "dueDate": "2026-10-01T12:00",
    "layout": {"label":"Circular","value":"circular"},
    "circularDaysMax": 14,
    "showLabels": true
  }
}
```

Flip clock:

```json
{
  "name": "blockish/countdown",
  "attributes": {
    "dueDate": "2026-09-20T18:00",
    "layout": {"label":"Flip","value":"flip"},
    "showDays": false
  }
}
```
