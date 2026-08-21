<?php

namespace Blockish\Mcp\Abilities\TriggerRefresh;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function trigger_refresh( $input ): array
    {
        $post_id = isset($input['post_id']) ? sanitize_text_field($input['post_id']) : '';
        if (!$post_id) {
            return ['error' => 'post_id is required'];
        }

        // Monotonic-ish token so clients can soft-sync without hard reload.
        set_transient( 'blockish_ai_refresh_' . $post_id, (string) microtime( true ), 60 );

        return [ 'success' => true ];
    }
}
