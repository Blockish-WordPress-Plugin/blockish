<?php

namespace Blockish\Mcp\Abilities\ManagePost;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-post';

    public static function get(): array
    {
        return [
            'label'               => __('Create, Edit or Delete Post', 'blockish'),
            'description'         => __('Creates, edits, or deletes a post. To CREATE: omit post_id but provide post_title and post_type. To EDIT: provide post_id. To DELETE: provide post_id and set delete to true. Pass Blockish layouts as block_schema, never raw "<!-- wp:... -->" markup. When a schema is staged, share edit_url (not post_url) so the user can approve. CRITICAL WARNING: Before calling this tool to design a layout, you MUST call blockish/get-designer-workflow and blockish/get-block-docs, otherwise your design will fail. Always call blockish/trigger-refresh after staging a layout. NOTE: If you are asked to "write a blog post", DO NOT use this tool. Use blockish/write-blog instead. This tool is strictly for publishing layout schemas or deleting/editing posts.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer', 'description' => 'Required to edit or delete an existing post. Omit to create a new post.'],
                    'post_type'    => ['type' => 'string',  'description' => 'Post type slug (e.g., "post", "page"). Required only when creating a new post.'],
                    'post_title'   => ['type' => 'string',  'description' => 'The title of the post. Required only when creating a new post.'],
                    'post_content' => ['type' => 'string'],
                    'post_status'  => ['type' => 'string',  'description' => 'draft, publish, private, etc. Defaults to "draft".'],
                    'post_excerpt' => ['type' => 'string'],
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. This ability does not upload files: call blockish/get-media to find an existing image first, otherwise call blockish/upload-media with an image URL to create one and get its attachment_id, then pass it here. Do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Array of Blockish block schema nodes ({name, attributes, innerBlocks}) to stage on this post. For full pages, pass a LIGHTWEIGHT assembly of core/block pattern refs — monolithic nested pages are rejected. Build sections with blockish/manage-pattern first. Build from blockish/get-block-docs. Stored as pending data for a human to Accept — never written directly into post_content. Pass an empty array to clear a previously staged schema.',
                        'items'       => [
                            'type'       => 'object',
                            'properties' => [
                                'name'        => [ 'type' => 'string' ],
                                'attributes'  => [ 'type' => 'object' ],
                                'innerBlocks' => [ 'type' => 'array' ],
                            ],
                            'required'   => [ 'name' ],
                        ],
                    ],
                    'schema_file' => [
                        'type'        => 'string',
                        'description' => 'Absolute file path to a JSON file containing the block_schema. Prefer this for large section schemas to avoid chat/MCP truncation. Still subject to monolithic-schema rejection on pages/templates — use patterns + refs for full pages.',
                    ],
                    'meta_input' => [
                        'type'        => 'object',
                        'description' => 'Key-value pairs of post meta to set.',
                    ],
                    'tax_input' => [
                        'type'        => 'object',
                        'description' => 'Key-value pairs of taxonomy names to arrays of term names (or IDs) to set.',
                    ],
                    'delete' => [
                        'type'        => 'boolean',
                        'description' => 'If true, deletes the post specified by post_id. Defaults to false.',
                    ],
                ],
                'anyOf' => [
                    [ 'required' => ['post_id'] ],
                    [ 'required' => ['post_title', 'post_type'] ]
                ]
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer'],
                    'post_status'  => ['type' => 'string'],
                    'post_url'     => ['type' => 'string'],
                    'edit_url'     => ['type' => 'string'],
                    'schema_staged' => ['type' => 'boolean', 'description' => 'True if block_schema was provided and saved as pending data on this post.'],
                    'featured_media_set' => ['type' => 'boolean', 'description' => 'True if featured_media was provided and successfully set as the post thumbnail.'],
                    'warnings'     => ['type' => 'array', 'description' => 'Non-blocking agent warnings (e.g. button double-border). Fix these when present.', 'items' => ['type' => 'string']],
                    'error'        => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_post'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'CRITICAL RULES: 1) block_schema is staged as pending data — never written live. After staging, call blockish/trigger-refresh and share edit_url so the human can Accept in the canvas. Do NOT auto-accept unless the user explicitly asks (then use blockish/get-automation-guideline). Accept exists so a bad AI schema cannot destroy a live site. 2) Submitting a block_schema REPLACES any previously staged schema; it does not merge. 3) There is no single-attribute patch for an already-applied block. To patch something, read the post content, rebuild the full block schema, stage it, and tell the human to Accept. 4) Monolithic / deeply nested full-page schemas are REJECTED — build sections with blockish/manage-pattern, assemble with core/block refs (see get-designer-workflow steps 7–8). Use schema_file for large section JSON. 5) Call blockish/get-block-docs first. 6) ALWAYS call blockish/trigger-refresh immediately after staging.',
            ],
        ];
    }
}
