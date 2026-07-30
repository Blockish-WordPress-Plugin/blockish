### `blockish/image`

Image with optional caption and lightbox. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `image` | Image | **Required for a visible image.** Get a real media object via `blockish/get-media` or `blockish/upload-media` — do not invent ids. Shape: `{ id, url, width, height, alt?, title?, caption?, sizes? }`. |
| `alt` | Scalar | Falls back to `image.alt`. |
| `title` | Scalar | Optional; falls back to `image.title`. |
| `imageSize` | Option | Default `{"value":"full","label":"Full Size"}`. `thumbnail` `medium` `large` `full` — picks URL from `image.sizes` when present. |
| `captionType` | Scalar | `"none"` (default) \| `"attachment"` (uses `image.caption`) \| `"custom"` (uses `customCaption`). |
| `customCaption` | Scalar | Only when `captionType` is `"custom"`. |
| `lightbox` | Scalar (bool) | Default `false`. Frontend fullscreen lightbox uses the full-size URL. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (empty attributes — no image yet):

```html
<figure class="wp-block-blockish-image blockish-image-wrapper"></figure>
```

With image set:

```html
<figure class="wp-block-blockish-image blockish-image-wrapper">
  <img class="blockish-image wp-image-{id}" src="…" width="…" height="…" alt="…" title="…" />
</figure>
```

| When | What changes |
|---|---|
| `image.id` set | Class `wp-image-{id}` on the `<img>`. |
| `lightbox: true` | Root class `has-lightbox`; image wrapped in `<a class="blockish-image-lightbox-trigger" data-blockish-lightbox="true" …>`. |
| `captionType` ≠ `"none"` + caption text | Child `<figcaption class="blockish-image-caption">…</figcaption>`. |
| `captionType: "custom"` | Caption text from `customCaption`. |
| `captionType: "attachment"` | Caption text from `image.caption`. |

Style with convert-css:
- wrapper align → `{{ROOT}} { text-align: …; }`
- image box → `{{ROOT}} .blockish-image { width: …; height: …; border-radius: …; }`
- **object-fit only emits when height is set** — convert both: `{{ROOT}} .blockish-image { height: 320px; object-fit: cover; }`
- caption → `{{ROOT}} .blockish-image-caption { … }`
Do not invent markup. Do not style `.blockish-lightbox*` chrome unless intentionally customizing the global lightbox.

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-image-wrapper) { text-align: center; }

/* Stylesheet */
.blockish-image-wrapper { margin: 0; }
.blockish-image-wrapper .blockish-image { box-sizing: border-box; height: auto; transition: all var(--blockish-image-hover-transition, .3s) ease; width: 100%; }
.blockish-image-wrapper.has-lightbox .blockish-image-lightbox-trigger { color: inherit; cursor: zoom-in; display: inline-block; line-height: 0; max-width: 100%; text-decoration: none; }
.blockish-lightbox { align-items: center; background: rgba(10, 12, 16, .88); display: flex; inset: 0; justify-content: center; opacity: 0; padding: 24px; pointer-events: none; position: fixed; transition: opacity .2s ease, visibility .2s ease; visibility: hidden; z-index: 100000; }
.blockish-lightbox.is-open { opacity: 1; pointer-events: auto; visibility: visible; }
.blockish-lightbox__dialog { align-items: center; display: flex; flex-direction: column; gap: 12px; max-height: 100%; max-width: min(1100px, 100%); }
.blockish-lightbox__image { border-radius: 4px; box-shadow: 0 12px 40px rgba(0, 0, 0, .35); display: block; height: auto; max-height: calc(100vh - 120px); max-width: 100%; object-fit: contain; width: auto; }
.blockish-lightbox__caption { color: #f8fafc; font-size: 14px; line-height: 1.45; margin: 0; max-width: 40rem; text-align: center; }
.blockish-lightbox__close { align-items: center; background: hsla(0, 0%, 100%, .12); border: 0; border-radius: 999px; color: #fff; cursor: pointer; display: inline-flex; font-size: 28px; height: 40px; justify-content: center; line-height: 1; position: absolute; right: 16px; top: 16px; width: 40px; }
.blockish-lightbox__close:focus-visible,
.blockish-lightbox__close:hover { background: hsla(0, 0%, 100%, .22); outline: none; }
html.blockish-lightbox-open { overflow: hidden; }
```

#### Minimal schema

```json
{
  "name": "blockish/image",
  "attributes": {
    "image": {
      "id": 123,
      "url": "https://example.com/photo.jpg",
      "width": 1200,
      "height": 800
    },
    "alt": "Team photo"
  }
}
```
