### `blockish/site-tagline`

Site tagline (description) from Settings → General. **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"P","value":"p"}`. Allowed: `h1`–`h6`, `p`, `div`, `span`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default:

```html
<p class="wp-block-blockish-site-tagline blockish-site-tagline">Site tagline</p>
```

| When | What changes |
|---|---|
| `tag.value` | Root element tag. |
| Empty tagline | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-site-tagline) { text-align: left; }

/* Stylesheet */
.blockish-site-tagline { margin: 0; }
```

#### Minimal schema

```json
{
  "name": "blockish/site-tagline",
  "attributes": {}
}
```
