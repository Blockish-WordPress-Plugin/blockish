<?php

namespace Blockish\Mcp\Abilities\GetClassManagerDocs;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-class-manager-docs';

    public static function get(): array
    {
        return [
            'label'               => __('Get Class Manager Docs', 'blockish'),
            'description'         => __('Returns the full Blockish Class Manager reference — how classes work, how to write CSS, block attribute formats (classManager, classManagerSubselector), parent vs child classes, responsive CSS, and ready-to-use CSS patterns. Call this before creating or updating any class so you write the correct CSS and apply it correctly to blocks.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'docs' => [ 'type' => 'string', 'description' => 'Markdown documentation for the Blockish Class Manager.' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_docs'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
