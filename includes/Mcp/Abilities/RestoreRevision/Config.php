<?php

namespace Blockish\Mcp\Abilities\RestoreRevision;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/restore-revision';

    public static function get(): array
    {
        return [
            'label'               => __('Restore Post Revision', 'blockish'),
            'description'         => __('Restores a WordPress revision onto its parent post. Requires confirm:true. Only call when the user explicitly asks to undo/restore.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'post_id'     => [
                        'type'        => 'integer',
                        'description' => 'Parent post ID.',
                    ],
                    'revision_id' => [
                        'type'        => 'integer',
                        'description' => 'Revision ID from blockish/get-revisions.',
                    ],
                    'confirm'     => [
                        'type'        => 'boolean',
                        'description' => 'Must be true to restore.',
                    ],
                ],
                'required'   => [ 'post_id', 'revision_id', 'confirm' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'     => [ 'type' => 'integer' ],
                    'revision_id' => [ 'type' => 'integer' ],
                    'restored'    => [ 'type' => 'boolean' ],
                    'post_url'    => [ 'type' => 'string' ],
                    'edit_url'    => [ 'type' => 'string' ],
                    'error'       => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [ Callbacks::class, 'restore_revision' ],
            'permission_callback' => fn() => current_user_can( 'edit_posts' ),
            'meta'                => [
                'mcp'         => [ 'public' => true ],
                'usage_notes' => 'ONLY when the user explicitly asks to restore. Pass confirm:true. Call trigger-refresh afterward if the editor is open.',
            ],
        ];
    }
}
