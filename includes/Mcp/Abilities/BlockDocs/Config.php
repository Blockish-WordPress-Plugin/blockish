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
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'docs' => [ 'type' => 'string', 'description' => 'Markdown documentation for all Blockish blocks.' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_block_docs'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Call this before writing any block content (e.g. building a block_schema for blockish/manage-post) so you know the exact attribute structure for each block.',
            ],
        ];
    }
}
