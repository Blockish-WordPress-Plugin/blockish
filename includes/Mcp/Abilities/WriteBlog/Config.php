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
            'description'         => __('Writes or edits a blog post using WordPress core blocks. Provide post_id to edit, omit it to create. Uses "post" as the default post type.

IMPORTANT: Use WordPress core blocks ONLY (e.g., core/paragraph, core/heading, core/image, core/list, core/quote). Do NOT use blockish custom blocks.
Like manage-post, do not pass hand-written HTML comments as post_content. Build a block schema (array of {name, attributes, innerBlocks}) and pass it as block_schema. It is staged as pending data so a human must open the post in the editor and click "Apply AI Layout" to approve it.

LINK SHARING RULE: When you stage a schema for human approval, you MUST share the `edit_url` with the user so they can approve it. Do NOT share the `post_url` (preview link) by default. If the user explicitly insists on seeing the preview link, you may share it, but you MUST warn them that the page will appear empty or unchanged until they approve the pending layout in the editor.', 'blockish'),
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
                        'description' => 'Array of block schema nodes using CORE blocks (e.g. core/paragraph, core/heading). Stored as pending data for human review.',
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
            ],
        ];
    }
}
