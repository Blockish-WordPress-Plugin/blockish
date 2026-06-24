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

        if ( isset( $input['css'] ) ) {
            update_post_meta( $id, 'blockishClassManagerStyles', wp_strip_all_tags( $input['css'] ) );
        }

        $post      = get_post( $id );
        $is_child  = (int) ( $post->post_parent ?? 0 ) > 0;
        $slug      = GetClassesCallbacks::normalize_slug( $post->post_title ?? '' );
        $css_selector = $is_child ? '.blockish-cm-' . $id : ( $slug ? '.' . $slug : '' );

        return [
            'post_id'      => $id,
            'name'         => $post->post_title,
            'css_selector' => $css_selector,
            'parent_id'    => $is_child ? (int) $post->post_parent : null,
            'css'          => get_post_meta( $id, 'blockishClassManagerStyles', true ),
        ];
    }
}
