### `blockish/social-icon-item`

One social network link. **Parent: `blockish/social-icons` only.** **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `network` | Option | Default `{"value":"facebook","label":"Facebook"}`. Values: `facebook` `x` `instagram` `linkedin` `youtube` `github` `tiktok` `whatsapp`. |
| `label` | Scalar | Default `"Facebook"`. `aria-label` on the link; keep in sync with `network`. |
| `icon` | Icon | Optional override; unset falls back to the network’s built-in glyph. Prefer `get-icons`. |
| `officialColor` | Scalar | Default `"#1877F2"`. CSS var `--blockish-social-icon-official-color` when parent is `is-color-official`. Update when changing `network`. |
| `link` | Link | Optional. When `url` set, wrapper is `<a>`; otherwise `<span>`. |
| `anchor` | Scalar | Optional HTML `id`. |

#### Markup

Default (no link):

```html
<li
  class="wp-block-blockish-social-icon-item blockish-social-icon-item"
  style="--blockish-social-icon-official-color:#1877F2"
>
  <span class="blockish-social-icon-item__link" aria-label="Facebook">
    <span class="blockish-social-icon-item__icon" aria-hidden="true"><!-- network svg --></span>
  </span>
</li>
```

| When | What changes |
|---|---|
| `link` with URL | Inner tag becomes `<a …>` with link props. |
| Custom `network` / `officialColor` | Official color CSS var + default glyph. |
| Custom `icon` | Overrides network glyph. |

#### Already-there CSS

```css
.blockish-social-icon-item {
  line-height: 1;
}

:where(.blockish-social-icon-item) {
  width: 100%;
}
```

Parent `social-icons` stylesheet supplies shape/color chrome — see `social-icons.md`.

#### Minimal schema

```json
{
  "name": "blockish/social-icon-item",
  "attributes": {
    "network": { "label": "X", "value": "x" },
    "label": "X",
    "officialColor": "#000000",
    "link": { "url": "https://x.com/username", "newTab": true }
  }
}
```
