### `blockish/navmenu-megamenu`

Wide mega dropdown under a menu item. Embeds a synced **`blockish_megamenu` CPT** post (not free-form inner blocks on the page). **Parent: `blockish/navmenu-item` only.** **Accepts children: no** (content lives in the CPT).

> [!WARNING]
> **Hard rule — nesting:** Nest under one `navmenu-item`. That item must **not** also contain `navmenu-submenu`.
>
> **Hard rule — content source:** Set `megamenuId` to a published `blockish_megamenu` post ID. Create/edit that CPT with `manage-post` (`post_type: "blockish_megamenu"`) + `block_schema` (usually `blockish/container` layouts). Invalid / wrong post type / password-protected IDs render nothing.
>
> **Hard rule — always set `widthMode` (never rely on the default):** Default `"navigation"` matches the **nav item / nav row width** — not the mega **content** width. Multi-column / featured / card layouts under `"navigation"` squash into a narrow tall strip and look broken. **Every** embed must set `widthMode` explicitly to match the CPT layout:
> - Multi-column / featured mega → `"custom"` + `customWidth` (typically `900`–`1200px`) + `positionAlign: "center"` + `alignRelativeTo: "navigation"` (or `"viewport"` when it should span the canvas).
> - Edge-to-edge band → `"full"`.
> - Tiny single-column link list that should match the item → `"navigation"` only.
>
> **Nested pending (forms/patterns parity):** When the parent header/page still has `blockish/ai-preview`, opening it (or Settings Accept) auto-unwraps nested mega CPT pending content via `megamenuId` — same as `core/block` `ref` and `blockish-forms/form` `formId`. Prefer Accept on the parent after staging both; nested mega resolves first.
>
> **Offcanvas:** Synced copy becomes accordion-like tree; mega panel is desktop/navmenu positioning — keep mega content usable when mirrored, or rely on sync only for simple structures.

#### Content / structure

| Attribute | Type | Notes |
|---|---|---|
| `megamenuId` | Scalar (number) | Required for output. ID of `blockish_megamenu` post. |
| `widthMode` | Scalar | **Required in AI schemas.** `"navigation"` — match nav width (narrow; only for tiny lists). `"full"` — edge-to-edge. `"custom"` — use `customWidth` (capped to screen). **Do not omit** — omitting leaves default `"navigation"` and breaks wide mega designs. |
| `customWidth` | RangeUnit | Required when `widthMode: "custom"`. |
| `positionAlign` | Scalar | `"left"` \| `"center"` \| `"right"`. Meaningful mainly with **custom** width. Prefer `"center"` for multi-column megas. |
| `alignRelativeTo` | Scalar | `"navigation"` (default) \| `"viewport"` \| `"item"`. Align box for custom width. |
| `offsetY` / `offsetX` | RangeUnit | Top / horizontal offset for the panel. |

Data attrs on the wrapper: `data-width-mode`, `data-position-align`, `data-align-relative-to`, `data-custom-width`, `data-offset-y`, `data-offset-x`.

#### Markup

```html
<div
  class="wp-block-blockish-navmenu-megamenu blockish-navmenu-megamenu is-width-custom"
  data-width-mode="custom"
  data-position-align="center"
  data-align-relative-to="navigation"
  data-custom-width="1100px"
  data-offset-y=""
  data-offset-x=""
>
  <!-- do_blocks( mega menu CPT content ) -->
</div>
```

Style mega **content** on the CPT blocks / Class Manager — not inventing wrappers here. Panel shell positioning is JS + these attrs.

#### Already-there CSS

```css
.blockish-navmenu-megamenu {
  box-sizing: border-box;
  min-height: 0 !important;
}
```

#### Workflow for AI

1. `manage-post` create `post_type: "blockish_megamenu"`, `post_title`, `block_schema` (e.g. multi-column `blockish/container`).
2. Accept CPT in editor if staged; note returned `post_id`.
3. On the header/page nav item, nest with **`widthMode` matched to the CPT** (wide layouts → `custom` + `customWidth`, never bare defaults):

```json
{
  "name": "blockish/navmenu-item",
  "attributes": { "label": "Products", "url": "/products" },
  "innerBlocks": [
    {
      "name": "blockish/navmenu-megamenu",
      "attributes": {
        "megamenuId": 123,
        "widthMode": "custom",
        "customWidth": { "Desktop": { "value": 1100, "unit": "px" } },
        "positionAlign": "center",
        "alignRelativeTo": "navigation"
      }
    }
  ]
}
```

#### Minimal schema (embed only — preferred default for designed megas)

```json
{
  "name": "blockish/navmenu-megamenu",
  "attributes": {
    "megamenuId": 123,
    "widthMode": "custom",
    "customWidth": { "Desktop": { "value": 1100, "unit": "px" } },
    "positionAlign": "center",
    "alignRelativeTo": "navigation"
  }
}
```
