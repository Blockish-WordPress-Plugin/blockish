=== Blockish – MCP AI Site Builder for Block Editor ===
Author: wowdevs
Author URI: https://wowdevs.com/
Plugin URI: https://blockish.wowdevs.com/
Contributors: bdkoder, mizan42047
Donate link: https://wowdevs.com/
Tags: mcp, ai site builder, gutenberg, block editor, class manager
Tested up to: 7.0
Stable tag: 1.2.3
Requires at least: 6.2
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build sites with AI via MCP (Cursor, Claude). 30+ Gutenberg blocks, Class Manager, and review & Accept in the editor.

== Description ==

**Blockish connects MCP-compatible AI assistants to the Block Editor** so you can design real WordPress layouts with natural language — not just edit posts or run admin tasks.

Connect Cursor, Claude Desktop, Windsurf, or another MCP client, then ask for a section or page. Blockish gives the AI **30+ structured Gutenberg blocks** and a **Class Manager** for reusable CSS, so generated layouts stay clean, responsive, and editable in the native block sidebar.

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
* **EditorSync:** Keep the open editor in sync when the AI stages changes.
* **Interactions:** Entrance presets, emit/listen signals, custom JS, plus page-level and global libraries.
* **Visibility:** Hide blocks per device (desktop / tablet / mobile) without custom CSS.
* **Add-ons hub:** Discover companion products (Forms, Dynamicity) from the Blockish dashboard.

== 30+ AI-Optimized Blocks ==

Built for AI-assisted design — and fully usable for manual site building:

= Layout =

* **Container** — Flexible section wrapper with background, spacing, flexbox/grid, and layout controls.

* **Carousel** — InnerBlocks carousel for heroes, testimonials, and logo strips (with Carousel Slide children).

* **Before/After Slider** — Interactive image comparison with a draggable handle.

= Typography =

* **Heading** — Customizable headings with typography, colors, and shadow options.

* **Paragraph** — Paragraph block with advanced typography and spacing controls.

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

* **Navigation** — Flexible navigation for headers (nav menu, items, submenu, offcanvas).

* **Offcanvas** — Slide-out panel for menus, filters, and secondary content.

= Data & Stats =

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

= 1.2.3 =

* Added: Settings → AI Preview queue — list pending staged layouts (pages, patterns, templates, template parts) with Gutenberg BlockPreview, search, type filters, and pagination
* Added: Accept / Discard from the Settings list, including multi-select and bulk actions
* Added: Accepting a page from Settings also unwraps nested staged patterns and forms
* Added: Class Manager previous-content snapshots so Accept keeps live CSS and Discard restores the pre-AI stylesheet (or removes a class created in that cycle)
* Improved: Queue matching uses the real `<!-- wp:blockish/ai-preview` block comment so body text cannot fake a pending item
* Improved: Settings Accept serializes with Gutenberg `createBlock` (no PHP fake markup / block recovery)
* Improved: Class Manager popups stay focused without stealing the editor canvas
* Improved: Video block poster handling

= 1.2.2 =

* Added: Global Integrations hub — connect Mailchimp, Kit, HubSpot, Brevo, ActiveCampaign, Zapier, Make, Webhooks, Slack, Discord (and related destinations) from the Blockish dashboard
* Added: Integration setup modal with credential fields and deep links to provider key pages
* Added: REST API for integrations (`IntegrationsV1`) and shared connection helpers used by companion Forms destinations
* Added: License notice surface for companion add-ons / Freemius status in the dashboard
* Added: Containerize — wrap the selected blocks in a Blockish Container from the block settings menu (Ungroup via existing container transform)
* Improved: Interactions editor — separate builders/panels for block, page, and global scopes; clearer footer controls and UI polish
* Improved: MCP interactions abilities (`ManageInteractions`); media manage/upload docs and callbacks
* Improved: SVG upload system and background control style generation
* Improved: Template Library / pattern insert flow when adding designs
* Improved: Add-ons marketing page and integrations dashboard UI

= 1.2.1 =

* Fixed: Freemius REST early boot — companion add-ons register CPT/REST routes correctly (no more missing-route editor save failures); Freemius SDK still skipped on normal front-end views for performance
* Added: PostPrime — early synced-pattern (`core/block` ref) cache priming before block theme template render
* Improved: Class Manager loads published classes once per request (bulk fetch + meta prime) and uses PostPrime for pattern walks
* Improved: Visibility extension uses PostPrime when scanning patterns for styles
* Improved: Extension schema registry persists in one batched admin write instead of per-extension option updates on every load
* Improved: StyleGenerator defers CSS cache writes to `shutdown` and keys cache by request path
* Improved: MCP `get-posts` / `manage-post` always return a usable `edit_url` (admin fallback) and safer empty permalink handling

= 1.2.0 =

* Added: Carousel + Carousel Slide blocks for hero, testimonial, and logo-strip layouts
* Added: Before/After Slider block for interactive image comparison
* Added: Theme & query blocks — Site Title, Site Tagline, Site Logo, Post Title, Post Excerpt, Post Content, Post Featured Image, Post Info, Query Title, Query Total, Archive Description
* Added: Visibility extension to hide blocks per device
* Added: Interactions system (entrance presets, emit/listen, custom JS) with block, page, and global scopes
* Added: Image lightbox option
* Added: Nav menu submenu support and improved navigation building
* Added: MCP abilities for Get Revisions and Restore Revision
* Added: Add-ons marketing hub and Freemius license checks for companion products
* Improved: MCP Accept workflow — safer editor sync, pattern + form pending resolve, preview save lock until Accept/Discard
* Improved: Empty-page assembly via pattern-ref `post_content`; non-empty pages stage for Accept
* Improved: Container flex defaults — top-level Center, nested unset; cleaner variations
* Improved: Manage Theme JSON, Manage Post, designer workflow, and block docs for AI agents
* Improved: Tab styling and overall editor polish

= 1.1.3 =

* Added: 4 new MCP AI abilities (`GetAutomationGuideline`, `JsonHelper`, `ManagePattern`, `TriggerRefresh`)
* Added: Magic Login feature and corresponding AI ability for quick access
* Added: EditorSync functionality for improved block editor synchronization
* Improved: Renamed `UploadMedia` ability to `ManageMedia` for broader functionality
* Improved: AI developer documentation and schema definitions for all blocks
* Improved: Backward compatibility and styling fixes for Social Icons, Button, Container, and Google Map blocks

= 1.1.2 =

* Improved: Refined AI developer documentation with precise JSON option arrays for robust MCP styling

= 1.1.1 =

* Added: Paragraph block optimized for AI site building
* Improved: Unified block icon styling across all blocks for consistent editor branding
* Added: Template Library feature with 1-click page and pattern import in Block Editor
* Improved: Template Library UI and infinite scroll performance
* Fixed: Cross-Origin Resource Sharing (CORS) preflight errors with token-based query authentication
* Improved: Enqueue logic using wp_localize_script for safer JS configuration
* Added: Automated MCP Connection Wizard with 1-click command generation
* Added: `ManageOptions` MCP AI ability to read and update WordPress core settings.
* Added: `ManageComments` MCP AI ability for autonomous comment moderation.
* Improved: `ManageThemeJson` MCP AI ability now properly merges custom typography.

= 1.1.0 =

* Added: Global SEO Meta Description setting in the dashboard
* Added: Batch upload support in UploadMedia MCP ability
* Added: Taxonomy query filtering support in GetPosts MCP ability
* Added: Active plugin detection in GetSiteInfo MCP ability
* Improved: Escaped block render outputs to meet strict security standards

= 1.0.9 =

* Added: 3 new MCP AI abilities
* Added: Inline AI preview block for MCP schema approval
* Improved: MCP AI documentation and approval workflow

= 1.0.8 =

* Added: New MCP AI abilities
* Improved: Existing MCP AI abilities to reduce token cost

= 1.0.7 =

* Fixed: Icon block folder casing for compatibility with case-sensitive file systems

= 1.0.6 =

* Added: WordPress Playground Blueprint support for live interactive previews

= 1.0.5 =

* Added: MCP AI extension
* Improved: Overall UI/UX improvements
* Fixed: Class Manager subselector UI detachment issues

= 1.0.4 =

* Improved: Overall UI/UX improvements

= 1.0.3 =

* Added: Accordion, Button, Counter, Google Map, Heading, Icon, Image, Icon List, Progress Bar, Rating, Social Icons, Tab, and Video blocks.
* Improved: System architecture and performance enhancements

= 1.0.0 =

* Initial release
