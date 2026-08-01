<?php

namespace Blockish\Mcp\Abilities\ManagePattern;

use Blockish\Mcp\Abilities\ManagePattern\Callbacks;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-pattern';

    public static function get(): array
    {
        return [
            'label'               => __('Create or Update a Component Pattern', 'blockish'),
            'description'         => __('Use this tool to create or update reusable component patterns (Hero, Footer, etc.). Stages block_schema onto the wp_block as a blockish/ai-preview (previousSchema + pendingSchema). CRITICAL: After staging a pattern, if the user is currently editing a parent page/template, you MUST also use manage-post or manage-template to re-stage that parent with its current schema so they can Accept on the active page.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => [
                        'type'        => 'integer',
                        'description' => 'Optional. Provide to update an existing pattern.',
                    ],
                    'post_title'   => [
                        'type'        => 'string',
                        'description' => 'Required when creating. A descriptive title for the pattern (e.g. "Hero Section").',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'The JSON block schema array for this component.',
                    ],
                    'schema_file' => [
                        'type'        => 'string',
                        'description' => 'Absolute path on the WordPress SERVER only to a JSON file containing block_schema. Never a Cursor/client path when MCP points at a remote site.',
                    ],
                    'schema_url' => [
                        'type'        => 'string',
                        'description' => 'PREFERRED for large or client-local schemas on remote MCP. Write the block_schema JSON, upload that file to a third-party temporary hosting service (e.g. tmpfiles.org), take the DIRECT download URL that returns raw JSON (not an HTML page), then pass that HTTPS URL here. Do not inline huge block_schema when it risks truncation. Do not use base64. Max download 2 MB. Do not pass schema_file at the same time.',
                    ],
                    'delete'       => [
                        'type'        => 'boolean',
                        'description' => 'Optional. Set to true (along with post_id) to delete the pattern.',
                    ],
                ],
                'required' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'pattern_id'    => [ 'type' => 'integer' ],
                    'post_status'   => [ 'type' => 'string' ],
                    'schema_staged' => [ 'type' => 'boolean' ],
                    'error'         => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_pattern'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'CRITICAL RULE: Always use this tool to build individual sections (Patterns) when designing a full page. Do NOT send one massive nested schema to manage-post. Send small patterns here, then assemble the final page in manage-post using core/block references with align:"full" for full-bleed sections (omit align only when content-width is intentional).',
            ],
        ];
    }
}
