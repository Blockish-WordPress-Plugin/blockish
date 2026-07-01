<?php

namespace Blockish\Mcp\Abilities\GetTaxonomies;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-taxonomies';

    public static function get(): array
    {
        return [
            'label'               => __('Get Taxonomies', 'blockish'),
            'description'         => __('Returns all registered WordPress taxonomies with their label, public visibility, and hierarchy.', 'blockish'),
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
                        'post_types'   => [
                            'type'  => 'array',
                            'items' => ['type' => 'string'],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_taxonomies'],
            'permission_callback' => fn() => current_user_can('manage_categories'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
