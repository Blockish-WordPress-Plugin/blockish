<?php

namespace Blockish\Mcp\Abilities\TriggerRefresh;

defined('ABSPATH') || exit;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/trigger-refresh';

    public static function get(): array
    {
        return [
            'label'               => __('Trigger Editor Refresh', 'blockish'),
            'category'            => 'blockish',
            'description'         => 'Triggers an immediate frontend editor refresh for a specific post. Call this ability after you have finished modifying a block_schema so the user sees the changes instantly.',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id' => [ 'type' => ['integer', 'string'], 'description' => 'The ID of the post or template currently being edited. For normal posts/pages, this is the numeric database ID (e.g., 12). For Site Editor templates or template parts, you MUST use the full string ID including the theme slug (e.g., twentytwentyfive//footer or twentytwentyfive//index). Do not use the numeric database ID for templates.' ],
                ],
                'required'   => ['post_id'],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'success' => [ 'type' => 'boolean' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'trigger_refresh'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Call this once after you finish pushing a pending block_schema via manage-post or manage-template. The open editor soft-syncs from the server (no full page reload). Prefer one call at the end of a batch when the editor is open.'
            ],
        ];
    }
}
