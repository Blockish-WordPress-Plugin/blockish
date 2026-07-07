<?php

namespace Blockish\Mcp\Abilities\ManageComments;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-comments';

    public static function get(): array
    {
        return [
            'label'               => __('Manage Comments', 'blockish'),
            'description'         => __('Retrieve, create, update, or delete WordPress comments (approve, spam, trash).', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type'        => 'string',
                        'description' => 'The action to perform: "get", "create", "update", "delete", "status".',
                        'enum'        => ['get', 'create', 'update', 'delete', 'status'],
                    ],
                    'comment_ID' => [
                        'type'        => 'integer',
                        'description' => 'The ID of the comment (required for update, delete, status).',
                    ],
                    'comment_post_ID' => [
                        'type'        => 'integer',
                        'description' => 'The ID of the post the comment belongs to (for create or filtering get).',
                    ],
                    'comment_content' => [
                        'type'        => 'string',
                        'description' => 'The text content of the comment.',
                    ],
                    'comment_author' => [
                        'type'        => 'string',
                        'description' => 'Author name.',
                    ],
                    'comment_author_email' => [
                        'type'        => 'string',
                        'description' => 'Author email.',
                    ],
                    'comment_status' => [
                        'type'        => 'string',
                        'description' => 'Status: "approve", "hold", "spam", "trash". Required for "status" action.',
                        'enum'        => ['approve', 'hold', 'spam', 'trash'],
                    ],
                    'args' => [
                        'type'        => 'object',
                        'description' => 'Additional arguments for getting comments (e.g., number, status).',
                        'additionalProperties' => true,
                    ]
                ],
                'required'   => ['action'],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'data' => [
                        'type' => 'object',
                        'description' => 'The resulting comment data or success message.',
                        'additionalProperties' => true,
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'handle'],
            'permission_callback' => fn() => current_user_can('moderate_comments'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
