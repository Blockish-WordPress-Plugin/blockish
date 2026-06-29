<?php

namespace Blockish\Mcp\Abilities\ManageThemeJson;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-theme-json';

    public static function get(): array
    {
        return [
            'label'               => __('Manage Global Styles', 'blockish'),
            'description'         => __('The theme.json structure to apply (e.g., settings, styles). Pass a complete JSON object. This will permanently update the site\'s wp_global_styles in the database.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'theme_json' => [
                        'type'        => 'object',
                        'description' => 'The theme.json structure to apply (e.g., settings, styles). Pass a complete JSON object.',
                        'additionalProperties' => true,
                    ],
                    'delete' => [
                        'type'        => 'boolean',
                        'description' => 'Set to true to clear all custom global styles and reset to default.',
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'action'        => ['type' => 'string', 'description' => '"updated" or "deleted"'],
                    'edit_url'      => ['type' => 'string', 'description' => 'URL to the Global Styles editor.'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'handle'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
