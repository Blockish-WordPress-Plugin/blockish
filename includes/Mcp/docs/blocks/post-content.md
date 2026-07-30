### `blockish/post-content`

Current post body (`the_content`). **Accepts children: no.** Use in single/post templates or loops that need the full post body.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"value":"div","label":"Div"}`. Allowed: `div`, `section`, `article`, `main`. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Markup

Default:

```html
<div class="wp-block-blockish-post-content blockish-post-content entry-content">
  <!-- filtered post content -->
</div>
```

| When | What changes |
|---|---|
| `tag.value` | Root element (`div` / `section` / `article` / `main`). |
| Nested render of same post | Guarded — returns nothing (avoids recursion). |
| Empty content | Renders nothing. |

#### Already-there CSS

```css
:where(.blockish-post-content) { text-align: left; }
```

Style with convert-css against `.blockish-post-content` / `.entry-content`.

#### Minimal schema

```json
{
  "name": "blockish/post-content",
  "attributes": {}
}
```
