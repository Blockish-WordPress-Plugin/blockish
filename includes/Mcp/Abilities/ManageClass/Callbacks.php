<?php

namespace Blockish\Mcp\Abilities\ManageClass;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_class( $input ): array
    {
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

        $args = [
            'post_type'   => 'blockish-classes',
            'post_status' => 'publish',
            'post_title'  => sanitize_text_field( $input['name'] ?? '' ),
        ];

        // The style object is stored as JSON in post_content — the editor
        // compiles it to the blockishClassManagerStyles meta automatically.
        if ( array_key_exists( 'content', $input ) ) {
            $content = $input['content'];
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
}
