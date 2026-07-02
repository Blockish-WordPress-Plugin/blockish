<?php

namespace Blockish\Mcp\Abilities\GetIcons;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-icons';

    public static function get(): array
    {
        return [
            'label'               => __('Get Icons', 'blockish'),
            'description'         => __('Searches the built-in Font Awesome icon library and returns the SVG paths so you can use them with the Icon type.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'search'   => [ 
                        'anyOf' => [
                            [ 'type' => 'string' ],
                            [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ]
                        ],
                        'description' => 'Search term (string) or terms (array of strings) to match against icon label or terms. Pass an array (e.g. ["arrow", "user"]) to batch-search multiple icons in a single call to save time.' 
                    ],
                    'category' => [ 
                        'type' => 'string',  
                        'description' => 'Category of icons to search in. Allowed values: "solid", "regular", "brands", or "all". Defaults to "all".' 
                    ],
                    'limit'    => [ 'type' => 'integer', 'description' => 'Max number of icons to return. Defaults to 20.' ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'items' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'label'    => [ 'type' => 'string' ],
                                'category' => [ 'type' => 'string' ],
                                'terms'    => [ 
                                    'type' => 'array', 
                                    'items' => [ 'type' => 'string' ] 
                                ],
                                'icon'     => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'viewBox' => [ 
                                            'type' => 'array', 
                                            'items' => [ 'type' => 'integer' ],
                                            'description' => 'The viewBox array (e.g. [0, 0, 512, 512])'
                                        ],
                                        'path'    => [ 
                                            'type' => 'string',
                                            'description' => 'The raw SVG path string'
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_icons'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => '1. Use this tool to batch-search (pass an array of strings) for icons you need. 2. If an icon is not found in the library, try to write the SVG path yourself (e.g. for simple UI shapes). 3. If you cannot generate the SVG, insert a simple placeholder SVG (e.g. a square or circle) and explicitly tell the user in your final response where placeholders were used so they can replace them.',
            ],
        ];
    }
}
