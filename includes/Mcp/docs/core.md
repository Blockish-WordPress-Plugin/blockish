# Blockish Block Reference

## 1. How to read this doc

You build a **schema**: a JSON tree of `{ name, attributes, innerBlocks }`.

- `name` — e.g. `"blockish/container"`.
- `attributes` — only values that differ from defaults. Omit = default.
- `innerBlocks` — child schema nodes (only when "Accepts children: yes").

**Never** write block HTML, hand-built markup, or layout CSS into `post_content`. Always stage via `block_schema` (`blockish/ai-preview` → user Accept/Discard). Share `edit_url`, not live preview URLs.

### Docs mismatch or plugin bug (escape hatch)

If `get-block-docs` / convert-css looks wrong vs the inspector: do **not** invent CSS or attributes. Re-read the per-block doc. Then open **only** the matching files on the public repo at the **installed plugin version** (see `blockish/get-designer-workflow` → `stuck_recovery`): `includes/Mcp/docs/blocks/{slug}.md` and `src/blocks/{slug}/block.json`. Retry once from those files. Still stuck: stop, report to the user, offer a GitHub issue **draft** — do not open the issue yourself. Support: [wordpress.org/support/plugin/blockish](https://wordpress.org/support/plugin/blockish/). Repo: [Blockish-WordPress-Plugin/blockish](https://github.com/Blockish-WordPress-Plugin/blockish).

### Styles vs content (critical)

| Concern | How |
|---|---|
| **Content / structure / hard rules** | Per-block doc: content attributes, which class/markup appears when, child rules. |
| **What already exists** | Per-block doc: the **Markup** cases + **Already-there CSS** (stylesheet + defaults as CSS). Read before writing styles. |
| **Visual style** | Prefer Class Manager raw `css` (`manage-class`) + `"classManager": "name1, name2"`. Use `convert-css` `css_to_schema` only for true one-offs. Read Already-there CSS first — omit what already applies. |

Content attributes are **never** produced by convert-css.
Per-block docs intentionally omit converter-covered visual attribute shapes (Typography, Background, Border, …).
Visual defaults live in block `style.scss` at `:where()` specificity (spec 0) so Class Manager and explicit attributes can override; only structural/class-driving defaults remain in `block.json`.

### `css_to_schema` (preferred)

Build the whole section, then convert once:

```json
{
  "action": "css_to_schema",
  "block_schema": [
    {
      "name": "blockish/container",
      "attributes": { "metadata": { "name": "Hero Section" } },
      "css": "{{ROOT}} { padding: 100px 24px; background: #fff; }",
      "innerBlocks": [
        {
          "name": "blockish/heading",
          "attributes": { "text": "Build faster" },
          "css": "{{ROOT}} { font-size: 64px; color: #111; }"
        }
      ]
    }
  ]
}
```

- `{{ROOT}}` = this node's wrapper (fixed keyword — do not invent `.hero` / `.x`).
- Descendants / `:hover`: `{{ROOT}} .blockish-button-link`, `{{ROOT}}:hover`, using Markup classes.
- Content/data stay in `attributes`; styles stay in `css`.
- Returned `block_schema` has `css` stripped and style attrs merged — push it to manage-pattern / manage-post.
- Same block type many times is fine: each node carries its own `css`.

### How to read a per-block page

1. **Content / structure** — attrs you set by hand (`text`, `url`, `display`, …).
2. **Markup** — default HTML + table of which attribute changes which class/element. Use these selectors when writing CSS.
3. **Already-there CSS** — what the block already ships. Do **not** re-declare it in Class Manager or convert-css (no redundant `display:flex`, image `width:100%`, default button `transition`, zero margins already set). Write only overrides / deltas — see `get-class-manager-docs` §2a.
4. **Minimal schema** — content-only starter.

**Naming:** Top-level layout blocks should set `metadata.name` (e.g. `"Hero Section"`).

### `manage-post` page assembly

1. Create patterns first via `blockish/manage-pattern` — use only **returned real IDs**.
2. Stage page with `block_schema` pattern refs only. Full-bleed: `{"name":"core/block","attributes":{"ref":163,"align":"full"}}`. Content-width: omit `align` or use `"wide"`.
3. After staging: `trigger-refresh`, share **`edit_url`**.
4. **Never** put `core/template-part` header/footer on a page.
5. Templates use `block_schema` via `manage-template`.

**meta_input:** Never invent meta keys — user supplies them, or `blockish-dynamicity/get-meta-list` when Dynamicity is active.

**Undo live content:** `get-revisions` → `restore-revision` only when asked. Pending preview = Discard in editor.

### Prefer fetch → modify → update

Do not invent complex schemas from scratch unless creating something new.

1. Fetch with `get-posts` / `get-templates`.
2. Edit the returned `schema`.
3. Restage via `manage-post` / `manage-template` / `manage-pattern`.
4. Share `edit_url` + `trigger-refresh`.

---

## 2. Content attribute shapes

Style shapes (Typography, Background, Border, shadows, filters, text-stroke) are produced by **convert-css** — do not hand-author them. Below are shapes you still set manually for **content/data**.

### Scalar

Plain string, number, or boolean.

```json
"text": "Click Here"
"defaultOpen": true
```

### Option

`{ "label": "...", "value": "..." }` — always send both. Never a bare string: the
control is a react-select and it reads `value`/`label` off the object, so a string
leaves the field blank in the editor even though the front end may still render.

```json
{ "label": "H2", "value": "h2" }
```

Option vs Scalar is a per-attribute fact, not a per-property one — the same CSS idea
can be an Option in one block and a bare string in another (`blockish-dynamicity/loop`
`justifyContent` is an Option; `blockish/tab` `justify` is a Scalar string). Trust the
type column in the block's own doc, and let convert-css emit the shape for styles.

### Responsive / Responsive-Option

`{ "Desktop": ..., "Tablet": ..., "Mobile": ... }` — only `Desktop` required. Responsive-Option wraps an Option per device.

Prefer letting convert-css emit these from `@media` CSS when the value is stylistic.

### Icon

1. Standard: `{ "viewBox": [x,y,w,h], "path": "..." }`
2. Complex SVG: `{ "viewBox": "custom", "path": "custom", "svg": "<svg>...</svg>" }`

Prefer `blockish/get-icons` first. If you invent a placeholder, tell the user.

### Link

```json
{ "url": "https://example.com", "newTab": false, "noFollow": false }
```

### Image

```json
{ "id": 123, "url": "https://example.com/photo.jpg", "width": 1200, "height": 800 }
```

Use `id: 0` when only a URL is known.

### Visual style payloads

Never hand-author or escape Typography, Background, Border, shadow, filter, overlay, text-stroke, responsive spacing, radius, or transform attributes. `convert-css` owns those shapes.

---

## 3. Global behavior (every block)

Never set `blockClass`, `styles`, or `preview` (internal).

Root visual CSS is merged automatically with every block’s converter map.

### Visibility (`hideOn`)

```json
"hideOn": { "Desktop": false, "Tablet": true, "Mobile": true }
```

Do **not** use `customCss` + `display:none` for responsive hide.

### Interactions (`interactionData`)

See §9 in the footer. Prefer entrance presets over hand-written animation CSS.

### Class Manager

**Preferred styling path.** Write raw `css` via `manage-class`, attach `"classManager": "hero-card, cta"`. `!important` is preserved via customCss. Track usage with `get-class-usage`; clean with `manage-class` `action:"sweep"`. See §5 / `get-class-manager-docs`.

---

## 4. `customCss` — leftovers only

Order of preference:

1. Reused / section chrome → **Class Manager** (default).
2. True one-off covered by attributes → **convert-css** (not hand-built attrs).
3. Truly unsupported CSS after convert → `customCss` with `{{SELECTOR}}`.

Convert-css already puts unmapped rules into `customCss` — merge that output; don't reinvent it.

```json
"customCss": "{{SELECTOR}} .inner { clip-path: circle(50%); }"
```

---

## 5. Class Manager

Prefer Class Manager over packing style attributes onto every block. Workflow: `get-class-manager-docs` → `get-classes` → `manage-class` with raw `css` → attach by **name**:

```json
"classManager": "hero-card, section-title"
```

`manage-class` reads the class name from the selector (`.hero-card { … }`), so you just send `css` — existing class → updated (full replace, resend the whole stylesheet), new → created. One css string may define several classes. On write, Blockish seeds the parent’s generated-CSS meta with the complete stylesheet so styles apply before the editor generator runs.

- `get-class-usage` — where each class is used / unused list.
- `manage-class` `{ "action": "sweep", "confirm": true }` — delete unused parents.
- Cloud templates may ship `dependencies.classes` — import + remap ids before staging.

One-off block styles still use `convert-css` / `css_to_schema` — do not create a class for a single use.

---
