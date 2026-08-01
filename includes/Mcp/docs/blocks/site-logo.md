### `blockish/site-logo`

Custom logo from Customizer / Site Editor. **Accepts children: no.** Prefer over `blockish/image` for brand logos in headers.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `linkToHome` | Scalar (boolean) | Default `true`. |
| `openInNewTab` | Scalar (boolean) | Default `false`. Only when `linkToHome`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (linked):

```html
<figure class="wp-block-blockish-site-logo blockish-site-logo">
  <a class="custom-logo-link" href="/" rel="home">
    <img class="custom-logo blockish-site-logo__image" … />
  </a>
</figure>
```

| When | What changes |
|---|---|
| `linkToHome: false` | Image only — no `<a>`. |
| `openInNewTab: true` | Link gets `target="_blank" rel="home noopener noreferrer"`. |
| No custom logo set | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
:where(.blockish-site-logo) { text-align: left; }
:where(.blockish-site-logo .blockish-site-logo__image) { width: 120px; }
.blockish-site-logo { margin: 0; }
.blockish-site-logo a { display: inline-block; }
.blockish-site-logo .blockish-site-logo__image { display: block; height: auto; }
```

#### Minimal schema

```json
{
  "name": "blockish/site-logo",
  "attributes": {
    "linkToHome": true
  }
}
```
