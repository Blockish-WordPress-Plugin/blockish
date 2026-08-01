### `blockish/social-icons`

Social profile icon list. **Accepts children: yes** — only `blockish/social-icon-item`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `shape` | Scalar | `"circle"` (default) \| `"square"` \| `"rounded"` → root class `shape-*`. |
| `iconColorMode` | Scalar | `"official"` (default) \| `"custom"` → root class `is-color-*`. Official uses each item’s `officialColor`; custom uses parent color vars. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

Children must be `blockish/social-icon-item` only.

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

#### Already-there CSS

```css
/* Defaults from attributes */
.blockish-social-icons {
  --blockish-social-icons-columns: auto-fit;
  --blockish-social-icons-secondary-color: #FFFFFF;
  justify-content: center;
  column-gap: 12px;
  row-gap: 12px;
}

/* Stylesheet */
.blockish-social-icons {
  align-items: center;
  column-gap: 12px;
  display: grid;
  grid-template-columns: repeat(var(--blockish-social-icons-columns,auto-fit),minmax(0,max-content));
  list-style: none;
  margin: 0;
  padding: 0;
  row-gap: 12px;
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
  "attributes": {},
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
