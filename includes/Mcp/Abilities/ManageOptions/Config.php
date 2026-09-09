<?php

namespace Blockish\Mcp\Abilities\ManageOptions;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-options';

    public static function get(): array
    {
        return [
            'label'               => __('Manage WordPress & Blockish Options', 'blockish'),
            'description'         => __('Retrieve or update allowlisted WordPress core settings and Blockish options. Cannot change siteurl or home (those break the site). Omit action (or pass "get") to read; pass action "update" with values to write.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type'        => 'string',
                        'description' => 'Optional. "get" (default when omitted) or "update". If you only pass keys, that is a get.',
                        'enum'        => ['get', 'update'],
                        'default'     => 'get',
                    ],
                    'keys' => [
                        'type'        => 'array',
                        'items'       => ['type' => 'string'],
                        'description' => 'For get: option keys to retrieve. Omit or empty → default common options.',
                    ],
                    'values' => [
                        'type'        => 'object',
                        'description' => 'For update: key-value map of options to write. Requires action "update".',
                        'additionalProperties' => true,
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'data' => [
                        'type' => 'object',
                        'description' => 'The resulting option values or success messages.',
                        'additionalProperties' => true,
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_options'],
            'permission_callback' => fn() => current_user_can('manage_options'),
            'meta'                => [
                'mcp'         => ['public' => true],
                'usage_notes' => 'Do not update siteurl or home — they are blocked. Prefer blogname, blogdescription, reading settings, and blockish_* keys. action defaults to "get" when omitted (keys alone = read). For update you must pass action:"update" plus values. When Blockish Forms is active, documented Forms options include blockish_forms_recaptcha ({site_key, secret_key, score_threshold}) and blockish_forms_email ({from_name, from_email, reply_to_mode, reply_to_email}) — full shapes are in get-block-docs under blockish-forms. Per-form toggles (e.g. recaptcha enable) are form meta via manage-post, not options. Do not echo secret_key to the user.',
            ],
        ];
    }
}
