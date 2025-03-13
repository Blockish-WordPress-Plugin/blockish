<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

class Fonts
{
    use \Blockish\Traits\SingletonTrait;

    private function __construct()
    {
        add_action('init', [$this, 'register_fonts_post_type']);
    }

    public function register_fonts_post_type()
    {
        register_post_type('blockish-fonts', [
            'public' => false,
            'show_ui' => true,
            'show_in_menu' => true,
            'show_in_rest' => true,
            'supports' => ['title', 'custom-fields'],
            'labels' => [
                'name' => __('Fonts', 'blockish'),
                'singular_name' => __('Font', 'blockish'),
                'add_new' => __('Add New Font', 'blockish'),
                'add_new_item' => __('Add New Font', 'blockish'),
                'edit_item' => __('Edit Font', 'blockish'),
                'new_item' => __('New Font', 'blockish'),
                'view_item' => __('View Font', 'blockish'),
                'search_items' => __('Search Fonts', 'blockish'),
                'not_found' => __('No fonts found', 'blockish'),
                'not_found_in_trash' => __('No fonts found in Trash', 'blockish'),
            ],
            'menu_icon' => 'dashicons-editor-textcolor'
        ]);

        register_post_meta('blockish-fonts', 'font_faces', [
            'single'       => true,
            'type'         => 'array',
            'show_in_rest' => [
                'schema' => [
                    'type' => 'array',
                    'items' => [
                        'type' => 'object',
                        'properties' => array(
                            'src'    => array(
                                'type' => 'string',
                            ),
                            'fontWeight' => array(
                                'type'   => 'string',
                            ),
                            'fontStyle' => array(
                                'type'   => 'string',
                            ),
                            'fontFamily' => array(
                                'type'   => 'string',
                            ),
                            'preview' => array(
                                'type'   => 'string',
                            ),
                        ),
                    ]
                ]
            ]
        ]);

        register_post_meta('blockish-fonts', 'preview', [
            'single'       => true,
            'type'         => 'string',
            'show_in_rest' => true
        ]);

        register_post_meta('blockish-fonts', 'total_variants', [
            'single'       => true,
            'type'         => 'number',
            'show_in_rest' => true
        ]);
    }
}
