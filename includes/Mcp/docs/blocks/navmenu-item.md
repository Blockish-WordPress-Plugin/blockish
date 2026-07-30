### `blockish/navmenu-item`

Single menu link. **Parent: `blockish/navmenu` or `blockish/offcanvas`.** **Accepts children: yes** — only one nested `blockish/navmenu-submenu` (optional). Dynamic block (`render.php`). Does **not** support `anchor`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `label` | Scalar | Default `""`. Link text (bold/italic allowed). |
| `url` | Scalar | Href string (e.g. `"/about"`). Prefer this over internal entity fields. |
| `openInNewTab` | Scalar | `false` (default). Adds `target="_blank"` + `noopener noreferrer`. |
| `rel` | Scalar | Optional extra `rel` tokens. |
| `description` | Scalar | Optional; unused in default render markup. |
| `icon` | Icon | Optional; prefer `get-icons`. |
| `iconPosition` | Scalar | `"left"` (default) \| `"right"`. |
| `linkId` / `linkKind` / `linkType` | Scalar | Editor entity link metadata — do not invent; use `url`. |

For a dropdown, nest exactly one `blockish/navmenu-submenu` with further `navmenu-item` children.

#### Markup

Default (no icon, no submenu) from `render.php`:

```html
<div class="wp-block-blockish-navmenu-item blockish-block-navmenu-item">
  <a class="blockish-navmenu-item-link" href="#">
    <span><!-- label --></span>
  </a>
</div>
```

| When | What changes |
|---|---|
| `linkId` set | Wrapper `data-id="…"`. |
| `icon` set | Link gains `has-icon`; icon span before (or after if `iconPosition: "right"`) the label. |
| `iconPosition: "right"` | Also class `icon-position-right`. |
| `openInNewTab: true` | `target="_blank"` + `rel` including `noopener noreferrer`. |
| Nested `navmenu-submenu` present | Sibling `<button class="blockish-navmenu-submenu-toggle">` with arrow SVG, then submenu markup. |

`save.js` only serializes innerBlocks (submenu); chrome comes from `render.php`.

Style with convert-css:
- link chrome → `{{ROOT}} .blockish-navmenu-item-link { padding: …; color: …; }`
- icon size → `{{ROOT}} .blockish-navmenu-item-icon svg { width: …; height: …; }`
Shared item colors across the whole menu can also be converted on the parent `navmenu` (selectors target `.blockish-block-navmenu-item`).
Do not invent markup.

#### Already-there CSS

```css
.blockish-block-navmenu-item {
  align-items: center;
  color: currentColor;
  display: inline-flex;
  gap: 6px;
  position: relative;
}

.blockish-block-navmenu-item .blockish-navmenu-item-link {
  align-items: center;
  border-radius: 4px;
  color: inherit;
  display: inline-flex;
  gap: 6px;
  text-decoration: none;
  transition: background .15s ease,color .15s ease;
  white-space: nowrap;
}

.blockish-block-navmenu-item .blockish-navmenu-item-icon {
  align-items: center;
  display: inline-flex;
  flex-shrink: 0;
  line-height: 0;
}

.blockish-block-navmenu-item .blockish-navmenu-item-icon svg {
  display: block;
  fill: currentColor;
  height: 18px;
  width: 18px;
}

.blockish-block-navmenu-item .blockish-navmenu-submenu-toggle {
  align-items: center;
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  display: inline-flex;
  flex-shrink: 0;
  justify-content: center;
  padding: 4px;
}

.blockish-block-navmenu-item .blockish-navmenu-submenu-toggle:focus-visible {
  outline: 2px solid currentColor;
  outline-offset: 1px;
}

.blockish-block-navmenu-item .blockish-navmenu-submenu-arrow {
  flex-shrink: 0;
  transition: transform .15s ease;
}

@keyframes blockishSubmenuRotateY {
  0% {
    transform: rotateY(90deg);
  }
  80% {
    transform: rotateY(-10deg);
  }
  to {
    transform: rotateY(0);
  }
  ;
}
```

#### Minimal schema

```json
{
  "name": "blockish/navmenu-item",
  "attributes": {
    "label": "Products",
    "url": "/products"
  },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-submenu",
      "attributes": {},
      "innerBlocks": [
        {
          "name": "blockish/navmenu-item",
          "attributes": { "label": "App", "url": "/app" }
        }
      ]
    }
  ]
}
```
