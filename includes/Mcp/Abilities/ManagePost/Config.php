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
            'description'         => __('Creates, edits, or deletes a post. To CREATE: omit post_id but provide post_title and post_type. To EDIT: provide post_id. To DELETE: provide post_id and set delete to true. ALWAYS create sections with blockish/manage-pattern first and use returned real pattern IDs (never hallucinate refs). For a fully empty page/post (no post_content and no pending_schema), assemble with post_content pattern-ref comments only. If the page already has content or pending schema, pass block_schema pattern refs for Accept. Never put core/template-part header/footer on pages. This empty→post_content rule is manage-post only — do not use it for templates. CRITICAL: call blockish/get-designer-workflow and blockish/get-block-docs before designing. Call blockish/trigger-refresh after staging block_schema. For blog prose use blockish/write-blog, not this tool.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer', 'description' => 'Required to edit or delete an existing post. Omit to create a new post.'],
                    'post_type'    => ['type' => 'string',  'description' => 'Post type slug (e.g., "post", "page"). Required only when creating a new post.'],
                    'post_title'   => ['type' => 'string',  'description' => 'The title of the post. Required only when creating a new post.'],
                    'post_content' => [
                        'type'        => 'string',
                        'description' => 'ONLY for fully empty pages/posts (no existing content and no pending_schema): synced pattern-ref markup using real IDs from manage-pattern, e.g. <!-- wp:block {"ref":123} /-->. Never full section HTML. Never use this for templates/template parts. If the target is not empty, use block_schema instead.',
                    ],
                    'post_status'  => ['type' => 'string',  'description' => 'draft, publish, private, etc. Defaults to "draft".'],
                    'post_excerpt' => ['type' => 'string'],
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. This ability does not upload files: call blockish/get-media to find an existing image first, otherwise call blockish/upload-media with an image URL to create one and get its attachment_id, then pass it here. Do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Use when the page/post is NOT empty (has post_content or pending_schema). Array of pattern-ref nodes only for full pages: {name:"core/block", attributes:{ref:<real_id>}}. Build sections with manage-pattern first — never invent refs. Do NOT include core/template-part header/footer on pages. Staged as pending for Accept — not written live. Pass an empty array to clear a previously staged schema. For empty targets prefer post_content pattern refs instead.',
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
                'usage_notes' => 'CRITICAL RULES (manage-post only): 1) Create patterns with manage-pattern FIRST; use returned real IDs only — never hallucinate refs. 2) Empty target (no post_content AND no pending_schema): assemble with post_content pattern-ref comments only (<!-- wp:block {"ref":ID} /-->), then share post_url. 3) Not empty (has content OR pending): pass block_schema pattern refs; staged for Accept — call trigger-refresh and share edit_url. Do NOT auto-accept unless the user asks (get-automation-guideline). 4) post_content markup must be pattern refs only — never full section HTML. 5) block_schema REPLACES any previously staged schema; it does not merge. 6) Monolithic / deeply nested full-page schemas are REJECTED — patterns + refs (get-designer-workflow). 7) NEVER put core/template-part header/footer on pages. 8) This empty→post_content path does NOT apply to manage-template. 9) Call get-block-docs first. 10) ALWAYS trigger-refresh after staging block_schema.',
            ],
        ];
    }
}
