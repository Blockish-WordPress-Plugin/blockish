<?php

namespace Blockish\Mcp\Abilities\ManagePost;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-post';

    public static function get(): array
    {
        return [
            'label'               => __('Create or Edit Post', 'blockish'),
            'description'         => __('Creates a post (omit post_id) or edits one (provide post_id) of any registered post type; returns post_id, post_url, edit_url and post_status. Pass Blockish layouts as block_schema, never raw "<!-- wp:... -->" markup. When a schema is staged, share edit_url (not post_url) so the user can approve.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer', 'description' => 'Provide to edit an existing post. Omit to create a new one.'],
                    'post_type'    => ['type' => 'string',  'description' => 'Post type slug (e.g., "post", "page").'],
                    'post_title'   => ['type' => 'string',  'description' => 'The title of the post.'],
                    'post_content' => ['type' => 'string'],
                    'post_status'  => ['type' => 'string',  'description' => 'draft, publish, private, etc. Defaults to "draft".'],
                    'post_excerpt' => ['type' => 'string'],
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. This ability does not upload files: call blockish/get-media to find an existing image first, otherwise call blockish/upload-media with an image URL to create one and get its attachment_id, then pass it here. Do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Array of Blockish block schema nodes ({name, attributes, innerBlocks}) to stage on this post. Build it from blockish/get-block-docs (call it first to learn each block\'s attributes). Stored as pending data for a human to review and apply in the editor — never written directly into post_content. Pass an empty array to clear a previously staged schema without setting a new one.',
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
                ],
                'required'   => [ 'post_title', 'post_type' ],
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
                    'error'        => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_post'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'CRITICAL RULES: 1) block_schema is never written into post_content — it is staged as pending data that a human must review by opening edit_url and clicking "Apply AI Layout" in the editor header (visible only when a pending schema exists), so AI-generated layouts are always reviewed before going live. 2) Submitting a block_schema REPLACES any previously staged schema; it does not merge. 3) There is no single-attribute patch for an already-applied block. To patch something, read the post content, rebuild the full block schema, stage it, and tell the human to select the old block and use "Replace". 4) Deeply nested schemas (~4+ levels) can fail with misleading errors; flatten schemas where possible or split large pages into multiple calls. 5) Call blockish/get-block-docs first to learn block attributes. 6) After staging, share edit_url so the user can approve; do not share post_url (preview) by default — if the user insists, warn them the page appears empty or unchanged until they approve the pending layout in the editor.',
            ],
        ];
    }
}
