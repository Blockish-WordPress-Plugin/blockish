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
            'description'         => __('Creates, edits, or deletes a post. To CREATE: omit post_id but provide post_title and post_type. To EDIT: provide post_id. To DELETE: provide post_id and set delete to true. ALWAYS create sections with blockish/manage-pattern first and use returned real pattern IDs (never hallucinate refs). Assemble pages/posts with block_schema pattern refs only — NEVER write pattern-ref markup or block HTML into post_content. Pending schemas (including nested patterns/forms) only resolve when the editor is open, so always stage block_schema, call trigger-refresh, and share edit_url (not post_url / preview). Never put core/template-part header/footer on pages. CRITICAL: call blockish/get-designer-workflow and blockish/get-block-docs before designing. For blog prose use blockish/write-blog, not this tool.', 'blockish'),
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
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. This ability does not upload files: call blockish/get-media to find an existing image first, otherwise call blockish/upload-media with an image URL to create one and get its attachment_id, then pass it here. Do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'REQUIRED for layouts — including empty pages. Array of pattern-ref nodes for full pages: {name:"core/block", attributes:{ref:<real_id>}}. Build sections with manage-pattern first — never invent refs. Do NOT include core/template-part header/footer on pages. Staged as pending for Accept — not written live. Pass an empty array to clear a previously staged schema. After staging share edit_url (not post_url).',
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
                'usage_notes' => 'CRITICAL RULES (manage-post): 1) Create patterns with manage-pattern FIRST; use returned real IDs only — never hallucinate refs. 2) ALWAYS assemble with block_schema pattern refs (empty or not) — staged for Accept. 3) NEVER write pattern-ref comments or block HTML into post_content — pending pattern/form schemas only resolve in the editor. 4) After staging: call trigger-refresh and share edit_url — never post_url / preview by default. 5) Do NOT auto-accept unless the user asks (get-automation-guideline). 6) block_schema REPLACES any previously staged schema; it does not merge. 7) Monolithic / deeply nested full-page schemas are REJECTED — patterns + refs (get-designer-workflow). 8) NEVER put core/template-part header/footer on pages. 9) Call get-block-docs first. 10) ALWAYS trigger-refresh after staging block_schema.',
            ],
        ];
    }
}
