<?php

namespace Blockish\Mcp\Abilities\ManagePost;

use Blockish\Mcp\BlockSchemaMeta;
use Blockish\Mcp\SchemaUtils;

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
        if ( ! empty( $input['schema_file'] ) ) {
            $loaded = SchemaUtils::load_schema_file( (string) $input['schema_file'] );
            if ( is_string( $loaded ) ) {
                return [ 'error' => $loaded ];
            }
            $input['block_schema'] = $loaded;
        }

        $schema_context = 'page';
        if ( ! empty( $input['post_type'] ) && in_array( $input['post_type'], array( 'wp_block', 'blockish_form' ), true ) ) {
            $schema_context = 'pattern';
        } elseif ( ! empty( $input['post_id'] ) ) {
            $existing_type = get_post_type( (int) $input['post_id'] );
            if ( in_array( $existing_type, array( 'wp_block', 'blockish_form' ), true ) ) {
                $schema_context = 'pattern';
            }
        }
        if ( array_key_exists( 'block_schema', $input ) && is_array( $input['block_schema'] ) && ! empty( $input['block_schema'] ) ) {
            $shape_error = SchemaUtils::validate_schema_shape( $input['block_schema'] );
            if ( $shape_error ) {
                return [ 'error' => $shape_error ];
            }

            $mono_error = BlockSchemaMeta::get_monolithic_schema_error( $input['block_schema'], $schema_context );
            if ( $mono_error ) {
                return [ 'error' => $mono_error ];
            }

            $type_for_chrome = ! empty( $input['post_type'] )
                ? (string) $input['post_type']
                : ( ! empty( $input['post_id'] ) ? (string) get_post_type( (int) $input['post_id'] ) : 'page' );
            $chrome_error = BlockSchemaMeta::get_page_template_part_error( $input['block_schema'], $type_for_chrome );
            if ( $chrome_error ) {
                return [ 'error' => $chrome_error ];
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
            if ( ! current_user_can( 'delete_post', (int) $input['post_id'] ) ) {
                return [ 'error' => 'You do not have access to delete this post.' ];
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
            if ( ! current_user_can( 'edit_post', (int) $input['post_id'] ) ) {
                return [ 'error' => 'You do not have access to edit this post.' ];
            }
            $args['ID'] = $existing_post['ID'];
            $args['post_type'] = isset( $input['post_type'] ) ? $input['post_type'] : $existing_post['post_type'];
            $args['post_title'] = isset( $input['post_title'] ) ? $input['post_title'] : $existing_post['post_title'];
            $args['post_status'] = isset( $input['post_status'] ) ? $input['post_status'] : $existing_post['post_status'];
            $args['post_excerpt'] = isset( $input['post_excerpt'] ) ? $input['post_excerpt'] : $existing_post['post_excerpt'];

            if ( array_key_exists( 'post_content', $input ) ) {
                $content_error = self::validate_post_content_input(
                    (string) $input['post_content'],
                    (string) $args['post_type'],
                    (string) $existing_post['post_content'],
                    (int) $existing_post['ID']
                );
                if ( $content_error ) {
                    return [ 'error' => $content_error ];
                }
                $args['post_content'] = wp_slash( $input['post_content'] );
            } else {
                $args['post_content'] = wp_slash( $existing_post['post_content'] );
            }
        } else {
            if ( empty( $input['post_type'] ) ) {
                return [ 'error' => 'post_type is required when creating a post.' ];
            }
            if ( empty( $input['post_title'] ) ) {
                return [ 'error' => 'post_title is required when creating a post.' ];
            }
            $pto = get_post_type_object( $input['post_type'] );
            $cap = ( $pto && ! empty( $pto->cap->create_posts ) ) ? $pto->cap->create_posts : 'edit_posts';
            if ( ! current_user_can( $cap ) ) {
                return [ 'error' => 'You do not have access to create this post type.' ];
            }
            $args['post_type'] = $input['post_type'];
            $args['post_title'] = $input['post_title'];
            $args['post_status'] = $input['post_status'] ?? 'draft';
            $args['post_excerpt'] = $input['post_excerpt'] ?? '';

            if ( array_key_exists( 'post_content', $input ) ) {
                $content_error = self::validate_post_content_input(
                    (string) $input['post_content'],
                    (string) $args['post_type'],
                    '',
                    0
                );
                if ( $content_error ) {
                    return [ 'error' => $content_error ];
                }
                $args['post_content'] = wp_slash( $input['post_content'] );
            } else {
                $args['post_content'] = '';
            }
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

    /**
     * Enforce manage-post post_content rules: pattern/form forbidden; pages/posts only pattern refs on empty targets.
     */
    private static function validate_post_content_input( string $content, string $post_type, string $existing_content, int $post_id ): ?string {
        if ( in_array( $post_type, [ 'wp_block', 'blockish_form' ], true ) ) {
            return 'Do not pass post_content for patterns or forms. Use block_schema / schema_file only.';
        }

        if ( ! SchemaUtils::is_assembly_target_empty( $existing_content, $post_id ) ) {
            return 'This post already has content or a pending schema. Do not pass post_content — stage pattern refs with block_schema and ask the user to Accept.';
        }

        return SchemaUtils::validate_pattern_ref_markup( $content );
    }
}
