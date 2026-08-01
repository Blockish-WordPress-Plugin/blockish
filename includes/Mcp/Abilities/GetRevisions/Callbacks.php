<?php

namespace Blockish\Mcp\Abilities\GetRevisions;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_revisions( array $input ): array
    {
        $post_id = absint( $input['post_id'] ?? 0 );
        if ( ! $post_id || ! get_post( $post_id ) ) {
            return [ 'error' => 'Post not found.' ];
        }
        if ( ! current_user_can( 'edit_post', $post_id ) ) {
            return [ 'error' => 'You do not have access to edit this post.' ];
        }

        $limit = isset( $input['limit'] ) ? absint( $input['limit'] ) : 10;
        if ( $limit < 1 ) {
            $limit = 10;
        }
        if ( $limit > 50 ) {
            $limit = 50;
        }

        $revisions = wp_get_post_revisions( $post_id, [
            'numberposts' => $limit,
            'orderby'     => 'date',
            'order'       => 'DESC',
        ] );

        $items = [];
        foreach ( $revisions as $revision ) {
            $author = get_userdata( (int) $revision->post_author );
            $blocks = parse_blocks( (string) $revision->post_content );
            $count  = 0;
            foreach ( $blocks as $block ) {
                if ( ! empty( $block['blockName'] ) ) {
                    $count++;
                }
            }
            $plain = wp_strip_all_tags( (string) $revision->post_content );
            $plain = preg_replace( '/\s+/', ' ', $plain ?? '' );
            $excerpt = function_exists( 'mb_substr' )
                ? mb_substr( $plain, 0, 120 )
                : substr( $plain, 0, 120 );

            $items[] = [
                'id'          => (int) $revision->ID,
                'date'        => $revision->post_modified_gmt,
                'author'      => $author ? $author->display_name : '',
                'excerpt'     => $excerpt,
                'block_count' => $count,
            ];
        }

        return [ 'items' => $items ];
    }
}
