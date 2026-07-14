<?php

namespace Blockish\Mcp\Abilities\BlockDocs;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-block-docs';

    public static function get(): array
    {
        return [
            'label'               => __('Get Block Docs', 'blockish'),
            'description'         => __('Returns the full Blockish block reference — all blocks, their attributes, formats (responsive object, typography, background, border, spacing, icon, image) and markup examples.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'block_names' => [
                        'type' => 'array',
                        'description' => 'Optional array of block names (e.g. ["blockish/container", "blockish/heading"]) to fetch documentation for specific blocks only. To save context, call blockish/get-blocks-info first to find the blocks you need, then pass their names here.',
                        'items' => [
                            'type' => 'string'
                        ]
                    ]
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'docs' => [ 'type' => 'string', 'description' => 'Markdown documentation for the requested Blockish blocks (or all blocks if no specific names were provided).' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_block_docs'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Do not call this without parameters unless you want the entire library. To save context, call blockish/get-blocks-info first to find the blocks you need, then pass their names here in the block_names array.',
            ],
        ];
    }
}
