<?php

namespace Blockish\Mcp\Abilities\GetPosts;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-posts';

    public static function get(): array
    {
        return [
            'label'               => __('Get Posts', 'blockish'),
            'description'         => __('Reads existing posts/pages (or any registered post type). Use this to find a post by title or ID before editing it with blockish/manage-post, to check whether content already exists, or to list recent content. Provide post_id to fetch a single specific post — all other filters are ignored when post_id is set.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'   => [ 'type' => 'integer', 'description' => 'Fetch this exact post, ignoring all other filters.' ],
                    'post_type' => [ 'type' => 'string',  'description' => 'Post type slug. Defaults to "post".' ],
                    'search'    => [ 'type' => 'string',  'description' => 'Search term matched against title/content.' ],
                    'status'    => [ 'type' => 'string',  'description' => 'Comma-separated post statuses (publish, draft, private, pending, future). Defaults to "publish,draft,pending,future,private".' ],
                    'number'    => [ 'type' => 'integer', 'description' => 'Max items to return. Defaults to 20.' ],
                    'page'      => [ 'type' => 'integer', 'description' => 'Page number for pagination. Defaults to 1.' ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'items' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'             => [ 'type' => 'integer' ],
                                'title'          => [ 'type' => 'string' ],
                                'content'        => [ 'type' => 'string', 'description' => 'Raw post_content. Only included when fetching a single post via post_id, not in list queries.' ],
                                'status'         => [ 'type' => 'string' ],
                                'type'           => [ 'type' => 'string' ],
                                'url'            => [ 'type' => 'string' ],
                                'edit_url'       => [ 'type' => 'string' ],
                                'excerpt'        => [ 'type' => 'string' ],
                                'modified'       => [ 'type' => 'string' ],
                                'featured_media' => [ 'type' => 'integer' ],
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_posts'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
