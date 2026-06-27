# Blockish — Claude Guide

**Stack:** WordPress Gutenberg blocks plugin | PHP 7.4+ | WP 6.1+ | Namespace: `Blockish\`  
**Version:** 1.0.7 | **Text Domain:** `blockish` | **Author:** wowdevs

> **Maintenance:** This file is the canonical context doc for the plugin. Whenever you make a structural change — new/removed block, extension, REST route, DB option key, or a shift in architecture/conventions — update the relevant section below in the same session, not as a follow-up.

## Rules
- Edit `src/` (JS/SCSS) and `includes/` (PHP) only — never touch `build/`
- Don't run `npm run build` / `wp-scripts build` manually — the user runs a watch-mode dev server that rebuilds automatically
- New PHP classes go in `includes/`, instantiate in `Blockish::plugins_loaded()`
- All PHP classes use `SingletonTrait` — access via `ClassName::get_instance()`

## Directory Map
```
src/blocks/[name]/     # block.json, index.js, edit.js, save.js, inspector.js, *.scss
src/extensions/[name]/ # Extensions that inject attributes into existing blocks
src/components/        # Reusable React components
src/controls/          # Custom block editor controls
src/global/            # Global attributes applied to ALL blocks (padding, margin, typography, etc.)
src/helpers/           # Shared utility functions
includes/Config/       # BlocksList.php, ExtensionList.php — register/enable/disable
includes/Core/         # Blocks.php, StyleGenerator.php, Enqueue.php, Utilities.php
includes/Routes/       # REST API (BlocksV1, ExtensionsV1, SVGUploaderV1)
build/                 # Compiled webpack output — DO NOT edit
```

## New Block Checklist
1. `src/blocks/[name]/` — `block.json`, `index.js`, `edit.js`, `save.js`, `inspector.js`, `*.scss`
2. Name: `blockish/[name]` | Category: `blockish-framework`
3. Register in `includes/Config/BlocksList.php`

## block.json CSS Patterns
```json
"color":      { "selectors": { ".{{WRAPPER}} .el": "color: {{VALUE}};" } }
"background": { "groupSelector": { "type": "BlockishBackground", "selector": ".{{WRAPPER}}" } }
"padding":    { "type": "object", "default": { "Desktop": "10px", "Tablet": "6px", "Mobile": "4px" },
                "selectors": { ".{{WRAPPER}}": "padding: {{VALUE}};" } }
"opacity":    { "selectors": { ".{{WRAPPER}}": "opacity: {{VALUE}};" },
                "condition": { "relation": "AND", "rules": [{ "condition": "not_empty", "key": "otherAttr", "value": "" }] } }
```

**groupSelector types:** `BlockishBackground` `BlockishBorder` `BlockishBoxShadow` `BlockishTextShadow` `BlockishTypography` `BlockishCSSFilters` `BlockishTextStroke` `BlockishBackgroundOverlay`

**CSS scoping:** `{{WRAPPER}}` → `.bb-[uniqueId].blockish-block-wrapper` — CSS output inline per page, cached 24h.  
**Breakpoints:** Desktop (base) | Tablet (≤1024px) | Mobile (≤768px) — use object values to make any attribute responsive.  
**Placeholders:** `{{VALUE}}` `{{TOP}}` `{{BOTTOM}}` `{{LEFT}}` `{{RIGHT}}` `{{TOP_LEFT}}` `{{TOP_RIGHT}}` `{{BOTTOM_LEFT}}` `{{BOTTOM_RIGHT}}`

## New Extension Checklist
1. `src/extensions/[name]/` — `block.json` (with `include`/`exclude` block list), `index.js`
2. Register in `includes/Config/ExtensionList.php`

## Global Attributes
All blocks auto-receive 100+ attributes from `build/global/block.json` — padding, margin, zIndex, position, width, flexbox, typography, colors, shadows, transforms, transitions, filters, customCss. Don't re-declare these in individual blocks.

**Button wrapper width:** `.blockish-button` wrapper has `width: 100%` by default (`src/blocks/button/style.scss`). To move/position the button (e.g. via Advanced position/margin), set the global `widthType` to `auto` first — otherwise the 100% width fights the positioning.

## Key Files
| Task | File |
|---|---|
| Enable/disable blocks | `includes/Config/BlocksList.php` |
| Enable/disable extensions | `includes/Config/ExtensionList.php` |
| Block registration | `includes/Core/Blocks.php` |
| CSS generation | `includes/Core/StyleGenerator.php` + `Utilities.php` |
| Asset enqueueing | `includes/Core/Enqueue.php` |
| Asset deps/version | `build/blocks/[name]/index.asset.php` (auto-generated, never edit) |

## REST API (`manage_options` required)
- `GET|POST /wp-json/blockish/v1/blocks` — list / toggle blocks
- `GET|POST /wp-json/blockish/v1/extensions` — list / update extensions
- `GET|POST|DELETE /wp-json/blockish/v1/custom-svg-icons` — SVG icons

## DB Option Keys
`blockish_block_list` | `blockish_extension_list` | `blockish_extension_schema_registry` | `blockish_upload_svg_icons`

---

## JS Coding Guidelines

**Imports:** WordPress packages first, then local — `@wordpress/blocks`, `@wordpress/block-editor`, then `./edit`, `./style.scss`  
**Hooks:** Use `useBlockProps` / `useInnerBlocksProps` from `@wordpress/block-editor` — never add block wrapper manually  
**State:** Use `setAttributes` for all attribute changes — never local `useState` for data that should persist  
**Class names:** Use `clsx` for conditional classes, never string concatenation  
**Icons:** Import from `@wordpress/icons` or the plugin's own icon set — don't inline SVGs in JS  
**No comments** unless the logic is genuinely non-obvious (a workaround, a hidden constraint)  
**No console.log** in committed code  
**Inspector:** All sidebar controls go in `inspector.js`, not inline in `edit.js`  
**save.js:** Must be pure/deterministic — no randomness, no Date, no Math.random — or block validation breaks  
**view.js:** Only add when block needs frontend JS (accordions, sliders, counters) — import it via `viewScript` in block.json  
**Formatting:** `npm run format` before committing

### Naming
- Block wrapper class: `blockish-[block-name]` (e.g. `blockish-accordion`)
- Child element classes: BEM — `blockish-accordion__item`, `blockish-accordion__item--active`
- Attribute names: camelCase — `borderRadius`, `textColor`, `isOpen`

---

## PHP Coding Guidelines

**Namespace:** Every class must declare `namespace Blockish\[Subfolder];`  
**Singleton:** Use `SingletonTrait` — never instantiate with `new ClassName()` from outside  
**Static helpers:** Pure utility methods go in `Utilities.php` as `public static function`  
**Sanitization:** Always sanitize REST input — `sanitize_text_field()`, `absint()`, `wp_kses_post()` as appropriate  
**Capabilities:** All REST routes require `current_user_can('manage_options')` check  
**No direct DB queries:** Use `get_option` / `update_option` for plugin data — no raw `$wpdb` unless unavoidable  
**No die/exit:** Use `wp_send_json_error()` / `wp_send_json_success()` for AJAX; proper WP_Error for REST  
**Hooks:** Register hooks in the class constructor — never in a static method or global scope  
**Type hints:** Use PHP 7.4 property types and return type hints on all new methods  
**No comments** unless explaining a non-obvious WordPress quirk or intentional workaround

### Naming
- Classes: PascalCase matching filename — `class StyleGenerator` in `StyleGenerator.php`
- Methods: snake_case — `get_block_metadata()`, `register_blocks()`
- Variables: snake_case — `$block_name`, `$asset_file`
- Constants: UPPER_SNAKE — `BLOCKISH_VERSION`
- Options: `blockish_` prefix — `blockish_block_list`
