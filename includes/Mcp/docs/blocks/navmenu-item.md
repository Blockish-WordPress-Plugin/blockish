### `blockish/navmenu-item`

Single menu link. **Parent: `blockish/navmenu`, `blockish/offcanvas`, or nested `blockish/navmenu-submenu`.** **Accepts children: yes** — at most **one** of: `blockish/navmenu-submenu` **or** `blockish/navmenu-megamenu`. Dynamic (`render.php`). Does **not** support `anchor`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `label` | Scalar | Default `""`. Link text (bold/italic allowed). |
| `url` | Scalar | Href (e.g. `"/about"`). Prefer over entity meta fields. |
| `openInNewTab` | Scalar | `false` (default). `target="_blank"` + `noopener noreferrer`. |
| `rel` | Scalar | Optional extra `rel` tokens. |
| `description` | Scalar | Optional; unused in default render. |
| `icon` | Icon | Optional; prefer `get-icons`. |
| `iconPosition` | Scalar | `"left"` (default) \| `"right"`. |
| `linkId` / `linkKind` / `linkType` | Scalar | Editor entity link metadata — do not invent; use `url`. |

**Dropdown choice**

| Child | Use when |
|---|---|
| `blockish/navmenu-submenu` | Simple link list / nested flyouts. |
| `blockish/navmenu-megamenu` | Wide layout from a `blockish_megamenu` CPT (`megamenuId`). |

Never nest both under the same item. Nested submenu items can again nest submenu (flyout).

#### Markup

Default (no icon, no child):

```html
<div class="wp-block-blockish-navmenu-item blockish-block-navmenu-item">
  <a class="blockish-navmenu-item-link" href="#">
    <span><!-- label --></span>
  </a>
</div>
```

| When | What changes |
|---|---|
| `linkId` set | Wrapper `data-id`. |
| `icon` set | Link `has-icon`; icon span before/after label. |
| Child submenu or megamenu | `has-submenu`; `<button class="blockish-navmenu-submenu-toggle" aria-expanded aria-controls>` + `<div id class="blockish-navmenu-item-children">`. |
| Active page (view) | Class `is-active` + `aria-current="page"` on the link. |

Style with convert-css:
- link chrome → `{{ROOT}} .blockish-navmenu-item-link { … }`
- icon size → `{{ROOT}} .blockish-navmenu-item-icon svg { … }`
Shared colors: parent `navmenu` selectors on `.blockish-block-navmenu-item`.

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
  white-space: nowrap;
}

.blockish-block-navmenu-item .blockish-navmenu-item-icon svg {
  display: block;
  fill: currentColor;
  height: 18px;
  width: 18px;
}

.blockish-block-navmenu-item .blockish-navmenu-submenu-toggle {
  background: none;
  border: none;
  color: inherit;
  display: none;
  line-height: 0;
  padding: 0;
}
```

(Desktop navmenu CSS shows the toggle when `.has-submenu`.)

#### Minimal schema (with submenu)

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
      "attributes": { "positionAlign": "left" },
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

#### Minimal schema (with megamenu)

```json
{
  "name": "blockish/navmenu-item",
  "attributes": {
    "label": "Platform",
    "url": "/platform"
  },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-megamenu",
      "attributes": {
        "megamenuId": 123,
        "widthMode": "custom",
        "customWidth": { "Desktop": { "value": 1100, "unit": "px" } },
        "positionAlign": "center",
        "alignRelativeTo": "navigation"
      }
    }
  ]
}
```
