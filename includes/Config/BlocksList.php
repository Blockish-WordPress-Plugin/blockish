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
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon' => array(
                'name'    => __('Icon', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'heading' => array(
                'name'    => __('Heading', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'image' => array(
                'name'    => __('Image', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'button' => array(
                'name'    => __('Button', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'video' => array(
                'name'    => __('Video', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'google-map' => array(
                'name'    => __('Google Map', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list' => array(
                'name'    => __('Icon List', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon-list-item' => array(
                'name'    => __('Icon List Item', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'icon-list',
            ),
            'rating' => array(
                'name'    => __('Rating', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'counter' => array(
                'name'    => __('Counter', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'progress-bar' => array(
                'name'    => __('Progress Bar', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icons' => array(
                'name'    => __('Social Icons', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'social-icon-item' => array(
                'name'    => __('Social Icon Item', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'social-icons',
            ),
            'accordion' => array(
                'name'    => __('Accordion', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'accordion-item' => array(
                'name'    => __('Accordion Item', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'accordion',
            ),
            'tab' => array(
                'name'    => __('Tab', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'tab-item' => array(
                'name'    => __('Tab Item', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
                'parent'  => 'tab',
            ),
        );
    }
}
