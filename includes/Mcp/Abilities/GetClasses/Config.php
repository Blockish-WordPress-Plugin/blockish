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
            'description'         => __('Returns all CSS classes registered in the Blockish Class Manager. Each entry includes post_id, name, css_selector (the exact selector used in CSS), parent_id (set if this is a subselector/child class), and css (the stored CSS rules). Use this before creating or updating classes to avoid duplicates.', 'blockish'),
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
                        'post_id'      => ['type' => 'integer'],
                        'name'         => ['type' => 'string'],
                        'css_selector' => ['type' => 'string'],
                        'parent_id'    => ['type' => ['integer', 'null']],
                        'css'          => ['type' => 'string'],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_classes'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
