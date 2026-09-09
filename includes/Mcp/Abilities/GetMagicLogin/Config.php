<?php

namespace Blockish\Mcp\Abilities\GetMagicLogin;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-magic-login-url';

    public static function get(): array
    {
        return [
            'label'               => __('Get Magic Login URL', 'blockish'),
            'description'         => 'Generates a temporary, single-use login URL for an AI browser (or Puppeteer) to open the WordPress admin/editor without a password. Ask the user for permission ONCE per chat session via an interactive question tool before the first call in that session; do not re-ask for later calls in the same session. Do not call with zero consent in a new chat.',
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'redirect_to' => [ 
                        'type' => 'string', 
                        'description' => 'Optional. URL after login — typically manage-post resolve_url (editor + blockish_ai_resolve args) so the queue resolves then redirects to the frontend.', 
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'url' => [ 'type' => 'string', 'description' => 'The magic login URL. Open with agent browser if available, else Puppeteer.' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_magic_login'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Ask permission once per chat session (interactive question tool), then reuse for further magic URLs in that session without re-prompting. New chat = ask again. Prefer agent browser over Puppeteer. URL is valid 15 minutes and single-use.'
            ],
        ];
    }
}
