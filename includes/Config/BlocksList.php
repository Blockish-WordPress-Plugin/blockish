<?php
namespace Blockish\Config;

defined('ABSPATH') || exit;

class BlocksList extends ConfigList {

    // Use the Singleton trait
    use \Blockish\Traits\SingletonTrait;

    /**
     * Define the type of configuration this list is for.
     * This will be used for option keys and list identification.
     */
    protected $type = 'block';

    /**
     * BlocksList constructor.
     */
    public function __construct() {
        // Ensure parent constructor is called
        parent::__construct();
    }

    /**
     * Sets the list of blocks.
     * This method defines the specific block configuration items.
     */
    protected function set_list() {
        $this->list = array(
            'container' => array(
                'name'    => __('Container', 'blockish'),
                'description' => __('The primary layout and structure block. Use it to build hero sections, feature grids, card rows, full-width banners, or any section wrapper. Supports both flexbox and CSS grid layouts with full background, border, and shadow styling including hover states. Any HTML semantic tag can be used (div, section, article, etc.).', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon' => array(
                'name'    => __('Icon', 'blockish'),
                'description' => __('Displays a single SVG icon with color, size, rotation, and an optional link. Use for decorative accents, feature highlights, or standalone icon links.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'heading' => array(
                'name'    => __('Heading', 'blockish'),
                'description' => __('A heading block (H1–H6) with per-device text alignment, typography, color, hover color, and text shadow. Use for page titles, section headings, and card labels when custom styling beyond the core heading is needed.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'image' => array(
                'name'    => __('Image', 'blockish'),
                'description' => __('Displays an image with full visual control including custom dimensions, object-fit, opacity, CSS filters, border, shadow, and hover transition effects. Also supports captions. Use when more styling control than the core image block is needed.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'button' => array(
                'name'    => __('Button', 'blockish'),
                'description' => __('A call-to-action button with a label, URL, optional icon (before or after text), and full hover styling for color, background, border, and shadow. Use for CTAs, download links, or any interactive link that needs custom visual design.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'video' => array(
                'name'    => __('Video', 'blockish'),
                'description' => __('Embeds a video from YouTube, Vimeo, or a self-hosted file. Supports autoplay, loop, lazy load, start/end time, aspect ratio, privacy mode, and a custom poster image with overlay play button. Use for product demos, testimonials, or media-rich sections.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'google-map' => array(
                'name'    => __('Google Map', 'blockish'),
                'description' => __('Embeds a Google Map for a given location with configurable zoom and height. Use for contact pages, store locators, or any page that needs to display a physical location.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list' => array(
                'name'    => __('Icon List', 'blockish'),
                'description' => __('A list of icon and text pairs displayed in a column or row layout. Use for feature lists, checklists, service highlights, or any bulleted content that benefits from custom icons instead of plain bullets. Contains icon-list-item child blocks.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list-item' => array(
                'name'    => __('Icon List Item', 'blockish'),
                'description' => __('A single icon and text row inside an Icon List block. Each item has its own text, icon, and optional link. Must be placed inside an Icon List block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'icon-list',
            ),
            'rating' => array(
                'name'    => __('Rating', 'blockish'),
                'description' => __('Displays a visual star (or custom icon) rating with a configurable scale and decimal value. Use for product reviews, service ratings, or testimonial sections.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'counter' => array(
                'name'    => __('Counter', 'blockish'),
                'description' => __('An animated number that counts up to a target value on scroll. Supports a prefix, suffix, thousand separator, and a title label positioned above or below the number. Use for statistics sections — e.g. "500+ clients", "99% uptime", "$2M raised".', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'progress-bar' => array(
                'name'    => __('Progress Bar', 'blockish'),
                'description' => __('An animated horizontal bar that fills to a given percentage on scroll. Supports a title, an inner text label inside the fill, and custom colors. Use for skills sections, fundraising progress, or any percentage-based visual indicator.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icons' => array(
                'name'    => __('Social Icons', 'blockish'),
                'description' => __('A grid of social media icon links with shape options (circle, square, rounded), official brand colors or custom colors, hover animations, and flexible column layout. Use in headers, footers, author bios, or contact sections. Contains social-icon-item child blocks.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icon-item' => array(
                'name'    => __('Social Icon Item', 'blockish'),
                'description' => __('A single social network link inside a Social Icons block. Defines the network (facebook, instagram, linkedin, youtube, etc.), its icon, brand color, and URL. Must be placed inside a Social Icons block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'social-icons',
            ),
            'accordion' => array(
                'name'    => __('Accordion', 'blockish'),
                'description' => __('A collapsible accordion that can allow one or multiple items open at once. Supports FAQ structured data markup for SEO. Use for FAQs, product specs, or any expandable Q&A content. Contains accordion-item child blocks.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'accordion-item' => array(
                'name'    => __('Accordion Item', 'blockish'),
                'description' => __('A single collapsible panel inside an Accordion block. Has a title, a default-open option, and customizable expand/collapse icons. The content area accepts any inner blocks. Must be placed inside an Accordion block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'accordion',
            ),
            'tab' => array(
                'name'    => __('Tab', 'blockish'),
                'description' => __('A tabbed content container with horizontal or vertical tab navigation, configurable active tab, and optional icons on each tab. Use for product details, service categories, pricing tiers, or any multi-section content that benefits from tab navigation. Contains tab-item child blocks.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'tab-item' => array(
                'name'    => __('Tab Item', 'blockish'),
                'description' => __('A single tab panel inside a Tab block. Has a title, an optional icon, and a default-active option. The content area accepts any inner blocks. Must be placed inside a Tab block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'tab',
            ),
            'navigation' => array(
                'name'        => __('Navigation', 'blockish'),
                'description' => __('A top-level responsive navigation wrapper that automatically switches between a desktop navigation menu and a mobile-friendly slide-in offcanvas drawer based on a breakpoint. Acts as the primary container for site headers. Contains navmenu and offcanvas child blocks.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
            ),
            'navmenu' => array(
                'name'        => __('Nav Menu', 'blockish'),
                'description' => __('A desktop navigation menu block that acts as the primary layout for headers and footers. Supports horizontal and vertical layouts, custom item styling, typography, spacing, and hover states. Must be placed inside a Navigation block.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
                'parent'      => 'navigation',
            ),
            'navmenu-item' => array(
                'name'        => __('Nav Menu Item', 'blockish'),
                'description' => __('A single navigation item link inside a Nav Menu block. Defines the link URL, text, and active state styling. Can be nested to create dropdown submenus when supported. Must be placed inside a Nav Menu block.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
                'parent'      => 'navmenu',
            ),
            'offcanvas' => array(
                'name'        => __('Off Canvas', 'blockish'),
                'description' => __('A mobile slide-in drawer panel with a hamburger menu trigger. Can automatically mirror the sibling Nav Menu items or have custom content. Supports left/right side sliding, custom header, overlay styling, and close button configurations. Must be placed inside a Navigation block.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
                'parent'      => 'navigation',
            ),
        );

        $this->list = apply_filters( 'blockish/blocks/list', $this->list );
    }
}
