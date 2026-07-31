# Blockish Class Manager Reference

## 1. What AI writes — raw CSS only

Reusable named CSS classes. You read and write **raw CSS** via `get-classes` / `manage-class`.

**Just send `css`.** The class name is read from your selectors — `.hero-title { … }` creates/updates a class named `hero-title`. You do **not** pass `action`, `name`, or `post_id` for normal styling: if the class exists it is updated, otherwise it is created. Create-vs-update is decided for you by matching the name.

You **never** write style-object JSON, and you **never** create child posts yourself. Internally Blockish converts your stylesheet into the Class Manager model the editor UI understands (parent + child posts). That structure is hidden from AI — you only see combined CSS.

**Default styling path:** Prefer Class Manager for almost all visual CSS. Keep `convert-css` for rare one-offs that will never be reused. Attach classes with `"classManager": "name1, name2"` and leave block style attributes empty whenever the class covers the look.

---

## 2. When to make a class

- Same look on many blocks / pages → **create a class** (`manage-class` + `css`) — **preferred**
- Section / card / button / heading chrome you might reuse → **create a class**
- Truly one-off on a single block with no reuse → **convert-css** on that block — do **not** make a class

---

## 3. Write one stylesheet (root + hover + descendants)

```css
.hero-card {
  padding: 28px;
  background: #ffffff;
  border-radius: 16px;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}
.hero-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.14);
}
.hero-card h2 {
  font-size: 1.5rem;
  color: #0f172a;
}
.hero-card:hover h2 {
  color: #7c3aed;
}
```

The leftmost class of each rule names the class, so you can define **several classes in one call** — `.hero-card { … }` and `.hero-title { … }` in the same string become two classes. `.hero-card h2` / `.hero-card:hover` stay as children of `hero-card`.

`{{SELECTOR}}` is still accepted, but only for a **single** class and **only** when you also pass an explicit `name` (the token carries no class name). With real `.class` selectors you never need `name`.

**`!important`:** Allowed in raw CSS. Declarations that include `!important` are stored on that node’s `customCss` (structured Class Manager controls cannot express `!important`). Round-trip via `get-classes` still returns the same CSS.

**What happens internally (AI does not manage this):**

| CSS selector | Class Manager post |
|---|---|
| `.hero-card` | parent `hero-card` |
| `.hero-card:hover` | child `:hover` |
| `.hero-card h2` | child `h2` |
| `.hero-card:hover h2` | child `:hover h2` |

The editor UI shows those children so users can tweak them with structured controls. `get-classes` still returns **one** entry with the combined CSS above.

On every AI write, Blockish also seeds the parent class’s generated-CSS meta with
the complete converted stylesheet immediately. Therefore the editor canvas and
frontend have a working CSS baseline even before the editor-side generator runs.
Child generated-CSS meta is cleared during that seed to prevent stale/duplicate
rules; the editor generator repopulates the normal parent/child split after it
initializes.

---

## 4. Selector rules (break = error)

Every selector must start with `.{name}`:

| OK | Error |
|---|---|
| `.hero-card` | `.other-card` |
| `.hero-card:hover` | `div` |
| `.hero-card::before` | `body .hero-card` |
| `.hero-card h2` | `.hero-card, .unrelated` |
| `.hero-card .title` | `#id` |

Name normalization: lowercase, spaces → hyphens, only `a-z 0-9 - _`, must start with a letter or `_`.

---

## 5. Workflow

1. **`blockish/get-classes`** — list parents (`post_id`, `name`, `css_selector`, `css`). Reuse when one fits. Read the current `css` before editing — an update is a **full replace**, so resend the complete stylesheet.
2. **`blockish/manage-class`**
   - create or update: `{ "css": ".hero-card { … }\n.hero-card:hover { … }" }` — name read from the selector; existing → updated (full replace, re-syncs children), new → created. Response lists every affected class under `classes`.
   - clear: `{ "name": "hero-card", "css": "" }` (or `{ "post_id": 45, "css": "" }`)
   - delete: `{ "action": "delete", "post_id": 45 }` (deletes children too)
   - force a specific parent: add `"post_id"` to a css write to update that class regardless of name.
3. **Attach by name** (§6).
4. **Usage tracker:** `blockish/get-class-usage` — where each class is attached (`used_in`, `usage_count`, `unused`).
5. **Sweep unused:** `{ "action": "sweep" }` dry-run; `{ "action": "sweep", "confirm": true }` deletes unused parents (optional `post_ids` whitelist).

---

## 6. Applying a class to a block

```json
"classManager": "hero-card, section-title"
```

Also accepted: `["hero-card", "section-title"]` or `[{ "id": 45, "title": "hero-card" }]`.

Staging auto-attaches that parent's child posts so hover/descendants apply on the frontend. Unknown names are skipped — create the class first.

---

## 7. Examples

### Create or update (same call — name comes from the selector)

```json
{
  "css": ".feature-card { padding: 28px; background: #fff; border-radius: 16px; }\n.feature-card:hover { transform: translateY(-4px); }\n.feature-card h2 { font-size: 1.5rem; }"
}
```

If `feature-card` already exists it is replaced with exactly this stylesheet (children re-synced); otherwise it is created. To change it later, resend its **full** css:

```json
{
  "css": ".feature-card { padding: 32px; background: #f8fafc; }\n.feature-card:hover { transform: translateY(-2px); }"
}
```

### Several classes in one call

```json
{
  "css": ".card { padding: 24px; border-radius: 12px; }\n.card-title { font-size: 1.25rem; font-weight: 700; }\n.card-actions { display: flex; gap: 8px; }"
}
```

Response `classes` lists each affected class (`card`, `card-title`, `card-actions`) with its `post_id`, `css_selector`, and whether it was `created`.

### Attach

```json
{
  "name": "blockish/container",
  "attributes": {
    "classManager": "feature-card"
  },
  "innerBlocks": []
}
```

### Usage + sweep

```json
{ "action": "sweep" }
```

```json
{ "action": "sweep", "confirm": true, "post_ids": [45, 62] }
```

---

## 8. Responsive

Use `@media (max-width: 1024px)` (Tablet) and `@media (max-width: 768px)` (Mobile) in the same `css` string. Selectors inside media queries must still start with `.{name}`.

---

## 9. Template library / cloud dependencies

Cloud designs may ship `dependencies.classes` alongside patterns/forms. Each item looks like:

```json
{
  "id": 195,
  "name": "glass-card",
  "css": ".glass-card { … }\n.glass-card:hover { … }",
  "content": "{…optional style object…}",
  "children": []
}
```

On insert, Blockish imports classes locally (same-name reuse), remaps `classManager` / `classManagerSubselector` ids in content, then installs patterns/forms. Prefer `css` on each class dependency.
