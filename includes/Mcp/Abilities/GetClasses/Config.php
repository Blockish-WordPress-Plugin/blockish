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
            'description'         => __('Returns all classes registered in the Blockish Class Manager, keyed by name, each with its post_id, css_selector, parent_id, editable content and compiled css. Call this before creating or updating classes to avoid duplicates.', 'blockish'),
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
                        'css_selector' => ['type' => 'string', 'description' => 'The selector this class targets.'],
                        'parent_id'    => ['type' => ['integer', 'null'], 'description' => 'Set if this is a child/subselector class; null for top-level classes.'],
                        'content'      => ['type' => 'object', 'description' => 'The editable style object (post content). Use this when updating.'],
                        'css'          => ['type' => 'string', 'description' => 'Read-only compiled CSS generated from content.'],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_classes'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Call this before creating or updating classes to avoid duplicates. When updating a class, edit its content object; css is read-only compiled output and cannot be set directly.',
            ],
        ];
    }
}
