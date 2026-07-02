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

        if ( ! empty( $input['tax_query'] ) && is_array( $input['tax_query'] ) ) {
            $tax_query = ['relation' => 'AND'];
            foreach ( $input['tax_query'] as $tax_item ) {
                if ( ! empty( $tax_item['taxonomy'] ) && ! empty( $tax_item['terms'] ) && is_array( $tax_item['terms'] ) ) {
                    $field = is_int( $tax_item['terms'][0] ) ? 'term_id' : 'slug';
                    $tax_query[] = [
                        'taxonomy' => sanitize_key( $tax_item['taxonomy'] ),
                        'field'    => $field,
                        'terms'    => array_map( function($term) use ($field) {
                            return $field === 'term_id' ? absint($term) : sanitize_text_field($term);
                        }, $tax_item['terms'] ),
                    ];
                }
            }
            if ( count( $tax_query ) > 1 ) {
                $query_args['tax_query'] = $tax_query;
            }
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
            $parsed_blocks   = parse_blocks( $post->post_content );
            $data['schema']  = \Blockish\Mcp\SchemaUtils::convert_to_js_schema( $parsed_blocks );
        }

        return $data;
    }
}
