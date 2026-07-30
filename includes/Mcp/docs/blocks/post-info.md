### `blockish/post-info`

Post metadata row (author, dates, comments, terms, etc.). **Accepts children: no.** Items live in the `items` repeater.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `layout` | Option | Default `{"value":"row","label":"Row"}`. `"row"` \| `"column"`. |
| `separator` | Option | Default `{"value":"dot","label":"Dot"}`. `"none"` \| `"dot"` \| `"pipe"` \| `"line"`. |
| `items` | Array | Default: author + date + comments. See item shape below. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

**Item object (content keys only)**

| Key | Notes |
|---|---|
| `type` | Option: `"author"` `"date"` `"modified"` `"time"` `"comments"` `"terms"` `"reading-time"` `"word-count"`. |
| `beforeText` | Optional prefix string. |
| `link` | Boolean — link to author archive / date archive / comments as applicable. |
| `icon` | Option: `"none"` \| `"default"` \| `"custom"` (+ custom icon when custom). |
| `showAvatar` / `avatarSize` | Author only (`avatarSize` number, default `16`). |
| `dateFormat` | Date/modified — Option (`default` or WP format string). |
| `timeFormat` | Time only. |
| `termsCount` / `termsSeparator` | Terms only (defaults `3` / `", "`). |
| `wordsPerMinute` | Reading time only (default `200`). |

#### Markup

Default (row + dot separator, three default items):

```html
<ul class="wp-block-blockish-post-info blockish-post-info is-layout-row is-separator-dot">
  <li class="blockish-post-info__entry">
    <a class="blockish-post-info__item is-type-author" href="…">
      <span class="blockish-post-info__icon">…</span>
      <span class="blockish-post-info__text">Author Name</span>
    </a>
    <span class="blockish-post-info__separator" aria-hidden="true">·</span>
  </li>
  <!-- more entries… -->
</ul>
```

| When | What changes |
|---|---|
| `layout.value: "column"` | Root class `is-layout-column`. |
| `separator.value: "pipe"` | Separator char `\|`; class `is-separator-pipe`. |
| `separator.value: "line"` | Class `is-separator-line` (CSS `::after` rule; no char span). |
| `separator.value: "none"` | Class `is-separator-none`; no separator spans. |
| `link: false` | Item is `<span class="blockish-post-info__item …">` instead of `<a>`. |
| `showAvatar: true` | `<img class="blockish-post-info__avatar">` before icon/text. |
| Empty `items` / no post | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-post-info) { justify-content: flex-start; align-items: center; gap: 12px; }
:where(.blockish-post-info .blockish-post-info__item) { gap: 6px; }

.blockish-post-info {
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  padding: 0;
}
.blockish-post-info.is-layout-column { flex-direction: column; }
.blockish-post-info__entry {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  padding: 0;
}
.blockish-post-info__item {
  display: inline-flex;
  align-items: center;
  color: inherit;
  text-decoration: none;
}
.blockish-post-info__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 1em;
  height: 1em;
}
.blockish-post-info__icon svg {
  display: block;
  width: 1em;
  height: 1em;
  fill: currentColor;
}
.blockish-post-info__avatar {
  display: block;
  flex-shrink: 0;
  border-radius: 50%;
  object-fit: cover;
}
.blockish-post-info__text { display: inline; }
.blockish-post-info__separator {
  display: inline-flex;
  align-items: center;
  opacity: 0.55;
  user-select: none;
}
.blockish-post-info.is-separator-line .blockish-post-info__entry:not(:last-child) {
  position: relative;
  padding-right: 12px;
  margin-right: 0;
}
.blockish-post-info.is-separator-line .blockish-post-info__entry:not(:last-child)::after {
  content: "";
  position: absolute;
  top: 15%;
  right: 0;
  width: 1px;
  height: 70%;
  background-color: currentColor;
  opacity: 0.35;
}
.blockish-post-info.is-separator-line.is-layout-column .blockish-post-info__entry:not(:last-child) {
  padding-right: 0;
  padding-bottom: 12px;
}
.blockish-post-info.is-separator-line.is-layout-column .blockish-post-info__entry:not(:last-child)::after {
  top: auto;
  right: auto;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 1px;
}
```

#### Minimal schema

```json
{
  "name": "blockish/post-info",
  "attributes": {
    "items": [
      {
        "type": { "value": "author", "label": "Author" },
        "link": true,
        "icon": { "value": "default", "label": "Default" },
        "showAvatar": false
      },
      {
        "type": { "value": "date", "label": "Date" },
        "link": true,
        "icon": { "value": "default", "label": "Default" },
        "dateFormat": { "value": "default", "label": "Default" }
      }
    ]
  }
}
```
