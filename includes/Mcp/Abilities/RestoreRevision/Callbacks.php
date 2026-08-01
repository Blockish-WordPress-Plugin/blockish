<?php

namespace Blockish\Mcp\Abilities\RestoreRevision;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function restore_revision( array $input ): array
    {
        if ( empty( $input['confirm'] ) ) {
            return [ 'error' => 'confirm must be true to restore a revision.' ];
        }

        $post_id     = absint( $input['post_id'] ?? 0 );
        $revision_id = absint( $input['revision_id'] ?? 0 );

        if ( ! $post_id || ! get_post( $post_id ) ) {
            return [ 'error' => 'Post not found.' ];
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return [ 'error' => 'You do not have access to edit this post.' ];
        }

        $revision = wp_get_post_revision( $revision_id );
        if ( ! $revision ) {
            return [ 'error' => 'Revision not found.' ];
        }
        if ( (int) $revision->post_parent !== $post_id ) {
            return [ 'error' => 'Revision does not belong to this post.' ];
        }

        $result = wp_restore_post_revision( $revision_id );
        if ( ! $result || is_wp_error( $result ) ) {
            $msg = is_wp_error( $result ) ? $result->get_error_message() : 'Failed to restore revision.';
            return [ 'error' => $msg ];
        }

        return [
            'post_id'     => $post_id,
            'revision_id' => $revision_id,
            'restored'    => true,
            'post_url'    => get_permalink( $post_id ),
            'edit_url'    => get_edit_post_link( $post_id, 'raw' ),
        ];
    }
}
