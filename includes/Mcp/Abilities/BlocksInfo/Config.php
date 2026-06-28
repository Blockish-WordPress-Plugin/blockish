<?php

namespace Blockish\Mcp\Abilities\BlocksInfo;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-blocks-info';

    public static function get(): array
    {
        return [
            'label'               => __('Get Blocks Info', 'blockish'),
            'description'         => __('Returns all Blockish blocks keyed by name, each with its status and an optional "parent" key marking child/inner blocks.', 'blockish'),
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
                        'status'      => ['type' => 'string'],
                        'parent'      => ['type' => 'string', 'description' => 'Present only on child/inner blocks; names the parent block. Top-level blocks omit this key.'],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_blocks_info'],
            'permission_callback' => fn() => current_user_can('manage_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'When reporting how many blocks exist, count only top-level blocks (those without a "parent" key) unless the user specifically asks about child blocks.',
            ],
        ];
    }
}
