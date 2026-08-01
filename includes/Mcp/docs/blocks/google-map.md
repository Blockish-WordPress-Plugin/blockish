### `blockish/google-map`

Embedded Google Map for a location. **Accepts children: no.**

> [!WARNING]
> Default `location` is `"New York, NY"` — always override.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `location` | Scalar | Default `"New York, NY"` — always override. Query string for the embed. |
| `zoom` | Scalar (integer) | Default `14`. Roughly `1` (world) – `20` (building); clamped in save. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes):

```html
<div class="wp-block-blockish-google-map blockish-google-map-wrapper">
  <iframe class="blockish-google-map__iframe" title="Google Map" src="https://maps.google.com/maps?hl=en&q=New%20York%2C%20NY&z=14&t=m&iwloc=near&output=embed" loading="lazy" allowfullscreen referrerpolicy="no-referrer-when-downgrade"></iframe>
</div>
```

| When | What changes |
|---|---|
| `location` / `zoom` | Embed `src` query (`q`, `z`). |

Style with convert-css against `.blockish-google-map-wrapper`, `.blockish-google-map__iframe` — not invented markup.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-google-map-wrapper { --blockish-google-map-hover-transition: 0s; width: 100%; }
:where(.blockish-google-map-wrapper .blockish-google-map__iframe) { height: 360px; }
.blockish-google-map-wrapper .blockish-google-map__iframe { border: 0; display: block; max-width: 100%; transition: filter var(--blockish-google-map-hover-transition); width: 100%; }
```

#### Minimal schema

```json
{
  "name": "blockish/google-map",
  "attributes": {
    "location": "1600 Amphitheatre Parkway, Mountain View, CA",
    "zoom": 14
  }
}
```
