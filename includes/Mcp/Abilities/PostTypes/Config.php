<?php

namespace Blockish\Mcp\Abilities\PostTypes;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-post-types';

    public static function get(): array
    {
        return [
            'label'               => __('Get Post Types', 'blockish'),
            'description'         => __('Returns all registered WordPress post types with their label, public visibility, and hierarchy.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'additionalProperties' => [
                    'type'       => 'object',
                    'properties' => [
                        'label'        => ['type' => 'string'],
                        'public'       => ['type' => 'boolean'],
                        'hierarchical' => ['type' => 'boolean'],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_post_types'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
