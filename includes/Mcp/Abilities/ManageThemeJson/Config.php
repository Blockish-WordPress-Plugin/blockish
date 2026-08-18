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
            'description'         => __('Apply, list, or restore the site\'s user global styles (wp_global_styles). Pass theme_json to update. list_revisions / restore_revision_id only touch that styles post — not pages or templates. Updates are live (no Accept/Discard). Install fonts with blockish/manage-fonts before setting typography here.', 'blockish'),
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
                        'description' => 'Set to true to clear all custom global styles and reset to default. Deletes the styles post (and its revisions).',
                    ],
                    'list_revisions' => [
                        'type'        => 'boolean',
                        'description' => 'List revisions of the active theme\'s global styles post only. Does not change anything. No confirm needed.',
                    ],
                    'restore_revision_id' => [
                        'type'        => 'integer',
                        'description' => 'Revision ID from list_revisions. Restores only wp_global_styles JSON. Requires confirm:true and explicit user request.',
                    ],
                    'confirm' => [
                        'type'        => 'boolean',
                        'description' => 'Must be true to restore a global styles revision.',
                    ],
                    'limit' => [
                        'type'        => 'integer',
                        'description' => 'For list_revisions. Default 10, max 50.',
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'action'        => ['type' => 'string', 'description' => '"updated", "deleted", "listed", or "restored"'],
                    'post_id'       => ['type' => 'integer', 'description' => 'wp_global_styles post ID for the active theme.'],
                    'revision_id'   => ['type' => 'integer'],
                    'revisions'     => ['type' => 'array'],
                    'edit_url'      => ['type' => 'string', 'description' => 'URL to the Global Styles editor.'],
                    'error'         => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'handle'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => "User global styles only (wp_global_styles) — not page/template content.\nUndo: list_revisions:true → pick an id → restore_revision_id + confirm:true. Do not use blockish/restore-revision for this.\nTo activate or deactivate fonts, use blockish/manage-fonts.\n\nIMPORTANT NESTED SCHEMA RULES:\n1. Presets (like `settings.color.palette` or `settings.typography.fontFamilies`) MUST be arrays of objects containing at least a `slug`. e.g., `\"palette\": [{\"color\": \"#ff0000\", \"slug\": \"red\", \"name\": \"Red\"}]`\n2. Style values (like `styles.color.text` or `styles.typography.fontFamily`) MUST be primitive strings, NOT objects. e.g., `\"styles\": { \"color\": { \"text\": \"var:preset|color|red\" } }` is correct. `\"text\": { \"color\": \"red\" }` is INVALID.\n3. The backend strictly validates these nested structures and will throw explicit errors if you pass invalid shapes.",
            ],
        ];
    }
}
