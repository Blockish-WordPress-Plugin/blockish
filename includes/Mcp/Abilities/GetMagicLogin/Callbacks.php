<?php

namespace Blockish\Mcp\Abilities\GetMagicLogin;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_magic_login(array $input): array
    {
        if (!current_user_can('edit_posts')) {
            return ['error' => 'Permission denied.'];
        }

        $user_id = get_current_user_id();
        if (!$user_id) {
            return ['error' => 'User not found.'];
        }

        // Generate a cryptographically secure 32-character token
        $token = wp_generate_password(32, false);

        // Store the token mapped to the user ID for 15 minutes
        set_transient('blockish_magic_token_' . $token, $user_id, 15 * MINUTE_IN_SECONDS);

        // Build the magic login URL
        $redirect_to = $input['redirect_to'] ?? admin_url();
        $magic_url = add_query_arg([
            'blockish_magic_token' => $token,
            'redirect_to' => urlencode($redirect_to)
        ], site_url());

        return ['url' => $magic_url];
    }
}
