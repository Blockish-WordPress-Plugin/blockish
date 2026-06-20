# Blockish Class Manager Reference

## What is the Class Manager?

The Class Manager lets you create named, reusable CSS classes and apply them to Blockish blocks. Instead of writing one-off inline styles per block, you define a class once and attach it to any number of blocks.

Classes are stored as WordPress custom posts of type `blockish-classes`. Their CSS is stored in the `blockishClassManagerStyles` post meta and is output to the page `<head>` for any page that uses the class.

**Rule: the decision is about reuse, not just attribute availability.**

- **One-off style, used on a single block instance:** set the matching attribute directly (check `blockish/get-block-docs` for a global or block-specific attribute first — background, border, padding, typography, box-shadow, etc.). Only fall back to `customCss` if no attribute covers it. Do not create a class for a one-off.
- **The same style is needed on many blocks or repeats across pages:** create a Class for it — **even if an attribute exists** that could produce the same style. Repeating an attribute's value (especially a Stringified-JSON one like `background`/`border`/`boxShadow`) on every block duplicates that styling data and the CSS generated from it on every single instance. A Class is defined once and referenced by name everywhere it's used, so the CSS stays optimized instead of duplicated.
- **No attribute exists for the property at all, and it's needed on many blocks:** Class Manager — no question.

So: reusable → Class (regardless of whether an attribute could also do it). One-off → attribute first, `customCss` only as last resort.

---

## Two Types of Classes

### Parent class

- Created with no `parent_id`
- Identified by a slug derived from its name: `"hero card"` → `.hero-card`
- Adds the slug as a CSS class directly to the block's wrapper element (whatever tag that block uses — `<div>`, `<ul>`, `<li>`, `<figure>`, `<h1>`–`<h6>`, etc., not always a `<div>`)
- CSS is written using `.{slug}` as the selector

### Child class (subselector)

- Created with a `parent_id` pointing to an existing parent class
- Identified by its post ID, **not** its name: selector is always `.blockish-cm-{post_id}`
- Adds `blockish-cm-{post_id}` to the block's wrapper element (same tag the block actually renders, not necessarily a `<div>`)
- Used to create per-block variations of a parent style
- **Requires the parent class to also be applied to the same block** — child classes are skipped if the parent is not applied

---

## Name Normalization Rules

The `name` you pass is auto-normalized:

| Rule | Example input | Result |
|---|---|---|
| Lowercase | `Hero Card` | `hero-card` |
| Spaces → hyphens | `hero card` | `hero-card` |
| Only `a-z 0-9 - _` allowed | `hero@card!` | `herocard` |
| Must start with letter or `_` | `2card` | invalid → empty string |

Check the `name` value in the API response — that is the actual normalized slug that will be used as the CSS class.

---

## Workflow: Create and Apply a Class

### Step 1 — Check existing classes

Always call `blockish/get-classes` first. It returns all classes with their `post_id`, `name`, `css_selector`, and `parent_id`. Avoid creating duplicates.

### Step 2 — Create the class

Call `blockish/manage-class` with `action: "create"`.

The response includes:
- `post_id` — the WordPress post ID of this class
- `name` — the normalized slug (parent) or display name (child)
- `css_selector` — the exact CSS selector to use when writing CSS

### Step 3 — Apply the class to a block

Add `classManager` and/or `classManagerSubselector` to the block's `attributes` object in your schema.

### Step 4 — Write CSS

Write CSS using the `css_selector` from the response as the root selector. See the CSS section below.

---

## Block Attribute Formats

### `classManager` — apply a parent class

```json
"classManager": [{"id": 45, "title": "hero-card"}]
```

- `id` — `post_id` from the create/get response
- `title` — normalized slug (the `name` field from the response)
- Multiple: add more objects to the array

### `classManagerSubselector` — apply a child class

```json
"classManagerSubselector": [{"id": 67, "title": "featured", "parent": 45}]
```

- `id` — `post_id` of the child class
- `title` — the child class name/display label
- `parent` — **required** — `post_id` of the parent class

**The `parent` key is mandatory.** Without it, PHP will not add the `blockish-cm-{id}` class to the block wrapper and the child class CSS will never apply.

### Full example — block with parent + child class

```
<!-- wp:blockish/container {
  "classManager": [{"id": 45, "title": "hero-card"}],
  "classManagerSubselector": [{"id": 67, "title": "featured", "parent": 45}]
} -->
<!-- wp:blockish/heading {"content":"Featured Card"} /-->
<!-- /wp:blockish/container -->
```

The block wrapper will have: `class="bb-abc123 blockish-block-wrapper hero-card blockish-cm-67"`

---

## Writing CSS

### Core rule

The CSS stored in a class is output **verbatim** to the page. The system does NOT add any selector or wrapper. You must write complete, valid CSS rules including the selector.

Use the `css_selector` field returned by `blockish/manage-class` or `blockish/get-classes` as your root selector.

---

### Parent class CSS

`css_selector` for a parent class is `.{normalized-slug}`.

**Basic example:**

```css
.hero-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}
.hero-card:hover {
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);
  transform: translateY(-3px);
}
```

**Targeting child elements inside the block:**

```css
.hero-card h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 12px;
}
.hero-card p {
  color: #6b7280;
  line-height: 1.6;
}
.hero-card a {
  color: #1a73e8;
  text-decoration: none;
}
.hero-card a:hover {
  text-decoration: underline;
}
```

**Pseudo-elements:**

```css
.hero-card::before {
  content: "";
  display: block;
  width: 40px;
  height: 3px;
  background: #1a73e8;
  margin-bottom: 16px;
}
```

**Responsive (write at-rules inline):**

```css
.hero-card {
  padding: 32px;
}
@media (max-width: 768px) {
  .hero-card {
    padding: 20px;
  }
}
@media (max-width: 480px) {
  .hero-card {
    padding: 16px;
    border-radius: 8px;
  }
}
```

---

### Child class CSS

`css_selector` for a child class is `.blockish-cm-{post_id}`.

The child class adds this class to the same block wrapper alongside the parent class. So both `.hero-card` and `.blockish-cm-67` are on the element at the same time.

**Basic override:**

```css
.blockish-cm-67 {
  background: #e8f0fe;
  border: 2px solid #1a73e8;
}
.blockish-cm-67:hover {
  background: #d2e3fc;
  border-color: #0d47a1;
}
```

**Targeting child elements:**

```css
.blockish-cm-67 h2 {
  color: #1a73e8;
}
.blockish-cm-67 p {
  color: #374151;
}
```

**Using both parent and child selectors for higher specificity:**

```css
.hero-card.blockish-cm-67 {
  border-left: 4px solid #1a73e8;
  padding-left: 28px;
}
```

---

## CSS Writing Rules

| Rule | Detail |
|---|---|
| Full selector required | `{selector} { ... }` — never write bare declarations |
| Standard CSS only | No SCSS/Less. Pseudo-classes, pseudo-elements, combinators, `@media` all valid |
| Include transition in base rule | `.hero-card { transition: all 0.3s ease; }` — not in the `:hover` rule |
| Scope all rules | Every rule must start with `css_selector` to avoid affecting other elements |
| No `!important` | Avoid unless overriding a WordPress core default with no other way |
| CSS is global | Classes are output in the `<head>` — they apply site-wide once the class is assigned |

---

## Common Patterns

### Card with hover lift

```css
.feature-card {
  background: #fff;
  border-radius: 16px;
  padding: 40px 32px;
  border: 1px solid #e5e7eb;
  transition: box-shadow 0.25s ease, transform 0.25s ease, border-color 0.25s ease;
}
.feature-card:hover {
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.1);
  transform: translateY(-4px);
  border-color: #d1d5db;
}
```

### Gradient heading

```css
.gradient-heading {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
```

### Badge / tag

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  background: #e8f0fe;
  color: #1a73e8;
  border-radius: 100px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
```

### Section divider (pseudo-element wave)

```css
.wave-section {
  position: relative;
  padding-bottom: 80px;
}
.wave-section::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 60px;
  background: url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 30 Q300 60 600 30 Q900 0 1200 30 L1200 60 L0 60 Z' fill='%23ffffff'/%3E%3C/svg%3E") no-repeat bottom;
  background-size: cover;
}
```

### Dark variant child class

Parent: `.service-card` — light card
Child (post_id 92): Override for dark card

```css
.blockish-cm-92 {
  background: #0f172a;
  border-color: #1e293b;
}
.blockish-cm-92 h2,
.blockish-cm-92 h3 {
  color: #f1f5f9;
}
.blockish-cm-92 p {
  color: #94a3b8;
}
.blockish-cm-92:hover {
  background: #1e293b;
}
```

---

## Parent vs Child: When to Use Which

| Situation | Type |
|---|---|
| A reusable named style applied to many blocks | Parent |
| A one-off variant of a parent on a specific block | Child |
| Hover / focus / active state of the whole block | Both (put `:hover` in the parent or child CSS) |
| Targeting a specific element inside the block | Both (use descendant selector on either) |
| A "dark" or "featured" version of a base card | Child of the base card class |

---

## Deleting a Class

Use `blockish/manage-class` with `action: "delete"` and the `post_id`. Deleting a parent class automatically deletes all its child classes. Remove the class from any blocks before deleting — orphaned IDs in block attributes are silently ignored but are unnecessary clutter.

---

## CSS Properties Reference

The Class Manager's visual style editor has these panels. Below is every CSS property available per panel, with valid values and a CSS example.

---

### Layout

Controls `display`, flex, and grid layout.

| CSS property | Valid values | Example |
|---|---|---|
| `display` | `block` `inline-block` `flex` `inline-flex` `grid` `inline-grid` `none` | `display: flex;` |
| `flex-direction` | `row` `column` `row-reverse` `column-reverse` | `flex-direction: column;` |
| `flex-wrap` | `nowrap` `wrap` `wrap-reverse` | `flex-wrap: wrap;` |
| `justify-content` | `flex-start` `flex-end` `center` `space-between` `space-around` `space-evenly` | `justify-content: center;` |
| `align-items` | `flex-start` `flex-end` `center` `stretch` `baseline` | `align-items: center;` |
| `column-gap` | any length | `column-gap: 24px;` |
| `row-gap` | any length | `row-gap: 16px;` |

**Grid — fixed columns/rows:**

```css
.card-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  column-gap: 24px;
  row-gap: 24px;
}
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
@media (max-width: 480px) {
  .card-grid {
    grid-template-columns: repeat(1, minmax(0, 1fr));
  }
}
```

**Grid — auto-fit:**

```css
.auto-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(280px, 100%), 1fr));
  gap: 24px;
}
```

**Flex row center:**

```css
.icon-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  column-gap: 16px;
  row-gap: 12px;
}
```

---

### Spacing

| CSS property | Example |
|---|---|
| `padding` | `padding: 40px 32px;` or `padding: 40px 32px 40px 32px;` |
| `margin` | `margin: 0 auto;` |

Individual sides:

```css
.section {
  padding-top: 80px;
  padding-bottom: 80px;
  padding-left: 40px;
  padding-right: 40px;
}
```

---

### Size

| CSS property | Valid values | Example |
|---|---|---|
| `width` | any length / `%` | `width: 100%;` |
| `height` | any length / `vh` | `height: 100vh;` |
| `min-width` | any length | `min-width: 200px;` |
| `min-height` | any length | `min-height: 400px;` |
| `max-width` | any length | `max-width: 960px;` |
| `max-height` | any length | `max-height: 600px;` |
| `overflow` | `visible` `hidden` `auto` `scroll` | `overflow: hidden;` |
| `aspect-ratio` | `auto` `1 / 1` `4 / 3` `3 / 2` `16 / 9` `21 / 9` | `aspect-ratio: 16 / 9;` |
| `object-fit` | `fill` `contain` `cover` `none` `scale-down` | `object-fit: cover;` |

---

### Position

| CSS property | Valid values | Example |
|---|---|---|
| `position` | `static` `relative` `absolute` `fixed` `sticky` | `position: absolute;` |
| `top` | any length | `top: 0;` |
| `right` | any length | `right: 0;` |
| `bottom` | any length | `bottom: 0;` |
| `left` | any length | `left: 0;` |
| `z-index` | integer −999 to 999 | `z-index: 10;` |
| `scroll-margin-top` | any length | `scroll-margin-top: 80px;` (anchor offset) |

**Absolute overlay example:**

```css
.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
}
```

**Sticky header:**

```css
.sticky-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  background: #ffffff;
}
```

---

### Typography

| CSS property | Valid values | Example |
|---|---|---|
| `font-family` | font stack string | `font-family: 'Inter', sans-serif;` |
| `font-weight` | `100`–`900` | `font-weight: 700;` |
| `color` | any CSS color | `color: #111827;` |
| `font-size` | any length | `font-size: 1.125rem;` |
| `text-align` | `left` `center` `right` `justify` `start` `end` | `text-align: center;` |
| `text-decoration` | `none` `underline` `overline` `line-through` | `text-decoration: none;` |
| `text-transform` | `none` `uppercase` `lowercase` `capitalize` | `text-transform: uppercase;` |
| `direction` | `ltr` `rtl` | `direction: ltr;` |
| `font-style` | `normal` `italic` `oblique` | `font-style: italic;` |
| `text-overflow` | `clip` `ellipsis` | `text-overflow: ellipsis;` |
| `line-height` | number or length | `line-height: 1.6;` |
| `letter-spacing` | any length | `letter-spacing: 0.05em;` |
| `word-spacing` | any length | `word-spacing: 0.1em;` |
| `column-count` | integer 1–12 | `column-count: 2;` |

**Text shadow** — same format as box shadow but no `spread` or `inset`:

```css
.drop-text {
  text-shadow: 2px 2px 6px rgba(0, 0, 0, 0.25);
}
```

Multiple text shadows (comma-separated):

```css
.neon-text {
  text-shadow: 0 0 8px #667eea, 0 0 20px #667eea;
}
```

**Text stroke** (webkit):

```css
.outline-text {
  -webkit-text-stroke: 2px #111827;
  color: transparent;
}
```

**Truncate with ellipsis:**

```css
.truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
```

---

### Border

**Linked border (all sides same):**

```css
.card {
  border: 1px solid #e5e7eb;
  border-radius: 12px;
}
```

**Unlinked borders (per side):**

```css
.underline-heading {
  border-top: none;
  border-right: none;
  border-bottom: 2px solid #1a73e8;
  border-left: none;
}
```

**Border radius per corner:**

```css
.pill {
  border-radius: 100px;
}

.top-rounded {
  border-radius: 12px 12px 0 0;
}
```

`border-style` valid values: `solid` `dashed` `dotted` `double` `none`

---

### Background

**Solid color:**

```css
.section-bg {
  background: #f9fafb;
}
```

**Linear gradient:**

```css
.gradient-bg {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
```

**Radial gradient:**

```css
.radial-bg {
  background: radial-gradient(circle at center, #1a73e8 0%, #0d47a1 100%);
}
```

**Background image:**

```css
.hero-bg {
  background-image: url('https://example.com/hero.jpg');
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: scroll;
}
```

`background-size` valid values: `cover` `contain` `auto` or explicit e.g. `100% 100%`
`background-position` valid values: `center center` `top center` `bottom center` `left center` `right center`
`background-repeat` valid values: `no-repeat` `repeat` `repeat-x` `repeat-y`
`background-attachment` valid values: `scroll` `fixed`

**Blend mode** (how element blends with elements behind it):

```css
.blend-overlay {
  mix-blend-mode: overlay;
}
```

`mix-blend-mode` valid values: `normal` `multiply` `screen` `overlay` `darken` `lighten` `color-dodge` `color-burn` `hard-light` `soft-light` `difference` `exclusion` `hue` `saturation` `color` `luminosity`

**Background clip** (clip background to text — for gradient text):

```css
.gradient-text {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
}
```

`background-clip` valid values: `border-box` `padding-box` `content-box` `text`

**Backdrop filter** (blur/filter elements behind this element):

```css
.frosted-glass {
  backdrop-filter: blur(12px) brightness(1.1);
  background: rgba(255, 255, 255, 0.15);
}
```

---

### Effects

**Opacity** (0 = invisible, 1 = fully visible):

```css
.faded {
  opacity: 0.7;
}
.faded:hover {
  opacity: 1;
}
```

**Box shadow:**

```css
.raised {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08), 0 1px 3px rgba(0, 0, 0, 0.06);
}
.raised:hover {
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.08);
}
```

Inset shadow (inner shadow):

```css
.inset-shadow {
  box-shadow: inset 0 2px 6px rgba(0, 0, 0, 0.12);
}
```

Multiple shadows (comma-separated):

```css
.layered-shadow {
  box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.1), 0 12px 40px rgba(0,0,0,0.06);
}
```

---

### Transform

All transform functions go inside a single `transform:` declaration. Combine as needed.

| Function | Unit | Example |
|---|---|---|
| `translateX(v)` | any length | `translateX(20px)` |
| `translateY(v)` | any length | `translateY(-10px)` |
| `translateZ(v)` | px / em / rem | `translateZ(0)` |
| `rotate(v)` | deg | `rotate(45deg)` |
| `rotateX(v)` | deg | `rotateX(15deg)` |
| `rotateY(v)` | deg | `rotateY(-10deg)` |
| `rotateZ(v)` | deg | `rotateZ(5deg)` |
| `scale(v)` | multiplier | `scale(1.05)` |
| `scale3d(x,y,z)` | multiplier | `scale3d(1.1, 1.1, 1)` |
| `skewX(v)` | deg | `skewX(3deg)` |
| `skewY(v)` | deg | `skewY(2deg)` |
| `perspective(v)` | px | `perspective(800px)` |

**Combining transforms:**

```css
.flip-card {
  transform: rotateY(180deg) scale(0.95);
}
.lift-scale {
  transform: translateY(-4px) scale(1.02);
}
```

**Transform origin** — pivot point for the transform:

```css
.spin-from-top-left {
  transform-origin: top left;
  transform: rotate(45deg);
}
```

`transform-origin` valid values: `top left` `top center` `top right` `center left` `center center` `center right` `bottom left` `bottom center` `bottom right` — or custom `50% 50%`

---

### Transition

Always write transition in the **base rule** (not in the `:hover` rule). The transition triggers on both enter and exit.

```css
.animated {
  transition: all 0.3s ease;
}
```

Specific properties only (better performance):

```css
.smooth-card {
  transition: box-shadow 0.25s ease, transform 0.25s ease, opacity 0.25s ease;
}
```

| Part | Values |
|---|---|
| `transition-property` | `all` or specific property names e.g. `opacity, transform` |
| `transition-duration` | seconds e.g. `0.3s` |
| `transition-delay` | seconds e.g. `0s` `0.1s` |
| `transition-timing-function` | `ease` `linear` `ease-in` `ease-out` `ease-in-out` or `cubic-bezier(...)` |

---

### CSS Filters

`filter` property — affects the element itself (image, container, etc.).

```css
.dark-image {
  filter: brightness(0.7) contrast(1.1);
}
.grayscale {
  filter: grayscale(100%);
}
.blur-bg {
  filter: blur(4px);
}
```

| Function | Unit | Normal | Example effect |
|---|---|---|---|
| `blur(v)` | `px` | `0` | `blur(4px)` → soft blur |
| `brightness(v)` | `%` | `100%` | `brightness(70%)` → darker |
| `contrast(v)` | `%` | `100%` | `contrast(130%)` → more contrast |
| `saturate(v)` | `%` | `100%` | `saturate(0%)` → desaturate |
| `hue-rotate(v)` | `deg` | `0deg` | `hue-rotate(180deg)` → invert hue |
| `invert(v)` | `%` | `0%` | `invert(100%)` → negative |
| `grayscale(v)` | `%` | `0%` | `grayscale(100%)` → B&W |
| `sepia(v)` | `%` | `0%` | `sepia(80%)` → warm tint |
| `opacity(v)` | `%` | `100%` | `opacity(50%)` → semi-transparent |

Combining:

```css
.cinematic {
  filter: contrast(115%) brightness(95%) saturate(110%);
}
```

`backdrop-filter` — same functions but affects the elements **behind** this element:

```css
.glass-panel {
  backdrop-filter: blur(16px) brightness(1.05);
  background: rgba(255, 255, 255, 0.1);
}
```

---

### Custom CSS (inside a class)

Use `{{SELECTOR}}` to reference the current class's selector. This allows writing nested rules without hardcoding the class name.

```css
{{SELECTOR}} {
  position: relative;
  overflow: hidden;
}
{{SELECTOR}}::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0,0,0,0.6) 100%);
  pointer-events: none;
}
{{SELECTOR}}:hover::after {
  background: linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.7) 100%);
}
```

**Note:** `{{SELECTOR}}` is only processed when using the Gutenberg visual editor's Custom CSS panel. When writing CSS via the MCP API (`blockish/manage-class`), replace `{{SELECTOR}}` with the actual `css_selector` value from the response (e.g., `.hero-card` or `.blockish-cm-67`).

---

## API Quick Reference

| Ability | When to call |
|---|---|
| `blockish/get-classes` | Before creating to check duplicates; to get `post_id` and `css_selector` of existing classes |
| `blockish/manage-class` (create) | Create a new class. Returns `post_id`, `name`, `css_selector` |
| `blockish/manage-class` (update) | Update name or CSS of an existing class |
| `blockish/manage-class` (delete) | Remove a class permanently |
