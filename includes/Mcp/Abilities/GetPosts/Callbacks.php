<?php

namespace Blockish\Mcp\Abilities\GetPosts;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_posts( $input ): array
    {
        if ( ! empty( $input['post_id'] ) ) {
            $post = get_post( absint( $input['post_id'] ) );
            return [ 'items' => $post ? [ self::format_post( $post, true ) ] : [] ];
        }

        $number = ! empty( $input['number'] ) ? max( 1, absint( $input['number'] ) ) : 20;
        $page   = ! empty( $input['page'] ) ? max( 1, absint( $input['page'] ) ) : 1;
        $status = ! empty( $input['status'] )
            ? array_map( 'sanitize_key', array_map( 'trim', explode( ',', $input['status'] ) ) )
            : [ 'publish', 'draft', 'pending', 'future', 'private' ];

        $query_args = [
            'post_type'      => ! empty( $input['post_type'] ) ? sanitize_key( $input['post_type'] ) : 'post',
            'post_status'    => $status,
            'posts_per_page' => $number,
            'paged'          => $page,
            'orderby'        => 'modified',
            'order'          => 'DESC',
        ];

        if ( ! empty( $input['search'] ) ) {
            $query_args['s'] = sanitize_text_field( $input['search'] );
        }

        $posts = get_posts( $query_args );

        return [ 'items' => array_map( [ self::class, 'format_post' ], $posts ) ];
    }

    private static function format_post( $post, bool $with_content = false ): array
    {
        $data = [
            'id'             => $post->ID,
            'title'          => get_the_title( $post ),
            'status'         => $post->post_status,
            'type'           => $post->post_type,
            'url'            => get_permalink( $post ),
            'edit_url'       => get_edit_post_link( $post->ID, 'raw' ),
            'excerpt'        => wp_strip_all_tags( get_the_excerpt( $post ) ),
            'modified'       => $post->post_modified,
            'featured_media' => (int) get_post_thumbnail_id( $post ),
        ];

        // Omitted from list queries to avoid bloating the response with every
        // matching post's full content — only included when fetching one post by ID.
        if ( $with_content ) {
            $data['content'] = $post->post_content;
        }

        return $data;
    }
}
