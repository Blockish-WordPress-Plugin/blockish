<?php

namespace Blockish\Mcp\Abilities\ExtensionsInfo;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-extensions-info';

    public static function get(): array
    {
        return [
            'label'               => __('Get Extensions Info', 'blockish'),
            'description'         => __('Returns total, active and inactive Blockish extension counts.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'                 => 'object',
                'additionalProperties' => [
                    'type'       => 'object',
                    'properties' => [
                        'name'        => ['type' => 'string'],
                        'description' => ['type' => 'string'],
                        'package'     => ['type' => 'string'],
                        'category'    => ['type' => 'string'],
                        'status'      => ['type' => 'string'],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_extensions_info'],
            'permission_callback' => fn() => current_user_can('manage_options'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
