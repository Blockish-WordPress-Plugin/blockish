# Changelog

All notable changes to Blockish will be documented in this file.

## [1.3.0] - 2026-09-12

* Added: Nav Menu Mega Menu and Nav Menu Submenu blocks with responsive alignment, custom offsets, width controls (navigation, full, custom), and offcanvas accordion sync
* Added: Mega Menus management tab in Blockish Settings with live template previews, search, and direct edit shortcuts
* Added: Countdown block with multiple layouts (boxes, inline, stacked, circular ring, and flip-digit clock) and dynamic date binding support
* Added: HTML Wrapper and HTML Child dynamic blocks for custom HTML tag structures and key-value attributes
* Added: Core Interactions CSS motion player and visual builder UI supporting scroll, scrub, and toggle triggers
* Added: Real-time AI preview pending count badge in the admin toolbar and GetAiPreviewPending MCP ability
* Improved: AI Preview resolution pipeline with live Class Manager CSS rendering in Settings preview cards
* Improved: MCP developer documentation and schema definitions for navigation and interactions

## [1.2.9] - 2026-08-30

* Improved: PHPCS/WPCS configuration — focus on security and compatibility checks; skip formatting-only sniffs
* Fixed: PHP 7.4 compatibility in MCP Json Helper (removed union return type)
* Fixed: Prepared SQL, exception escaping, and empty-code hygiene across MCP callbacks and AI Preview
* Fixed: Magic Login redirect encoding (no double urlencode; `add_query_arg` handles encoding)
* Improved: Media upload cleanup uses `wp_delete_file()`; stricter base64 decode for MCP uploads

## [1.2.8] - 2026-08-30

* Added: Theme Builder extension (classic themes) — build headers, footers, and page templates with Blockish blocks; includes WooCommerce template and part starters
* Added: MCP support for Theme Builder — AI can list and stage classic-theme templates and template parts via `get-templates` and `manage-template`
* Added: Theme Override control on blocks — choose when Blockish styling should win over theme CSS
* Improved: MCP-created pages and posts default to published status (layout changes still stage for Accept/Discard in the editor)
* Improved: AI Preview Accept/Discard bar overlays the staged layout instead of leaving a blank row at the top
* Note: Theme Builder is for classic themes only — block themes continue to use the Site Editor

## [1.2.7] - 2026-08-21

* Added: Dashboard overview and MCP connect YouTube walkthroughs (separate videos)
* Improved: Helpful Links — docs, roadmap, and contact point to blockish.wowdevs.com
* Improved: Class Manager editor CSS loads from a revisioned bundle instead of every class entity (fewer editor REST requests)

## [1.2.6] - 2026-08-19

* Added: Inspector reset on Blockish controls (per-control, without colliding with device/responsive UI)
* Added: Class Manager control search — match panel titles and labels, sticky header, compact scrollable panel
* Added: Panel change dots on inspector and Class Manager when a section has non-default stored values
* Improved: Change dots ignore nested values when their controlling condition is off (hidden controls no longer look “dirty”)

## [1.2.5] - 2026-08-17

* Added: Container inner content width — constrain inner content independently of a full-bleed section
* Added: MCP `manage-plugins-themes` to install/activate plugins and themes
* Improved: MCP connect wizard client list matches `blockish-mcp-cli` (Claude Desktop/Code, Cursor, Codex, Cline, Windsurf, Antigravity, Trae, Qwen Code, Kimi Code)
* Improved: Manage Theme JSON — restore global-styles revisions
* Improved: Class Manager — Flex, Grid, and Position controls; unitless number fields
* Improved: `convert-css` maps grid layout for Container and Loop
* Improved: Template Library — All filter by default; Dynamicity/Forms designs need an active license (Get add-on CTA); library hidden in the form editor
* Improved: MCP `fetch-cloud-templates` omits unlicensed Dynamicity/Forms cloud designs

## [1.2.4] - 2026-08-15

* Improved: Settings AI Preview Accept/Discard writes via the WordPress REST route from JS (templates/parts use `theme//slug`, not numeric IDs)
* Improved: Accepting the currently open post from Settings unwraps `blockish/ai-preview` with `replaceBlocks`
* Improved: Settings queue layout — scrollable card grid, sticky pagination footer, taller previews, hover/selected checkboxes
* Improved: MCP designer workflow — discover blocks with `get-blocks-info` first; pick the right Blockish block for logos, nav, buttons, social icons, FAQs
* Improved: Social Icons is always flex (row/column + wrap); Visibility hide applies in the current editor device preview
* Improved: Docs for container header/footer landmarks, social-icons, and a versioned GitHub stuck-recovery path

## [1.2.3] - 2026-08-14

* Added: Settings → AI Preview queue — list pending staged layouts (pages, patterns, templates, template parts) with Gutenberg BlockPreview, search, type filters, and pagination
* Added: Accept / Discard from the Settings list, including multi-select and bulk actions
* Added: Accepting a page from Settings also unwraps nested staged patterns and forms
* Added: Class Manager previous-content snapshots so Accept keeps live CSS and Discard restores the pre-AI stylesheet (or removes a class created in that cycle)
* Improved: Queue matching uses the real `<!-- wp:blockish/ai-preview` block comment so body text cannot fake a pending item
* Improved: Settings Accept serializes with Gutenberg `createBlock` (no PHP fake markup / block recovery)
* Improved: Class Manager popups stay focused without stealing the editor canvas
* Improved: Video block poster handling

## [1.2.2] - 2026-08-12

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

## [1.2.1] - 2026-08-11

* Fixed: Freemius REST early boot — companion add-ons register CPT/REST routes correctly (no more missing-route editor save failures); Freemius SDK still skipped on normal front-end views for performance
* Added: PostPrime — early synced-pattern (`core/block` ref) cache priming before block theme template render
* Improved: Class Manager loads published classes once per request (bulk fetch + meta prime) and uses PostPrime for pattern walks
* Improved: Visibility extension uses PostPrime when scanning patterns for styles
* Improved: Extension schema registry persists in one batched admin write instead of per-extension option updates on every load
* Improved: StyleGenerator defers CSS cache writes to `shutdown` and keys cache by request path
* Improved: MCP `get-posts` / `manage-post` always return a usable `edit_url` (admin fallback) and safer empty permalink handling

## [1.2.0] - 2026-08-08

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

## [1.1.3] - 2026-08-01

* Added: 4 new MCP AI abilities (`GetAutomationGuideline`, `JsonHelper`, `ManagePattern`, `TriggerRefresh`)
* Added: Magic Login feature and corresponding AI ability for quick access
* Added: EditorSync functionality for improved block editor synchronization
* Improved: Renamed `UploadMedia` ability to `ManageMedia` for broader functionality
* Improved: AI developer documentation and schema definitions for all blocks
* Improved: Backward compatibility and styling fixes for Social Icons, Button, Container, and Google Map blocks

## [1.1.2] - 2026-07-28

* Improved: Refined AI developer documentation with precise JSON option arrays for robust MCP styling

## [1.1.1] - 2026-07-25

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

## [1.1.0] - 2026-07-24

* Added: Global SEO Meta Description setting in the dashboard
* Added: Batch upload support in UploadMedia MCP ability
* Added: Taxonomy query filtering support in GetPosts MCP ability
* Added: Active plugin detection in GetSiteInfo MCP ability
* Improved: Escaped block render outputs to meet strict security standards

## [1.0.9] - 2026-07-23

* Added: 3 new MCP AI abilities
* Added: Inline AI preview block for MCP schema approval
* Improved: MCP AI documentation and approval workflow

## [1.0.8] - 2026-07-22

* Added: New MCP AI abilities
* Improved: Existing MCP AI abilities to reduce token cost

## [1.0.7] - 2026-07-22

* Fixed: Icon block folder casing for compatibility with case-sensitive file systems

## [1.0.6] - 2026-07-21

* Added: WordPress Playground Blueprint support for live interactive previews

## [1.0.5] - 2026-07-21

* Added: MCP AI extension
* Improved: Overall UI/UX improvements
* Fixed: Class Manager subselector UI detachment issues

## [1.0.4] - 2026-07-20

* Improved: Overall UI/UX improvements

## [1.0.3] - 2026-07-19

* Added: Accordion, Button, Counter, Google Map, Heading, Icon, Image, Icon List, Progress Bar, Rating, Social Icons, Tab, and Video blocks.
* Improved: System architecture and performance enhancements

## [1.0.0] - 2026-07-18

* Initial release
