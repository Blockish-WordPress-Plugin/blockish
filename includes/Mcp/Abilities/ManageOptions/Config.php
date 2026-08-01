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
            'description'         => __('Retrieve or update allowlisted WordPress core settings and Blockish options. Cannot change siteurl or home (those break the site).', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type'        => 'string',
                        'description' => 'The action to perform: "get" or "update".',
                        'enum'        => ['get', 'update'],
                    ],
                    'keys' => [
                        'type'        => 'array',
                        'items'       => ['type' => 'string'],
                        'description' => 'For "get" action: An array of option keys to retrieve. Leave empty to retrieve a default set of common options.',
                    ],
                    'values' => [
                        'type'        => 'object',
                        'description' => 'For "update" action: A key-value map of options to update.',
                        'additionalProperties' => true,
                    ],
                ],
                'required'   => ['action'],
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
                'usage_notes' => 'Do not update siteurl or home — they are blocked. Prefer blogname, blogdescription, reading settings, and blockish_* keys.',
            ],
        ];
    }
}
