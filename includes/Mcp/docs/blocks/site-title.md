### `blockish/site-title`

Site title from Settings → General. **Accepts children: no.** Prefer over a hardcoded heading in headers.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"H1","value":"h1"}`. Allowed: `h1`–`h6`, `p`, `div`. |
| `linkToHome` | Scalar (boolean) | Default `true`. |
| `openInNewTab` | Scalar (boolean) | Default `false`. Only when `linkToHome`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default (linked h1):

```html
<h1 class="wp-block-blockish-site-title blockish-site-title">
  <a href="/" rel="home">Site Name</a>
</h1>
```

| When | What changes |
|---|---|
| `tag.value` | Root element tag. |
| `linkToHome: false` | Plain text — no `<a>`. |
| `openInNewTab: true` | Link gets `target="_blank" rel="home noopener noreferrer"`. |
| Empty site name | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-site-title) { text-align: left; }

/* Stylesheet */
.blockish-site-title a { color: inherit; text-decoration: inherit; }
```

#### Minimal schema

```json
{
  "name": "blockish/site-title",
  "attributes": {
    "linkToHome": true
  }
}
```
