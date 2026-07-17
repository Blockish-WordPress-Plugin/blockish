<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

use Blockish\Traits\SingletonTrait;

class MagicLogin
{
    use SingletonTrait;

    private function __construct()
    {
        add_action('init', [$this, 'handle_magic_login'], 1);
    }

    public function handle_magic_login()
    {
        if (!isset($_GET['blockish_magic_token']) || empty($_GET['blockish_magic_token'])) {
            return;
        }

        $token = sanitize_text_field($_GET['blockish_magic_token']);
        $transient_name = 'blockish_magic_token_' . $token;
        $user_id = get_transient($transient_name);

        if ($user_id) {
            // Delete the transient immediately to ensure it's single-use
            delete_transient($transient_name);

            // Set the current user and log them in
            wp_set_current_user($user_id);
            wp_set_auth_cookie($user_id, true);

            // Redirect to the requested URL or default to admin
            $redirect_to = isset($_GET['redirect_to']) ? esc_url_raw(urldecode($_GET['redirect_to'])) : admin_url();
            
            // Allow redirecting back to the local site safely
            wp_safe_redirect($redirect_to);
            exit;
        } else {
            wp_die(__('Invalid or expired magic login token.', 'blockish'), __('Login Failed', 'blockish'), ['response' => 403]);
        }
    }
}
