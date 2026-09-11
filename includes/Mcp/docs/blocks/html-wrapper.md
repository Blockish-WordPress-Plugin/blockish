### `blockish/html-wrapper`

Dynamic custom HTML wrapper container with customizable tag and key-value props. **Accepts children: yes.**

> **Last resort only.** Use this block only when **no block fulfills the requirement** (custom tag, props, or semantics nothing else covers). For layout containers prefer `blockish/container`.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `tag` | Option | Default `{"label":"div","value":"div"}`. Dropdown offers `div`, `section`, `article`, `header`, `footer`, `nav`, `main`, `aside`, `form`, `ul`, `ol`, `li`, `figure`, `figcaption`, `details`, `summary`, `fieldset`; any custom tag `[a-z0-9-]` via Custom… unless blocked (see Sanitization). Void elements (`img`, `br`, `input`, …) are rejected and fall back to `div`. Can be provided as object `{"label": "section", "value": "section"}` or string. |
| `props` | Array | Default `[]`. Key-value attribute array: `[{"key": "id", "value": "intro"}, {"key": "data-role", "value": "container"}]`. Props are rendered directly as HTML attributes on the tag. |
| `anchor` / `align` | Scalar | `"align"`: `"wide"` \| `"full"`. |

#### Sanitization (enforced at render)

- Blocked tags are rejected and fall back to the default (`div`): `script`, `style`, `iframe`, `frame`, `frameset`, `object`, `embed`, `applet`, `base`, `meta`, `link`, `template`, `noscript`, `svg`, `math`, `html`, `head`, `body`, `title`. Void elements are also rejected (fall back to `div`).
- Props keys starting with `on` (event handlers such as `onclick`, `onerror`) and `dangerouslySetInnerHTML` are dropped.
- URL-bearing props (`href`, `src`, `srcset`, `action`, `formaction`, `xlink:href`, `poster`, `background`, `cite`, `ping`, `usemap`, `data`) accept only `http(s)`, `ftp(s)`, `mailto:`, `tel:`, `sms:`, `data:image/…` raster types (no SVG), or relative/fragment URLs. `javascript:`, `vbscript:`, `file:` and other schemes are dropped.

Do not stage blocked tags, event-handler props, or dangerous URL schemes — they are silently dropped/fall back at render.

#### Markup

Default (empty attributes — `tag` defaults to `div`):

```html
<div class="wp-block-blockish-html-wrapper blockish-html-wrapper blockish-html-wrapper--div">
  <!-- innerBlocks -->
</div>
```

| When | What changes |
|---|---|
| `tag.value: "section"` | Root element is `<section class="… blockish-html-wrapper--section">`. |
| `align: "wide"` \| `"full"` | Root class `alignwide` or `alignfull`. |
| `props` contains `key`/`value` | Attributes rendered onto root tag (e.g. `id="…"`, `data-*="…"`, `aria-*="…"`). |
| `class` or `className` in `props` | Additional CSS class names merged into root tag. |
| `style` in `props` | Inline styles applied to the element. |

Style with convert-css or Class Manager:
- Container styles → `{{ROOT}} { display: flex; flex-direction: column; gap: 16px; … }`
- Responsive layout → `{{ROOT}} { max-width: 1200px; margin: 0 auto; padding: 0 20px; }`

#### Already-there CSS

Stylesheet + defaults (omit = these already apply). Write only what differs.

```css
/* Stylesheet */
.blockish-html-wrapper { box-sizing: border-box; }
```

#### Minimal schema

```json
{
  "name": "blockish/html-wrapper",
  "attributes": {
    "tag": {
      "label": "section",
      "value": "section"
    },
    "align": "full",
    "props": [
      {
        "key": "id",
        "value": "features"
      },
      {
        "key": "data-section",
        "value": "features"
      }
    ]
  },
  "innerBlocks": [
    {
      "name": "blockish/html-child",
      "attributes": {
        "tag": {
          "label": "h2",
          "value": "h2"
        },
        "content": "Section Title"
      }
    }
  ]
}
```
