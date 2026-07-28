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
            'description'         => __('Creates, edits, or deletes a post. To CREATE: omit post_id but provide post_title and post_type. To EDIT: provide post_id. To DELETE: provide post_id and set delete to true. For Blockish layouts, pass block_schema — this stages a blockish/ai-preview block into post_content (previousSchema + pendingSchema attrs). User Accept/Discard in the editor. Do NOT send pattern-ref markup or block HTML in post_content. Never put core/template-part header/footer on pages. CRITICAL: call blockish/get-designer-workflow and blockish/get-block-docs before designing. For blog prose use blockish/write-blog, not this tool.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer', 'description' => 'Required to edit or delete an existing post. Omit to create a new post.'],
                    'post_type'    => ['type' => 'string',  'description' => 'Post type slug (e.g., "post", "page"). Required only when creating a new post.'],
                    'post_title'   => ['type' => 'string',  'description' => 'The title of the post. Required only when creating a new post.'],
                    'post_content' => [
                        'type'        => 'string',
                        'description' => 'Do NOT use for Blockish layouts, pattern refs, or forms. Layouts must be staged via block_schema. Passing post_content for pages/posts/patterns/forms is rejected.',
                    ],
                    'post_status'  => ['type' => 'string',  'description' => 'draft, publish, private, etc. Defaults to "draft".'],
                    'post_excerpt' => ['type' => 'string'],
                    'post_parent'  => [
                        'type'        => 'integer',
                        'description' => 'Optional parent post ID. Defaults to 0 (top-level). Omit on edit to leave unchanged.',
                    ],
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. This ability does not upload files: call blockish/get-media to find an existing image first, otherwise call blockish/upload-media with an image URL to create one and get its attachment_id, then pass it here. Do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'REQUIRED for layouts — including empty pages. Array of block schema nodes ({name, attributes, innerBlocks}); pattern refs recommended for large pages: {name:"core/block", attributes:{ref:<real_id>, align:"full"}} for full-bleed sections (omit align only for content-width). Build sections with manage-pattern first — never invent refs. Do NOT include core/template-part header/footer on pages. Staged into post_content as a single blockish/ai-preview block (pendingSchema + previousSchema). Pass an empty array to clear. After staging share edit_url for Accept/Discard.',
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
                    'post_parent'  => ['type' => 'integer', 'description' => 'Parent post ID after save (0 = top-level).'],
                    'schema_staged' => ['type' => 'boolean', 'description' => 'True if non-empty block_schema was staged as an ai-preview block in post_content.'],
                    'featured_media_set' => ['type' => 'boolean', 'description' => 'True if featured_media was provided and successfully set as the post thumbnail.'],
                    'warnings'     => ['type' => 'array', 'description' => 'Non-blocking agent warnings (e.g. button double-border). Fix these when present.', 'items' => ['type' => 'string']],
                    'error'        => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_post'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'CRITICAL RULES (manage-post): 1) Send block_schema for layouts — staged as blockish/ai-preview in post_content (not meta). 2) Create patterns with manage-pattern FIRST; use returned real IDs only for core/block refs. 3) Full-bleed section refs MUST set attributes.align to "full" (omit align only for content-width). 4) NEVER send pattern-ref comments or block HTML into post_content. 5) Re-stage replaces pendingSchema only; previousSchema stays until Accept/Discard. 6) Monolithic full-page schemas are REJECTED — patterns + refs. 7) NEVER put core/template-part header/footer on pages. 8) Call get-block-docs with required block_names (only blocks you need). 9) After staging: trigger-refresh and share edit_url. 10) Optional post_parent nests under a parent.',
            ],
        ];
    }
}
