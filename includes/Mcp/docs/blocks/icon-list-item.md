### `blockish/icon-list-item`

One icon + text row. **Parent: `blockish/icon-list` only.** **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `text` | Scalar | Default `"Icon list item"`. HTML allowed in RichText. |
| `icon` | Icon | Default star glyph. Prefer `get-icons`. |
| `link` | Link | Optional. When URL set, wrapper is `<a>`; otherwise `<span>`. |
| `anchor` | Scalar | Optional HTML `id`. |

#### Markup

Default (no link):

```html
<li class="wp-block-blockish-icon-list-item blockish-icon-list-item">
  <span class="blockish-icon-list-item-link">
    <span class="blockish-icon-list-item-icon" aria-hidden="true"><!-- icon svg --></span>
    <span class="blockish-icon-list-item-text">Icon list item</span>
  </span>
</li>
```

| When | What changes |
|---|---|
| `link` with URL | Inner tag becomes `<a …>` with link props. |
| Custom `text` / `icon` | Text node / SVG update. |

#### Already-there CSS

```css
/* Stylesheet */
:where(.blockish-icon-list-item) {
  --blockish-icon-list-item-icon-hover-transition: 0.2s;
  --blockish-icon-list-item-text-hover-transition: 0.2s;
}

/* Stylesheet */
.blockish-icon-list-item.blockish-icon-list-item {
  --blockish-icon-list-item-text-hover-transition: 0.2s;
}

.blockish-icon-list-item.blockish-icon-list-item .blockish-icon-list-item-link {
  color: inherit;
}

.blockish-icon-list-item.blockish-icon-list-item .blockish-icon-list-item-icon {
  display: inline-flex;
  line-height: 1;
}

.blockish-icon-list-item.blockish-icon-list-item .blockish-icon-list-item-link .blockish-icon-list-item-icon svg {
  transition-duration: var(--blockish-icon-list-item-icon-hover-transition);
  transition-property: fill,color;
  transition-timing-function: ease;
}

.blockish-icon-list-item.blockish-icon-list-item .blockish-icon-list-item-link .blockish-icon-list-item-text {
  transition-duration: var(--blockish-icon-list-item-text-hover-transition);
  transition-property: color,fill;
  transition-timing-function: ease;
}
```

#### Minimal schema

```json
{
  "name": "blockish/icon-list-item",
  "attributes": {
    "text": "Free forever plan"
  }
}
```
