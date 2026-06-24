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
            'description'         => __('Creates a new post or edits an existing one. Provide post_id to edit, omit it to create. Works with any registered post type. Returns post_id, post_url, edit_url and post_status.

IMPORTANT for Blockish blocks: do not pass hand-written "<!-- wp:... -->" comment markup as post_content. Build a block schema (array of {name, attributes, innerBlocks} — see blockish/get-block-docs) and pass it as block_schema instead. It is staged on the post as pending data, NOT written into post_content — a human must open the post in the editor and click "Apply AI Layout" (shown in the editor header only when a pending schema exists) to actually turn it into real blocks. This exists so AI-generated layouts are always reviewed before becoming live content. Call blockish/get-block-docs first to learn each block\'s attributes before building block_schema.

FEATURED IMAGE: featured_media must be an existing attachment ID — this ability does not upload files. To set a featured image: 1) call blockish/get-media first to check whether a suitable image already exists in the Media Library, 2) if not, call blockish/upload-media with an image URL to upload one and get its attachment_id, 3) pass that attachment_id as featured_media here.', 'blockish'),
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
                        'description' => 'Attachment ID of an existing Media Library item to set as the featured image. Get this from blockish/get-media or blockish/upload-media — do not guess an ID.',
                    ],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Array of Blockish block schema nodes ({name, attributes, innerBlocks}) to stage on this post. Stored as pending data for a human to review and apply in the editor — never written directly into post_content. Pass an empty array to clear a previously staged schema without setting a new one.',
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
                    'featured_media_set' => ['type' => 'boolean', 'description' => 'True if featured_media was provided and successfully set as the post thumbnail.'],
                    'error'        => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_post'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
