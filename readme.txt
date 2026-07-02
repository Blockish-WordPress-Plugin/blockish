=== Blockish – AI Site Builder & Creative Gutenberg Blocks ===
Author: wowdevs
Author URI: https://wowdevs.com/
Plugin URI: https://blockish.wowdevs.com/
Contributors: bdkoder, mizan42047
Donate link: https://wowdevs.com/
Tags: blocks, gutenberg, block editor, page builder, ai
Tested up to: 7.0
Stable tag: 1.1.0
Requires at least: 6.1
Requires PHP: 7.4
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Build beautiful websites with 15+ creative Gutenberg blocks and powerful extensions like Class Manager and MCP AI — no page builder required.

== Description ==

**Blockish** is a powerful, feature-rich Gutenberg plugin that combines 15+ creative layout blocks with an advanced **MCP AI Integration**. Design completely custom pages by hand using our lightweight blocks and Class Manager, or simply prompt the AI to instantly generate and insert fully-styled, complex layouts directly into your WordPress canvas!

== Blocks Included (15+ Blocks) ==

= Layout =
* **Container** — Flexible section wrapper with background, spacing, flexbox, and layout controls.

= Typography =
* **Heading** — Highly customizable headings with advanced typography, colors, and shadow options.

= Media =
* **Image** — Enhanced image block with overlay, border, mask, and alignment controls.
* **Video** — Embed and style videos with custom play buttons and wrapper controls.
* **Icon** — Add scalable SVG icons with custom color, size, and hover effects.

= Interactive =
* **Accordion** — Collapsible content sections for FAQs, features, and more.
* **Tab** — Tabbed content panels for organizing large amounts of information.
* **Navigation** — Advanced, flexible navigation block for building complex headers.

= Data & Stats =
* **Counter** — Animated number counter for statistics, milestones, and metrics.
* **Progress Bar** — Stylish progress bars with customizable labels, colors, and animations.
* **Rating** — Star rating display for reviews, testimonials, and product features.

= Lists & Icons =
* **Icon List** — Beautiful icon-based lists to replace standard bullet points with SVG icons.

= Social & CTA =
* **Social Icons** — Social media icon links with customizable shapes, colors, and sizes.
* **Button** — Fully styled call-to-action buttons with hover effects and icons.

= Maps =
* **Google Map** — Embed Google Maps with custom zoom, height, and location settings.

== Extensions ==

= Class Manager =

Blockish adds a **Class Manager** panel to every block in the editor — including core WordPress blocks. Define styles once for a CSS class, then reuse that class across any block on any page. It's the easiest way to keep your design consistent without writing CSS files or editing your theme. Sub-selector support lets you target child elements within a class too.

= MCP AI Extension =

Blockish integrates an advanced **MCP (Model Context Protocol) AI Extension**. Instead of just generating simple text, the Blockish AI acts as a professional web designer right inside your editor:
* **Inline Canvas Previews:** AI-generated layouts appear directly inside your editor canvas in a stylish neon preview wrapper. Review the design visually and click "Accept" to instantly apply it!
* **Native Gutenberg Blocks:** The AI understands and builds real Blockish and WordPress core blocks, complete with complex styling, padding, flexbox, and nested structures.
* **Smart Styling:** The AI reads your active theme's colors and spacing, and integrates perfectly with the Blockish Class Manager to reuse CSS classes intelligently.
* **Full Site Editing (FSE):** You can even ask the AI to modify or build complete FSE templates and template parts!

== Why Blockish? ==

- **15+ Creative Blocks** — Everything you need for professional page building.
- **Class Manager** — Define styles once, reuse them across any block on any page.
- **Advanced MCP AI** — Generate entire page sections and layouts via AI with beautiful inline visual previews.
- **Lightweight** — No jQuery, no unnecessary bloat, incredibly fast-loading.
- **Responsive** — Every block is fully responsive out of the box with device-specific controls.
- **Native Experience** — Blends seamlessly into the WordPress block editor UI.
- **Highly Customizable** — Rich styling controls for colors, spacing, typography, and more.
- **Free** — 100% free, no upsells or locked features.

== Installation ==

1. Upload the plugin files to the `/wp-content/plugins/blockish` directory, or install the plugin through the WordPress plugins screen directly.
2. Activate the plugin through the 'Plugins' screen in WordPress.
3. Start building! Open any page or post and add a Blockish block from the block inserter.

== Frequently Asked Questions ==

= What is the MCP AI Engine? =

Blockish includes a native MCP (Model Context Protocol) server. This means you can connect AI agents like Claude, Cursor, or other AI tools to instantly generate and style complex Gutenberg layouts in your editor using simple natural language commands.

= Do I need a separate page builder? =

No! Blockish extends the native WordPress Gutenberg editor with advanced layout blocks and styling controls, giving you the power of a page builder without the bloat or performance hit.

= What is the Class Manager? =

The built-in Class Manager lets you create, edit, and apply reusable CSS classes directly within the editor. This guarantees a consistent design system across your entire website and speeds up your workflow.

= Is this plugin free? =

Yes, the core Blockish plugin is 100% free to use on unlimited personal or client websites.

= Where can I get support or report a bug? =

You can get support by creating a topic on the WordPress support forum for Blockish, or by reaching out to us through our website at wowdevs.com.

== External Services ==

This plugin connects to external services under the conditions described below. No data is ever sent without a clear user action or explicit opt-in.

= 1. Usage Analytics / Data Insights (dashboard.wowdevs.com) =

**What it does:** Sends non-sensitive plugin usage data to help improve the plugin. This is part of the optional Data Insights program powered by the DCI SDK.

**When it connects:** **Only if you explicitly opt in** when prompted. No data is ever sent without your consent. You can opt out at any time from the Blockish dashboard.

**Data sent:** Plugin version, WordPress version, active theme, site language, and similar non-personal environment data. No passwords, user content, or personally identifiable information is transmitted.

**Service:** wowDevs Data Insights, operated by wowDevs.
Service URL: https://dashboard.wowdevs.com/
Privacy Policy: https://wowdevs.com/privacy-policy/
Terms of Service: https://wowdevs.com/terms-and-conditions/

== Screenshots ==

1. Container Block Options
2. Advanced Heading Styling
3. Image and Video Blocks
4. Accordions and Tabs for Content
5. Navigation and Menus
6. Data Visualization (Counters, Progress Bars, Ratings)
7. Icon Lists and Social Icons
8. Interactive Buttons
9. Google Map Integration
10. Class Manager Extension Panel

== Changelog ==

= 1.1.0 [2nd July 2026] =

* Added: Global SEO Meta Description setting in the dashboard
* Added: Batch upload support in UploadMedia MCP ability
* Added: Taxonomy query filtering support in GetPosts MCP ability
* Added: Active plugin detection in GetSiteInfo MCP ability
* Improved: Escaped block render outputs to meet strict security standards
* Improved: Updated plugin description for better WP.org discovery

= 1.0.9 [1st July 2026] =

* Added: 3 new MCP AI abilities
* Added: Inline AI preview block for MCP schema approval
* Improved: MCP AI documentation and approval workflow


= 1.0.8 [28th June 2026] =

* Added: New MCP AI abilities
* Improved: Existing MCP AI abilities to reduce token cost

= 1.0.7 [27th June 2026] =

* Fixed: Icon block folder casing for compatibility with case-sensitive file systems


= 1.0.6 [27th June 2026] =

* Added: WordPress Playground Blueprint support for live interactive previews

= 1.0.5 [25th June 2026] =

* Added: MCP AI extension
* Improved: Overall UI/UX improvements
* Fixed: Class Manager subselector UI detachment issues

= 1.0.4 [8th June 2026] =

* Improved: Overall UI/UX improvements

= 1.0.3 [27th April 2026] =

* Added: Accordion block
* Added: Button block
* Added: Counter block
* Added: Google Map block
* Added: Heading block
* Added: Icon block
* Added: Image block
* Added: Icon List block
* Added: Progress Bar block
* Added: Rating block
* Added: Social Icons block
* Added: Tab block
* Added: Video block
* Improved: System architecture and performance enhancements

= 1.0.0 [19th Jan 2025] =

* Initial release
