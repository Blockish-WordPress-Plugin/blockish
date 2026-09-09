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
                        'description' => 'Optional. URL after login — usually the post/page `edit_url` so the editor opens and pending layouts resolve.', 
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
                'usage_notes' => 'Ask permission once per chat session (interactive question tool), then reuse for further magic URLs in that session without re-prompting. New chat = ask again. Prefer agent browser over Puppeteer. Follow get-automation-guideline verify loop: editor → 10–15s → frontend screenshot; retry editor once if unresolved; then fix design issues from the screenshot. waitUntil domcontentloaded (not networkidle). URL is valid 15 minutes and single-use.'
            ],
        ];
    }
}
