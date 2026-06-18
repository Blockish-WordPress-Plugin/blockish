<?php

namespace Blockish\Mcp\Abilities\ManagePost;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_post( $input ): array
    {
        $args = array_filter( [
            'ID'           => $input['post_id']      ?? null,
            'post_type'    => $input['post_type']    ?? 'post',
            'post_title'   => $input['post_title']   ?? '',
            'post_content' => $input['post_content'] ?? '',
            'post_status'  => $input['post_status']  ?? 'draft',
            'post_excerpt' => $input['post_excerpt'] ?? '',
        ], fn( $v ) => $v !== null && $v !== '' );

        $editing = ! empty( $args['ID'] );
        $post_id = $editing ? wp_update_post( $args, true ) : wp_insert_post( $args, true );

        if ( is_wp_error( $post_id ) ) {
            return [ 'error' => $post_id->get_error_message() ];
        }

        return [
            'post_id'     => $post_id,
            'post_status' => get_post_status( $post_id ),
            'post_url'    => get_permalink( $post_id ),
            'edit_url'    => get_edit_post_link( $post_id, 'raw' ),
        ];
    }
}
