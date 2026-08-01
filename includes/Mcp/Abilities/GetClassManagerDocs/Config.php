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
            'description'         => __('Returns the Class Manager reference — raw CSS create/update via manage-class (!important → customCss), attaching classes by name, usage tracking (get-class-usage), unused sweep, and template-library class dependencies.', 'blockish'),
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
                'usage_notes' => 'Call before creating or updating any class via blockish/manage-class. Write raw css only; attach with classManager names.',
            ],
        ];
    }
}
