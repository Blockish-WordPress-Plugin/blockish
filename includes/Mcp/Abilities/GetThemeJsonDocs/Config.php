<?php

namespace Blockish\Mcp\Abilities\GetThemeJsonDocs;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-theme-json-docs';

    public static function get(): array
    {
        return [
            'label'               => __('Get Theme JSON Docs', 'blockish'),
            'description'         => __('Fetches the active theme\'s merged theme.json data (palette, typography, spacing, layouts). Use this before managing global styles to understand the active theme\'s variables and schema.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'theme_json' => [
                        'type' => 'object',
                        'additionalProperties' => true,
                    ]
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
