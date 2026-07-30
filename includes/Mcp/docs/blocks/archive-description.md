### `blockish/archive-description`

Description for the current archive (category, tag, taxonomy, author). **Accepts children: no.**

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"Div","value":"div"}`. Allowed: `h1`–`h6`, `p`, `div`, `span`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default:

```html
<div class="wp-block-blockish-archive-description blockish-archive-description">
  <!-- archive description HTML -->
</div>
```

| When | What changes |
|---|---|
| `tag.value` | Root element tag. |
| Empty description | Renders nothing. |

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
:where(.blockish-archive-description) { text-align: left; }

/* Stylesheet */
.blockish-archive-description { margin: 0; }
```

#### Minimal schema

```json
{
  "name": "blockish/archive-description",
  "attributes": {}
}
```
