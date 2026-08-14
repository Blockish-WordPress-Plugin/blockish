### `blockish/social-icons`

Social profile icon list. **Accepts children: yes** — only `blockish/social-icon-item`.

> [!WARNING]
> **Hard rule — layout is flex, not columns.** Default direction is row, wrap on. For a single footer/header row, convert unwrap: `{{ROOT}} { flex-wrap: nowrap; }`. Vertical stack: `{{ROOT}} { flex-direction: column; }`. Do **not** set `--blockish-social-icons-columns` or `display: grid` in Class Manager.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `shape` | Scalar | `"circle"` (default) \| `"square"` \| `"rounded"` → root class `shape-*`. |
| `flexDirection` | Responsive-Option | Inspector: Row / Column. Values: `"row"` `"column"`. Prefer convert-css: `{{ROOT}} { flex-direction: column; }`. Default Already-there is row. |
| `flexWrap` | Responsive-Option | Inspector: Wrap / Unwrap. Values: `"wrap"` `"nowrap"`. Prefer convert-css: `{{ROOT}} { flex-wrap: nowrap; }`. Default Already-there is wrap. |
| `alignment` | Responsive-Option | Inspector: Left / Center / Right. Values: `"flex-start"` `"center"` `"flex-end"`. Prefer convert-css: `{{ROOT}} { justify-content: flex-start; }`. Default Already-there is center. |
| `iconColorMode` | Scalar | `"official"` (default) \| `"custom"` → root class `is-color-*`. Official uses each item’s `officialColor`; custom uses parent color vars. On dark backgrounds prefer `"custom"` — official X/GitHub black disappears. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Children must be `blockish/social-icon-item` only. Put this block **inside** a flex column container (`flex-direction: column` on the parent).

#### Markup

Default:

```html
<ul class="wp-block-blockish-social-icons blockish-social-icons shape-circle is-color-official">
  <!-- social-icon-item innerBlocks -->
</ul>
```

| When | What changes |
|---|---|
| `shape: "square"` / `"rounded"` | Class `shape-square` / `shape-rounded` (border-radius on links). |
| `iconColorMode: "custom"` | Class `is-color-custom` (uses `--blockish-social-icons-primary-color`). |
| `flexDirection` set | `flex-direction` on the root (inspector Direction). |
| `flexWrap` set | `flex-wrap` on the root (inspector Wrap). |
| `alignment` set | `justify-content` on the root (inspector Alignment). |

Style with convert-css:
- direction → `{{ROOT}} { flex-direction: row; }` or `column`
- wrap / unwrap → `{{ROOT}} { flex-wrap: wrap; }` or `nowrap`
- alignment → `{{ROOT}} { justify-content: flex-start; }`
- icon chrome (size, padding, custom colors) → Markup selectors on `.blockish-social-icon-item__link` / svg

Do not invent markup.

#### Already-there CSS

```css
/* Defaults from attributes — row / wrap / center until you set `flexDirection` + `flexWrap` + `alignment` */
.blockish-social-icons {
  --blockish-social-icons-secondary-color: #FFFFFF;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  column-gap: 12px;
  row-gap: 12px;
}

/* Stylesheet */
.blockish-social-icons {
  align-items: center;
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.blockish-social-icons.is-color-official .blockish-social-icon-item__link {
  background-color: var(--blockish-social-icon-official-color,#2563eb);
}

.blockish-social-icons.is-color-custom .blockish-social-icon-item__link {
  background-color: var(--blockish-social-icons-primary-color,#111827);
}

.blockish-social-icons.shape-square .blockish-social-icon-item__link {
  border-radius: 0;
}

.blockish-social-icons.shape-rounded .blockish-social-icon-item__link {
  border-radius: 8px;
}

.blockish-social-icons.shape-circle .blockish-social-icon-item__link {
  border-radius: 999px;
}

.blockish-social-icons .blockish-social-icon-item {
  flex-shrink: 0;
  list-style: none;
  margin: 0;
  padding: 0;
}

.blockish-social-icons .blockish-social-icon-item__link {
  align-items: center;
  animation-duration: .6s;
  animation-fill-mode: both;
  border: 0;
  color: var(--blockish-social-icons-secondary-color,#fff);
  display: inline-flex;
  justify-content: center;
  line-height: 1;
  padding: 10px;
  text-decoration: none;
}

.blockish-social-icons .blockish-social-icon-item__icon {
  display: inline-flex;
  line-height: 1;
}

.blockish-social-icons .blockish-social-icon-item__icon svg {
  fill: currentColor;
  height: 18px;
  width: 18px;
}

```

#### Minimal schema

```json
{
  "name": "blockish/social-icons",
  "attributes": {
    "shape": "circle",
    "flexWrap": {
      "Desktop": { "label": "Unwrap", "value": "nowrap" }
    },
    "alignment": {
      "Desktop": { "label": "Left", "value": "flex-start" }
    }
  },
  "innerBlocks": [
    {
      "name": "blockish/social-icon-item",
      "attributes": {
        "network": { "label": "Instagram", "value": "instagram" },
        "label": "Instagram",
        "officialColor": "#E4405F",
        "link": { "url": "https://instagram.com/username", "newTab": true }
      }
    }
  ]
}
```
