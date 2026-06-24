<?php

namespace Blockish\Mcp\Abilities\ManagePost;

use Blockish\Mcp\BlockSchemaMeta;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_post( $input ): array
    {
        $args = array_filter( [
            'ID'           => $input['post_id']      ?? null,
            'post_type'    => $input['post_type']    ?? 'post',
            'post_title'   => $input['post_title']   ?? '',
            'post_content' => !empty($input['post_content']) ? wp_slash( $input['post_content'] ) : '',
            'post_status'  => $input['post_status']  ?? 'publish',
            'post_excerpt' => $input['post_excerpt'] ?? '',
        ], fn( $v ) => $v !== null && $v !== '' );

        $editing = ! empty( $args['ID'] );
        $post_id = $editing ? wp_update_post( $args, true ) : wp_insert_post( $args, true );

        if ( is_wp_error( $post_id ) ) {
            return [ 'error' => $post_id->get_error_message() ];
        }

        $schema_staged = false;
        if ( array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] ) ) {
            $encoded     = empty( $input['block_schema'] ) ? '' : wp_json_encode( $input['block_schema'] );
            $schema_json = BlockSchemaMeta::sanitize( false === $encoded ? '' : $encoded );
            $slushed     = wp_slash( $schema_json );
            error_log( print_r( $slushed, true ) );
            update_post_meta( $post_id, BlockSchemaMeta::META_KEY, $slushed );
            $schema_staged = '' !== $slushed;
        }

        $featured_media_set = false;
        if ( ! empty( $input['featured_media'] ) ) {
            $attachment_id = absint( $input['featured_media'] );
            if ( 'attachment' !== get_post_type( $attachment_id ) ) {
                return [ 'error' => 'featured_media is not a valid attachment ID.' ];
            }
            $featured_media_set = (bool) set_post_thumbnail( $post_id, $attachment_id );
        }

        return [
            'post_id'            => $post_id,
            'post_status'        => get_post_status( $post_id ),
            'post_url'           => get_permalink( $post_id ),
            'edit_url'           => get_edit_post_link( $post_id, 'raw' ),
            'schema_staged'      => $schema_staged,
            'featured_media_set' => $featured_media_set,
        ];
    }
}
