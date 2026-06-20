<?php

namespace Blockish\Mcp\Abilities\GetMedia;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_media( $input ): array
    {
        $number    = ! empty( $input['number'] ) ? max( 1, absint( $input['number'] ) ) : 20;
        $page      = ! empty( $input['page'] ) ? max( 1, absint( $input['page'] ) ) : 1;
        $mime_type = isset( $input['mime_type'] ) && '' !== $input['mime_type'] ? sanitize_text_field( $input['mime_type'] ) : 'image';

        $query_args = [
            'post_type'      => 'attachment',
            'post_status'    => 'inherit',
            'post_mime_type' => $mime_type,
            'posts_per_page' => $number,
            'paged'          => $page,
            'orderby'        => 'date',
            'order'          => 'DESC',
        ];

        if ( ! empty( $input['search'] ) ) {
            $query_args['s'] = sanitize_text_field( $input['search'] );
        }

        $attachments = get_posts( $query_args );

        $items = array_map( function ( $attachment ) {
            $metadata = wp_get_attachment_metadata( $attachment->ID );

            return [
                'id'        => $attachment->ID,
                'title'     => $attachment->post_title,
                'url'       => wp_get_attachment_url( $attachment->ID ),
                'alt'       => get_post_meta( $attachment->ID, '_wp_attachment_image_alt', true ),
                'width'     => $metadata['width']  ?? 0,
                'height'    => $metadata['height'] ?? 0,
                'mime_type' => $attachment->post_mime_type,
                'date'      => $attachment->post_date,
            ];
        }, $attachments );

        return [ 'items' => $items ];
    }
}
