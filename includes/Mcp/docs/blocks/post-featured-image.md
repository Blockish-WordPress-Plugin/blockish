### `blockish/post-featured-image`

Current post featured image. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `imageSize` | Option | Default `{"value":"full","label":"Full Size"}`. WP registered size slug. |
| `linkToPost` | Scalar (boolean) | Default `false`. |
| `openInNewTab` | Scalar (boolean) | Default `false`. Only when `linkToPost`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (no link):

```html
<figure class="wp-block-blockish-post-featured-image blockish-post-featured-image">
  <img class="blockish-post-featured-image__image" … />
</figure>
```

| When | What changes |
|---|---|
| `linkToPost: true` | Image wrapped in `<a href="{permalink}">…</a>`. |
| `openInNewTab: true` | Link gets `target="_blank" rel="noopener noreferrer"`. |
| No thumbnail | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-post-featured-image) { text-align: center; }

/* Stylesheet */
:where(.blockish-post-featured-image) {
  align-self: stretch;
  display: block;
  margin: 0;
  max-width: 100%;
  width: 100%;
}
:where(.blockish-post-featured-image) :where(a),
:where(.blockish-post-featured-image) :where(.blockish-post-featured-image__image) {
  display: block;
  max-width: 100%;
  width: 100%;
}
:where(.blockish-post-featured-image) :where(.blockish-post-featured-image__image) {
  height: auto;
}
```

#### Minimal schema

```json
{
  "name": "blockish/post-featured-image",
  "attributes": {
    "linkToPost": true
  }
}
```
