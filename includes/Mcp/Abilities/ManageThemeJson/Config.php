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
            'description'         => __('The theme.json structure to apply (e.g., settings, styles). Pass a complete JSON object. This will permanently update the site\'s wp_global_styles in the database. NOTE: If you are applying custom typography, you MUST first use the `blockish/manage-fonts` ability to install the font before setting it here.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'theme_json' => [
                        'type'        => 'object',
                        'description' => 'The theme.json structure to apply. MUST follow strict WP theme.json schema. Allowed top-level keys ONLY: `version`, `settings`, `styles`, `title`, `slug`. (e.g., passing `fontFamilies` or `color` at the root will throw a validation error. They must be inside `settings.typography` or `settings.color`).',
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
                'usage_notes' => "Use this to manage the global theme.json settings and styles. To activate or deactivate fonts, use the `blockish-manage-fonts` tool instead.\n\nIMPORTANT NESTED SCHEMA RULES:\n1. Presets (like `settings.color.palette` or `settings.typography.fontFamilies`) MUST be arrays of objects containing at least a `slug`. e.g., `\"palette\": [{\"color\": \"#ff0000\", \"slug\": \"red\", \"name\": \"Red\"}]`\n2. Style values (like `styles.color.text` or `styles.typography.fontFamily`) MUST be primitive strings, NOT objects. e.g., `\"styles\": { \"color\": { \"text\": \"var:preset|color|red\" } }` is correct. `\"text\": { \"color\": \"red\" }` is INVALID.\n3. The backend strictly validates these nested structures and will throw explicit errors if you pass invalid shapes.",
            ],
        ];
    }
}
