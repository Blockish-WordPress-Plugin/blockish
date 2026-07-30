### `blockish/tab-item`

One tab panel. **Parent: `blockish/tab` only.** **Accepts children: yes** (panel body — any blocks).

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `title` | Scalar | Default `"Tab"`. Becomes nav trigger label (`data-title`). |
| `tabIcon` | Icon | Optional; serialized to `data-icon-path` / `data-icon-viewbox` for the view script. Prefer `get-icons`. |
| `defaultActive` | Scalar | `false` (default). Set `true` on exactly one item; index must match parent `defaultActiveTab`. |
| `anchor` | Scalar | Optional HTML `id`. |

#### Markup

Default:

```html
<div
  class="wp-block-blockish-tab-item blockish-block-tab-item"
  data-title="Tab"
  data-icon-path=""
  data-icon-viewbox=""
  data-default-active="false"
  role="tabpanel"
>
  <!-- innerBlocks -->
</div>
```

| When | What changes |
|---|---|
| `title` | `data-title` value. |
| `tabIcon` set | `data-icon-path` / `data-icon-viewbox` filled; view script renders trigger icon. |
| `defaultActive: true` | `data-default-active="true"`. |

#### Already-there CSS

```css
.blockish-block-tab-item {
  box-sizing: border-box;
}
```

Panel chrome (background, border, padding) comes from the parent tab stylesheet — see `tab.md`.

#### Minimal schema

```json
{
  "name": "blockish/tab-item",
  "attributes": {
    "title": "Overview",
    "defaultActive": true
  },
  "innerBlocks": [
    {
      "name": "core/paragraph",
      "attributes": {
        "content": "Overview content here."
      }
    }
  ]
}
```
