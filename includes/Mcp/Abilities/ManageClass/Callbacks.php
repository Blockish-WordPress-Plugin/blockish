<?php

namespace Blockish\Mcp\Abilities\ManageClass;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_class( $input ): array
    {
        // Check if this might be a payload size issue (JSON truncated/dropped)
        if (empty($input) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
            return ['error' => 'Payload too large or invalid JSON. The request body was dropped or truncated before reaching the handler. Try simplifying styles to reduce payload size.'];
        }

        $action  = $input['action'] ?? 'create';
        $post_id = absint( $input['post_id'] ?? 0 );

        if ( $action === 'delete' ) {
            if ( ! $post_id ) {
                return [ 'error' => 'post_id is required for delete.' ];
            }
            if ( 'blockish-classes' !== get_post_type( $post_id ) ) {
                return [ 'error' => 'Invalid post_id: not a blockish-classes post.' ];
            }
            wp_delete_post( $post_id, true );
            return [ 'deleted' => true, 'post_id' => $post_id ];
        }

        if ( $action === 'create' ) {
            if ( empty( $input['name'] ) ) {
                return [ 'error' => 'name is required when creating a class.' ];
            }
        }

        $args = [
            'post_type'   => 'blockish-classes',
            'post_status' => 'publish',
        ];

        if ( isset( $input['name'] ) ) {
            $args['post_title'] = sanitize_text_field( $input['name'] );
        }

        // The style object is stored as JSON in post_content — the editor
        // compiles it to the blockishClassManagerStyles meta automatically.
        if ( array_key_exists( 'content', $input ) ) {
            $content = $input['content'];
            
            if ( $action === 'update' && $post_id > 0 ) {
                $existing_post = get_post( $post_id );
                if ( $existing_post && 'blockish-classes' === $existing_post->post_type ) {
                    $existing_content = json_decode( $existing_post->post_content, true );
                    if ( is_array( $existing_content ) && is_array( $content ) ) {
                        if ( empty( $content ) ) {
                            // The AI explicitly passed an empty object to clear the styles completely
                            $content = [];
                        } else {
                            // Special case: full-replace for array/object keys that don't merge well index-by-index
                            $full_replace_keys = ['boxShadow', 'textShadow', 'filters', 'backgroundFilters'];
                            foreach ($full_replace_keys as $k) {
                                if (array_key_exists($k, $content)) {
                                    $existing_content[$k] = $content[$k];
                                    unset($content[$k]);
                                }
                            }
                            
                            // Merge existing content so we don't wipe out properties not sent in the update
                            $content = array_replace_recursive( $existing_content, $content );
                            $content = self::remove_null_values( $content );
                        }
                    }
                }
            }

            if ( is_array( $content ) ) {
                $content = wp_json_encode( $content );
            }
            $args['post_content'] = wp_slash( is_string( $content ) ? $content : '' );
        }

        if ( ! empty( $input['parent_id'] ) ) {
            $args['post_parent'] = absint( $input['parent_id'] );
        }

        if ( $action === 'update' ) {
            if ( ! $post_id ) {
                return [ 'error' => 'post_id is required for update.' ];
            }
            $args['ID'] = $post_id;
            $result     = wp_update_post( $args, true );
        } else {
            $result = wp_insert_post( $args, true );
        }

        if ( is_wp_error( $result ) ) {
            return [ 'error' => $result->get_error_message() ];
        }

        $id = (int) $result;

        $post         = get_post( $id );
        $is_child     = (int) ( $post->post_parent ?? 0 ) > 0;
        $css_selector = GetClassesCallbacks::build_selector( $id, $post->post_title ?? '', $post->post_parent ?? 0 );

        $stored_content = json_decode( (string) ( $post->post_content ?? '' ), true );

        return [
            'post_id'      => $id,
            'name'         => $post->post_title,
            'css_selector' => $css_selector,
            'parent_id'    => $is_child ? (int) $post->post_parent : null,
            'content'      => is_array( $stored_content ) ? $stored_content : new \stdClass(),
        ];
    }

    private static function remove_null_values( array $array ): array {
        foreach ( $array as $key => $value ) {
            if ( is_array( $value ) ) {
                $array[ $key ] = self::remove_null_values( $value );
                if ( empty( $array[ $key ] ) ) {
                    unset( $array[ $key ] );
                }
            } elseif ( $value === null ) {
                unset( $array[ $key ] );
            }
        }
        return $array;
    }
}
