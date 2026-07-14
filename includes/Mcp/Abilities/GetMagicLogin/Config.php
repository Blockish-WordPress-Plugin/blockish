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
            'description'         => 'CRITICAL RULE: You MUST explicitly ask the user for permission via an interactive question tool (e.g. ask_question) before calling this tool. Do NOT just ask in chat. Generates a temporary, single-use login URL for the AI browser subagent to access the WordPress admin or editor without a password.',
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'redirect_to' => [ 
                        'type' => 'string', 
                        'description' => 'Optional. The URL to redirect to after successful login (e.g. /wp-admin/post.php?post=123&action=edit).' 
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'url' => [ 'type' => 'string', 'description' => 'The magic login URL. Provide this to the browser subagent.' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_magic_login'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'DO NOT CALL THIS TOOL AUTONOMOUSLY. ALWAYS ask the user for permission first via an interactive question tool (e.g. ask_question). The generated URL is valid for 15 minutes and can only be used once. After the browser subagent uses it, the token is destroyed.'
            ],
        ];
    }
}
