=== Blockish – MCP AI Site Builder for Block Editor ===
Author: wowdevs
Author URI: https://wowdevs.com/
Plugin URI: https://blockish.wowdevs.com/
Contributors: bdkoder, mizan42047
Donate link: https://wowdevs.com/
Tags: mcp, ai site builder, gutenberg, block editor, class manager
Tested up to: 7.1
Stable tag: 1.3.0
Requires at least: 6.2
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build sites with AI via MCP (Cursor, Claude). 35+ Gutenberg blocks, Class Manager, and review & Accept in the editor.

== Description ==

**Blockish connects MCP-compatible AI assistants to the Block Editor** so you can design real WordPress layouts with natural language — not just edit posts or run admin tasks.

Connect Cursor, Claude Desktop, Windsurf, or another MCP client, then ask for a section or page. Blockish gives the AI **35+ structured Gutenberg blocks** and a **Class Manager** for reusable CSS, so generated layouts stay clean, responsive, and editable in the native block sidebar.

You can still build manually. When AI helps, you review an inline preview and Accept before anything goes live.

= AI Site Building Workflow =
1. **Connect:** Use the 1-click config wizard to connect your site to an MCP-enabled AI client (Cursor, Claude, Windsurf, etc.).
2. **Prompt:** Tell your AI what kind of page or section you need.
3. **Generate:** The AI builds with Blockish blocks directly in the Gutenberg editor.
4. **Refine:** Review the inline preview and Accept, or ask for tweaks to colors, spacing, and typography.

== Why Blockish Blocks are Different ==

Blockish is built so both humans and AI assistants can work in the same Gutenberg canvas:

* **Clean Architecture:** Semantic, predictable block structures that AI tools can reason about reliably.

* **Class Manager System:** Create and apply reusable CSS classes instead of one-off inline styles — cleaner markup and a consistent design system.

* **Theme.json Integration:** Update global typography and colors through MCP abilities.

* **Human-Friendly:** After generation, edit everything with standard Gutenberg sidebars.

== Powerful Features ==

* **Template Library:** 1-click page and pattern import in the Block Editor.
* **Magic Login:** Secure 1-click login from your AI agent.
* **AI Preview Queue:** Review staged layouts with live Class Manager CSS, pending count badges, and 1-click Accept or Discard.
* **Interactions:** Entrance presets, emit/listen signals, custom JS, plus page-level and global libraries.
* **Visibility:** Hide blocks per device (desktop / tablet / mobile) without custom CSS.
* **Add-ons hub:** Discover companion products (Forms, Dynamicity) from the Blockish dashboard.

== 35+ AI-Optimized Blocks ==

Built for AI-assisted design — and fully usable for manual site building:

= Layout & Custom HTML =

* **Container** — Flexible section wrapper with background, spacing, flexbox/grid, and layout controls.

* **HTML Wrapper** — Dynamic HTML wrapper container with custom tag selection, InnerBlocks, and key-value attributes.

* **HTML Child** — Dynamic semantic HTML element with custom tag, optional text content, and key-value attributes.

* **Carousel** — InnerBlocks carousel for heroes, testimonials, and logo strips (with Carousel Slide children).

* **Before/After Slider** — Interactive image comparison with a draggable handle.

= Typography =

* **Heading** — Customizable headings with typography, colors, and shadow options.

* **Paragraph** — Paragraph block with typography, spacing, and styling controls.

= Media =

* **Image** — Image block with overlay, border, mask, alignment, and optional lightbox.

* **Video** — Embed and style videos with custom play buttons and wrapper controls.

* **Icon** — Scalable SVG icons with color, size, and hover effects.

= Theme & Query =

* **Site Title / Tagline / Logo** — Site identity blocks for headers and footers.

* **Post Title / Excerpt / Content / Featured Image / Post Info** — Single-post and loop-ready content blocks.

* **Query Title / Query Total / Archive Description** — Archive and search context blocks.

= Interactive =

* **Accordion** — Collapsible content sections for FAQs, features, and more.

* **Tab** — Tabbed content panels for organizing information.

* **Navigation** — Flexible navigation for headers (nav menu, items, submenu, mega menu, offcanvas).

* **Mega Menu** — Full-width, custom-width, and navigation-aligned rich dropdowns with block layouts.

* **Submenu** — Nested flyout dropdown menus with responsive alignment and gap controls.

* **Offcanvas** — Slide-out panel for menus, filters, and secondary content.

= Data & Stats =

* **Countdown** — Dynamic countdown with boxes, inline, stacked, circular ring, and flip-clock digit layouts.

* **Counter** — Animated number counter for statistics and milestones.

* **Progress Bar** — Progress bars with labels, colors, and animations.

* **Rating** — Star rating display for reviews and testimonials.

= Lists & Icons =

* **Icon List** — Icon-based lists instead of plain bullets.

= Social & CTA =

* **Social Icons** — Social links with shapes, colors, and sizes.

* **Button** — Call-to-action buttons with hover effects and icons.

= Maps =

* **Google Map** — Embed maps with zoom, height, and location settings.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/blockish` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Navigate to **Blockish -> MCP Server** in your dashboard to generate your AI connection command!

== Frequently Asked Questions ==

= What is the MCP AI Engine? =

Blockish includes a native MCP (Model Context Protocol) server. Connect an MCP-compatible AI agent (Claude Desktop, Cursor, Windsurf, and more) to generate and style Gutenberg layouts with natural language.

= Do I need a separate page builder? =

No. Blockish extends the native Gutenberg editor with layout blocks and styling controls. With an AI assistant connected over MCP, you can design full sections and pages without a third-party page builder.

= What is the Class Manager? =

The Class Manager lets you (and the AI) create, edit, and apply reusable CSS classes in the editor — a consistent design system without messy one-off styles.

= Is this plugin free? =

Yes. Core Blockish is free on unlimited personal or client sites. Optional add-ons (such as Forms and Dynamicity) add forms and dynamic query/loop features when you need them.

== External Services ==

This plugin connects to external services under the conditions described below. No data is ever sent without a clear user action or explicit opt-in.

= 1. Freemius (freemius.com) =

**What it does:** Powers optional product opt-in, licensing for companion add-ons (such as Forms and Dynamicity), software updates, and anonymous usage insights that help improve Blockish. This uses the Freemius WordPress SDK bundled with the plugin.

**When it connects:** **Only if you explicitly opt in** (or activate a license) when Freemius prompts you in wp-admin. Skipping or declining opt-in means no Freemius analytics/licensing traffic for that flow. You can change your opt-in / license status later from the Blockish dashboard (Addons) or Freemius account controls.

**Data sent:** Non-sensitive environment and product data typical of Freemius (for example plugin version, WordPress version, site URL, and similar technical details used for licensing, updates, and insights). No passwords or post content are sent as part of this integration.

**Service:** Freemius, Inc.
Service URL: https://freemius.com/
Privacy Policy: https://freemius.com/privacy/
Terms of Service: https://freemius.com/terms/

== Screenshots ==

1. One-Click MCP Connection Wizard
2. AI generating layouts directly in the Gutenberg canvas
3. Container Block Options
4. Heading Styling Options
5. Interactive Accordions and Tabs
6. Data Visualization (Counters, Progress Bars, Ratings)
7. Class Manager Extension Panel

== Changelog ==

= 1.3.0 =

* Added: Nav Menu Mega Menu and Nav Menu Submenu blocks with responsive alignment, custom offsets, width controls (navigation, full, custom), and offcanvas accordion sync
* Added: Mega Menus management tab in Blockish Settings with live template previews, search, and direct edit shortcuts
* Added: Countdown block with multiple layouts (boxes, inline, stacked, circular ring, and flip-digit clock) and dynamic date binding support
* Added: HTML Wrapper and HTML Child dynamic blocks for custom HTML tag structures and key-value attributes
* Added: Core Interactions CSS motion player and visual builder UI supporting scroll, scrub, and toggle triggers
* Added: Real-time AI preview pending count badge in the admin toolbar and GetAiPreviewPending MCP ability
* Improved: AI Preview resolution pipeline with live Class Manager CSS rendering in Settings preview cards
* Improved: MCP developer documentation and schema definitions for navigation and interactions

= 1.2.9 =

* Improved: PHPCS/WPCS configuration — focus on security and compatibility checks; skip formatting-only sniffs
* Fixed: PHP 7.4 compatibility in MCP Json Helper (removed union return type)
* Fixed: Prepared SQL, exception escaping, and empty-code hygiene across MCP callbacks and AI Preview
* Fixed: Magic Login redirect encoding (no double urlencode; `add_query_arg` handles encoding)
* Improved: Media upload cleanup uses `wp_delete_file()`; stricter base64 decode for MCP uploads

= 1.2.8 =

* Added: Theme Builder extension (classic themes) — build headers, footers, and page templates with Blockish blocks; includes WooCommerce template and part starters
* Added: MCP support for Theme Builder — AI can list and stage classic-theme templates and template parts via `get-templates` and `manage-template`
* Added: Theme Override control on blocks — choose when Blockish styling should win over theme CSS
* Improved: MCP-created pages and posts default to published status (layout changes still stage for Accept/Discard in the editor)
* Improved: AI Preview Accept/Discard bar overlays the staged layout instead of leaving a blank row at the top
* Note: Theme Builder is for classic themes only — block themes continue to use the Site Editor

= 1.2.7 =

* Added: Dashboard overview and MCP connect YouTube walkthroughs (separate videos)
* Improved: Helpful Links — docs, roadmap, and contact point to blockish.wowdevs.com
* Improved: Class Manager editor CSS loads from a revisioned bundle instead of every class entity (fewer editor REST requests)

[See full changelog history in CHANGELOG.md](https://github.com/Blockish-WordPress-Plugin/blockish/blob/main/CHANGELOG.md)

