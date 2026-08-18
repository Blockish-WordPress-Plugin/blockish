<?php

namespace Blockish\Mcp\Abilities\ManagePluginsThemes;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-plugins-themes';

    public static function get(): array
    {
        return [
            'label'               => __('Manage Plugins & Themes', 'blockish'),
            'description'         => __('Install, activate, deactivate, switch, or update WordPress.org plugins and themes. Never use WP-CLI, zip URLs, GitHub, or the filesystem. Never uninstall or delete. Ask the user in chat first, then pass confirm:true. Slug must be the exact wordpress.org directory slug. Promoted: ACF `advanced-custom-fields` (install+activate), WooCommerce `woocommerce` (install+activate), Blockish Forms `blockish-forms` (Pro — activate only if already installed), Blockish Dynamicity `blockish-dynamicity` (Pro — activate only). After install or activate of those four, you MUST tell the user to fully restart the AI software they are using (Cursor, Claude Desktop, ChatGPT, etc.) or reconnect Blockish MCP — new abilities will not appear in this session. Cannot deactivate Blockish core (`blockish`). Cannot deactivate themes (switch instead). Update only when the user explicitly asked to update.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action'  => [
                        'type'        => 'string',
                        'enum'        => ['list', 'install', 'activate', 'deactivate', 'switch', 'update'],
                        'description' => 'list = installed plugins/themes (no confirm). install = download from wordpress.org then activate plugin or switch theme. activate = plugin only. deactivate = plugin only (not blockish). switch = theme only. update = only if the user explicitly asked to update. There is no delete/uninstall action.',
                    ],
                    'type'    => [
                        'type'        => 'string',
                        'enum'        => ['plugin', 'theme'],
                        'description' => 'Required except for list (omit list type to return both).',
                    ],
                    'slug'    => [
                        'type'        => 'string',
                        'description' => 'Exact wordpress.org directory slug (lowercase letters, numbers, hyphens). Examples: advanced-custom-fields, woocommerce, twentytwentyfive. Do not pass a URL, zip, or plugin file path.',
                    ],
                    'confirm' => [
                        'type'        => 'boolean',
                        'description' => 'Must be true for install, activate, deactivate, switch, and update. Omit for list. Only set true after the user explicitly agrees in chat.',
                    ],
                ],
                'required'   => ['action'],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'status'           => ['type' => 'string'],
                    'type'             => ['type' => 'string'],
                    'slug'             => ['type' => 'string'],
                    'plugin_file'      => ['type' => 'string'],
                    'stylesheet'       => ['type' => 'string'],
                    'name'             => ['type' => 'string'],
                    'version'          => ['type' => 'string'],
                    'active'           => ['type' => 'boolean'],
                    'restart_required' => ['type' => 'boolean'],
                    'restart_message'  => ['type' => 'string'],
                    'message'          => ['type' => 'string'],
                    'next_steps'       => [
                        'type'  => 'array',
                        'items' => ['type' => 'string'],
                    ],
                    'plugins'          => ['type' => 'array'],
                    'themes'           => ['type' => 'array'],
                    'promoted'         => ['type' => 'array'],
                    'error'            => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'handle'],
            'permission_callback' => fn() => current_user_can('activate_plugins') || current_user_can('switch_themes'),
            'meta'                => [
                'mcp'         => ['public' => true],
                'usage_notes' => 'Never WP-CLI / zip / files. Exact .org slug. confirm:true after chat permission. Promoted: advanced-custom-fields, woocommerce (install+activate); blockish-forms, blockish-dynamicity (Pro, activate only). After those four, tell the user to fully restart their AI app. No delete. No deactivate of blockish. No theme deactivate — switch. Update only on explicit user request.',
            ],
        ];
    }
}
