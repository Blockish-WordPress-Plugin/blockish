<?php

namespace Blockish\Mcp\Abilities\WriteBlog;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/write-blog';

    public static function get(): array
    {
        return [
            'label'               => __('Write Blog Post', 'blockish'),
            'description'         => __('Writes or edits a blog post (omit post_id to create, provide it to edit; defaults to post type "post") using WordPress CORE blocks only — never blockish custom blocks. Pass the layout as block_schema, not raw HTML comments. When a schema is staged, share edit_url (not post_url) so the user can review it in the canvas and accept it.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer', 'description' => 'Provide to edit an existing post. Omit to create a new one.'],
                    'post_type'    => ['type' => 'string',  'description' => 'Post type slug. Defaults to "post".'],
                    'post_title'   => ['type' => 'string'],
                    'post_content' => ['type' => 'string'],
                    'post_status'  => ['type' => 'string',  'description' => 'draft, publish, private, etc. Defaults to "draft".'],
                    'post_excerpt' => ['type' => 'string'],
                    'featured_media' => [
                        'type'        => 'integer',
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Array of block schema nodes ({name, attributes, innerBlocks}) using WordPress CORE blocks only (e.g. core/paragraph, core/heading, core/image, core/list, core/quote) — do not use blockish custom blocks and do not pass hand-written HTML comments. Stored as pending data for a human to review and apply in the editor; never written directly into post_content.',
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
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => ['type' => 'integer'],
                    'post_status'  => ['type' => 'string'],
                    'post_url'     => ['type' => 'string'],
                    'edit_url'     => ['type' => 'string'],
                    'schema_staged' => ['type' => 'boolean', 'description' => 'True if block_schema was provided and saved as pending data on this post.'],
                    'featured_media_set' => ['type' => 'boolean'],
                    'error'        => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'write_blog'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use WordPress core blocks only (core/paragraph, core/heading, core/image, core/list, core/quote, etc.) — do not use blockish custom blocks. block_schema is never written into post_content — it is staged as pending data. A human must open edit_url where the layout will appear inside a neon preview block in the canvas. They must click "Accept" on the block itself to approve. After staging, share edit_url so the user can approve; do not share post_url (preview) by default — if the user insists, warn them the page appears empty or unchanged until they approve the pending layout in the editor.',
            ],
        ];
    }
}
