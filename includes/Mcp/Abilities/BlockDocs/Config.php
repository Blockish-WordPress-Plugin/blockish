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
            'description'         => __('Returns Blockish core docs plus attribute docs for the blocks you name. block_names is REQUIRED — never call without it (full library dump is disabled to save context). If omitted or empty, returns an error plus the blocks/extensions catalogs so you can choose names and retry.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'required'   => [ 'block_names' ],
                'properties' => [
                    'block_names' => [
                        'type'        => 'array',
                        'minItems'    => 1,
                        'description' => 'Required. Block names to document (e.g. ["blockish/container", "blockish/heading", "blockish/button"]). Pass only blocks you will use. If unsure which exist, call blockish/get-blocks-info first, or call this tool without names to receive the catalogs in the error response.',
                        'items'       => [
                            'type' => 'string',
                        ],
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'docs'       => [ 'type' => 'string', 'description' => 'Markdown: core reference + requested per-block docs + footer. Present only when block_names was provided.' ],
                    'error'      => [ 'type' => 'string', 'description' => 'Present when block_names is missing/empty. Explains how to retry.' ],
                    'warning'    => [ 'type' => 'string', 'description' => 'Present when some requested names had no docs file.' ],
                    'blocks'     => [ 'type' => 'object', 'description' => 'Block catalog (same as get-blocks-info). Returned with error/warning so you can pick valid names.' ],
                    'extensions' => [ 'type' => 'object', 'description' => 'Extension catalog (same as get-extensions-info). Returned with error/warning.' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_block_docs'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'ALWAYS pass block_names with only the blocks you need. Omitting it does NOT return the full library — you get an error plus blocks/extensions catalogs; choose names from those and call again. Prefer get-blocks-info first when exploring.',
            ],
        ];
    }
}
