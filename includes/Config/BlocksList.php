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
                'description' => __('Responsive container for building layouts and sections.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon' => array(
                'name'    => __('Icon', 'blockish'),
                'description' => __('Display a single icon with customizable style.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'heading' => array(
                'name'    => __('Heading', 'blockish'),
                'description' => __('Flexible heading block for titles and section labels.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'image' => array(
                'name'    => __('Image', 'blockish'),
                'description' => __('Display an image with optional caption and styling.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'button' => array(
                'name'    => __('Button', 'blockish'),
                'description' => __('Call-to-action button with style options.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'video' => array(
                'name'    => __('Video', 'blockish'),
                'description' => __('Embed a video with custom controls and settings.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'google-map' => array(
                'name'    => __('Google Map', 'blockish'),
                'description' => __('Embed a Google Map location on your page.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list' => array(
                'name'    => __('Icon List', 'blockish'),
                'description' => __('List of icons with supporting text.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list-item' => array(
                'name'    => __('Icon List Item', 'blockish'),
                'description' => __('Item for the Icon List block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'icon-list',
            ),
            'rating' => array(
                'name'    => __('Rating', 'blockish'),
                'description' => __('Star rating display for reviews and scores.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'counter' => array(
                'name'    => __('Counter', 'blockish'),
                'description' => __('Animated number counter for stats.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'progress-bar' => array(
                'name'    => __('Progress Bar', 'blockish'),
                'description' => __('Progress bar showing completion status.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icons' => array(
                'name'    => __('Social Icons', 'blockish'),
                'description' => __('Social icon list for profile links.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icon-item' => array(
                'name'    => __('Social Icon Item', 'blockish'),
                'description' => __('Item for the Social Icons block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'social-icons',
            ),
            'accordion' => array(
                'name'    => __('Accordion', 'blockish'),
                'description' => __('Accordion container for collapsible content.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'accordion-item' => array(
                'name'    => __('Accordion Item', 'blockish'),
                'description' => __('Item for the Accordion block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'accordion',
            ),
            'tab' => array(
                'name'    => __('Tab', 'blockish'),
                'description' => __('Tabbed content container for tab items.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'tab-item' => array(
                'name'    => __('Tab Item', 'blockish'),
                'description' => __('Item for the Tab block.', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'tab',
            ),
            'navmenu' => array(
                'name'        => __('Nav Menu', 'blockish'),
                'description' => __('Navigation menu block for headers and footers.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
            ),
            'navmenu-item' => array(
                'name'        => __('Nav Menu Item', 'blockish'),
                'description' => __('Item for the Nav Menu block.', 'blockish'),
                'package'     => 'free',
                'status'      => 'active',
                'parent'      => 'navmenu',
            ),
        );

        $this->list = apply_filters( 'blockish/blocks/list', $this->list );
    }
}
