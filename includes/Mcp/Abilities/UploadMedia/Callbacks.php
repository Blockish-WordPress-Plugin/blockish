<?php

namespace Blockish\Mcp\Abilities\UploadMedia;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function upload_media( $input ): array
    {
        $url = isset( $input['url'] ) ? trim( (string) $input['url'] ) : '';
        if ( '' === $url ) {
            return [ 'error' => '"url" is required.' ];
        }

        // media_sideload_image() and its dependencies (wp_handle_sideload,
        // wp_generate_attachment_metadata) live in wp-admin-only includes that
        // are not loaded during a REST/MCP request by default.
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $post_id = ! empty( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
        $title   = isset( $input['title'] ) ? sanitize_text_field( $input['title'] ) : null;

        $attachment_id = media_sideload_image( $url, $post_id, $title, 'id' );

        if ( is_wp_error( $attachment_id ) ) {
            return [ 'error' => $attachment_id->get_error_message() ];
        }

        if ( ! empty( $input['alt_text'] ) ) {
            update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $input['alt_text'] ) );
        }

        $metadata = wp_get_attachment_metadata( $attachment_id );

        return [
            'id'     => $attachment_id,
            'url'    => wp_get_attachment_url( $attachment_id ),
            'width'  => $metadata['width']  ?? 0,
            'height' => $metadata['height'] ?? 0,
        ];
    }
}
