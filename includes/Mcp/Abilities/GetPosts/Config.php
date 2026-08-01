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
            'description'         => __('Reads existing posts, pages or any registered post type, filterable by post_type, search, status and pagination, or fetch one by post_id.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'   => [ 'type' => 'integer', 'description' => 'Fetch this exact post, ignoring all other filters. NOTE: You MUST provide a post_id if you want to retrieve the full post content or schema.' ],
                    'post_type' => [ 'type' => 'string',  'description' => 'Post type slug. Defaults to "post".' ],
                    'search'    => [ 'type' => 'string',  'description' => 'Search term matched against title/content.' ],
                    // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
                    'tax_query' => [
                        'type' => 'array',
                        'description' => 'Array of taxonomy query objects. Each object must have "taxonomy" (e.g. "category" or "post_tag") and "terms" (array of term slugs or IDs). Example: [{"taxonomy":"category", "terms":["news"]}]',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'taxonomy' => [ 'type' => 'string' ],
                                'terms'    => [ 
                                    'type' => 'array', 
                                    'items' => [ 
                                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'integer' ] ]
                                    ] 
                                ],
                            ],
                            'required' => ['taxonomy', 'terms']
                        ]
                    ],
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
                                'content'        => [ 'type' => 'string', 'description' => 'Raw post_content. Only included when fetching a single post via post_id, not in list queries. May be a staged blockish/ai-preview block.' ],
                                'schema'         => [ 'type' => 'array', 'description' => 'Resolved schema for editing. If content has blockish/ai-preview, this is pendingSchema; otherwise parsed from content. Present only if fetched by post_id.' ],
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
                'usage_notes' => 'Use this to find a post by title or ID before editing it with blockish/manage-post. When fetching by post_id, `schema` is the edit truth: pendingSchema if an ai-preview is staged in content, otherwise the live content schema. `content` is raw markup.',
            ],
        ];
    }
}
