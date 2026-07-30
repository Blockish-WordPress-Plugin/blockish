<?php

namespace Blockish\Mcp\Abilities\GetClasses;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-classes';

    public static function get(): array
    {
        return [
            'label'               => __('Get CSS Classes', 'blockish'),
            'description'         => __('Returns parent Class Manager classes (keyed by post_id) with name, css_selector, and combined raw css — including :hover / descendants rewritten as .name:hover etc. Child posts are internal; AI only sees this CSS surface. Call before creating to avoid duplicates.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'include_usage' => [
                        'type'        => 'boolean',
                        'description' => 'When true, include usage_count and used_in for each parent class.',
                        'default'     => false,
                    ],
                ],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'additionalProperties' => [
                    'type'       => 'object',
                    'properties' => [
                        'post_id'      => ['type' => 'integer'],
                        'name'         => ['type' => 'string'],
                        'css_selector' => ['type' => 'string', 'description' => 'Root selector (e.g. .hero-card).'],
                        'css'          => ['type' => 'string', 'description' => 'Combined raw CSS for this class (root + hover + descendants).'],
                        'usage_count'  => ['type' => 'integer', 'description' => 'Present when include_usage is true.'],
                        'used_in'      => [
                            'type'  => 'array',
                            'items' => [
                                'type'       => 'object',
                                'properties' => [
                                    'post_id'   => ['type' => 'integer'],
                                    'post_type' => ['type' => 'string'],
                                    'title'     => ['type' => 'string'],
                                    'status'    => ['type' => 'string'],
                                    'edit_url'  => ['type' => 'string'],
                                ],
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_classes'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Read and write css only. Internally Blockish stores parent + child Class Manager posts so the editor UI can edit them — that structure is never exposed here.',
            ],
        ];
    }
}
