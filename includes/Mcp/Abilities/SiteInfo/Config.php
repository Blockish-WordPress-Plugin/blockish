<?php

namespace Blockish\Mcp\Abilities\SiteInfo;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-site-info';

    public static function get(): array
    {
        return [
            'label'               => __('Get Site Info', 'blockish'),
            'description'         => __('Returns WordPress site name, description, URL, version, active theme, and plugins.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'name'        => [ 'type' => 'string' ],
                    'description' => [ 'type' => 'string' ],
                    'url'         => [ 'type' => 'string' ],
                    'version'     => [ 'type' => 'string' ],
                    'theme_info'  => [
                        'type'        => 'object',
                        'description' => 'Active theme details, including is_block_theme.',
                    ],
                    'active_plugins' => [
                        'type' => 'array',
                        'description' => 'List of currently active plugins (e.g. WooCommerce, ACF, etc.) to give you context on what features might be available.',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'name' => [ 'type' => 'string' ],
                                'version' => [ 'type' => 'string' ],
                                'description' => [ 'type' => 'string' ]
                            ]
                        ]
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_site_info'],
            'permission_callback' => fn() => current_user_can('read'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
