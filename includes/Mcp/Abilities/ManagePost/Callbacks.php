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
            return ['error' => BlockSchemaMeta::payload_truncated_error()];
        }

        // Support loading large schemas from a file to avoid payload truncation
        if ( !empty($input['schema_file']) && file_exists($input['schema_file']) ) {
            $json = file_get_contents($input['schema_file']);
            $decoded = json_decode($json, true);
            if ($decoded) {
                $input['block_schema'] = $decoded;
            }
        }

        $schema_context = 'page';
        if ( ! empty( $input['post_type'] ) && 'wp_block' === $input['post_type'] ) {
            $schema_context = 'pattern';
        } elseif ( ! empty( $input['post_id'] ) ) {
            $existing_type = get_post_type( (int) $input['post_id'] );
            if ( 'wp_block' === $existing_type ) {
                $schema_context = 'pattern';
            }
        }
        if ( array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] ) && ! empty( $input['block_schema'] ) ) {
            $mono_error = BlockSchemaMeta::get_monolithic_schema_error( $input['block_schema'], $schema_context );
            if ( $mono_error ) {
                return [ 'error' => $mono_error ];
            }
        }

        $editing = ! empty( $input['post_id'] );
        $deleting = ! empty( $input['delete'] ) && $editing;
        $args = [];

        if ( $deleting ) {
            $existing_post = get_post( $input['post_id'] );
            if ( ! $existing_post ) {
                return [ 'error' => 'Post not found.' ];
            }
            wp_delete_post( $input['post_id'], true );
            return [
                'post_id'            => $input['post_id'],
                'post_status'        => 'deleted',
                'post_url'           => '',
                'edit_url'           => '',
                'schema_staged'      => false,
                'featured_media_set' => false,
            ];
        }

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

        if ( isset( $input['meta_input'] ) && is_array( $input['meta_input'] ) ) {
            $args['meta_input'] = $input['meta_input'];
        }
        if ( isset( $input['tax_input'] ) && is_array( $input['tax_input'] ) ) {
            $args['tax_input'] = $input['tax_input'];
        }

        $post_id = $editing ? wp_update_post( $args, true ) : wp_insert_post( $args, true );

        if ( is_wp_error( $post_id ) ) {
            return [ 'error' => $post_id->get_error_message() ];
        }

        $schema_staged = false;
        $warnings      = [];
        if ( array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] ) ) {
            if ( ! empty( $input['block_schema'] ) ) {
                $warnings = BlockSchemaMeta::get_schema_warnings( $input['block_schema'] );
            }
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

        $result = [
            'post_id'            => $post_id,
            'post_status'        => get_post_status( $post_id ),
            'post_url'           => get_permalink( $post_id ),
            'edit_url'           => get_edit_post_link( $post_id, 'raw' ),
            'schema_staged'      => $schema_staged,
            'featured_media_set' => $featured_media_set,
        ];
        if ( ! empty( $warnings ) ) {
            $result['warnings'] = $warnings;
        }
        return $result;
    }
}
