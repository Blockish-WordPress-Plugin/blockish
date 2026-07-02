<?php

namespace Blockish\Mcp\Abilities\ManagePost;

use Blockish\Mcp\BlockSchemaMeta;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_post( $input ): array
    {
        // Check if this might be a payload size issue (JSON truncated/dropped)
        if (empty($input) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
            return ['error' => 'Payload too large or invalid JSON. The request body was dropped or truncated before reaching the handler. Try chunking your layout or simplifying styles to reduce payload size.'];
        }

        $editing = ! empty( $input['post_id'] );
        $args = [];

        if ( $editing ) {
            $existing_post = get_post( $input['post_id'], ARRAY_A );
            if ( ! $existing_post ) {
                return [ 'error' => 'Post not found.' ];
            }
            $args['ID'] = $existing_post['ID'];
            $args['post_type'] = isset( $input['post_type'] ) ? $input['post_type'] : $existing_post['post_type'];
            $args['post_title'] = isset( $input['post_title'] ) ? $input['post_title'] : $existing_post['post_title'];
            $args['post_content'] = isset( $input['post_content'] ) ? wp_slash( $input['post_content'] ) : wp_slash( $existing_post['post_content'] );
            $args['post_status'] = isset( $input['post_status'] ) ? $input['post_status'] : $existing_post['post_status'];
            $args['post_excerpt'] = isset( $input['post_excerpt'] ) ? $input['post_excerpt'] : $existing_post['post_excerpt'];
        } else {
            if ( empty( $input['post_type'] ) ) {
                return [ 'error' => 'post_type is required when creating a post.' ];
            }
            if ( empty( $input['post_title'] ) ) {
                return [ 'error' => 'post_title is required when creating a post.' ];
            }
            $args['post_type'] = $input['post_type'];
            $args['post_title'] = $input['post_title'];
            $args['post_content'] = isset( $input['post_content'] ) ? wp_slash( $input['post_content'] ) : '';
            $args['post_status'] = $input['post_status'] ?? 'draft';
            $args['post_excerpt'] = $input['post_excerpt'] ?? '';
        }

        $post_id = $editing ? wp_update_post( $args, true ) : wp_insert_post( $args, true );

        if ( is_wp_error( $post_id ) ) {
            return [ 'error' => $post_id->get_error_message() ];
        }

        $schema_staged = false;
        if ( array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] ) ) {
            $encoded     = empty( $input['block_schema'] ) ? '' : wp_json_encode( $input['block_schema'] );
            $schema_json = BlockSchemaMeta::sanitize( false === $encoded ? '' : $encoded );
            $slushed     = wp_slash( $schema_json );
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
