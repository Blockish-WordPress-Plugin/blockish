<?php

namespace Blockish\Mcp\Abilities\GetRevisions;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-revisions';

    public static function get(): array
    {
        return [
            'label'               => __('Get Post Revisions', 'blockish'),
            'description'         => __('Lists recent WordPress revisions for a post/page so you can restore a previous live version after a bad content change. Only use when the user asks to undo or inspect history.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id' => [
                        'type'        => 'integer',
                        'description' => 'Post ID to list revisions for.',
                    ],
                    'limit'   => [
                        'type'        => 'integer',
                        'description' => 'Max revisions to return (default 10, max 50).',
                    ],
                ],
                'required'   => [ 'post_id' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'items' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'           => [ 'type' => 'integer' ],
                                'date'         => [ 'type' => 'string' ],
                                'author'       => [ 'type' => 'string' ],
                                'excerpt'      => [ 'type' => 'string' ],
                                'block_count'  => [ 'type' => 'integer' ],
                            ],
                        ],
                    ],
                    'error' => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ Callbacks::class, 'get_revisions' ],
            'permission_callback' => fn() => current_user_can( 'edit_posts' ),
            'meta'                => [
                'mcp'         => [ 'public' => true ],
                'usage_notes' => 'Call only when the user wants history/undo. Then use blockish/restore-revision with confirm:true if they ask to restore. Pending AI schema is undone with Discard in the editor, not revisions.',
            ],
        ];
    }
}
