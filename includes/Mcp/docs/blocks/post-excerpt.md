### `blockish/post-excerpt`

Current post excerpt with optional read-more link. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `excerptLength` | Scalar (number) | Default `55`. Word count (clamped 1–100). |
| `moreText` | Scalar (string) | Default `""`. Empty = no read-more link. |
| `showMoreOnNewLine` | Scalar (boolean) | Default `true`. When more link exists, put it in its own `<p>`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (excerpt only, no more link):

```html
<div class="wp-block-blockish-post-excerpt blockish-post-excerpt">
  <p class="blockish-post-excerpt__text">…trimmed excerpt…</p>
</div>
```

| When | What changes |
|---|---|
| `moreText` non-empty + `showMoreOnNewLine: true` | Extra `<p class="blockish-post-excerpt__more-text"><a class="blockish-post-excerpt__more-link" href="…">…</a></p>`. |
| `moreText` non-empty + `showMoreOnNewLine: false` | More link appended inside `.blockish-post-excerpt__text`. |
| No post / empty excerpt | Renders nothing. |

#### Already-there CSS

```css
:where(.blockish-post-excerpt) { text-align: left; }
```

Style with convert-css against `.blockish-post-excerpt`, `.blockish-post-excerpt__text`, `.blockish-post-excerpt__more-link`.

#### Minimal schema

```json
{
  "name": "blockish/post-excerpt",
  "attributes": {
    "excerptLength": 30,
    "moreText": "Read more"
  }
}
```
