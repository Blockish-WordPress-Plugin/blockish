<?php

namespace Blockish\Mcp\Abilities\UploadMedia;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function upload_media( $input ): array
    {
        $url         = isset( $input['url'] ) ? trim( (string) $input['url'] ) : '';
        $file_path   = isset( $input['file_path'] ) ? trim( (string) $input['file_path'] ) : '';
        $base64_data = isset( $input['base64_data'] ) ? trim( (string) $input['base64_data'] ) : '';
        $filename    = isset( $input['filename'] ) ? trim( (string) $input['filename'] ) : '';

        if ( '' === $url && '' === $file_path && '' === $base64_data ) {
            return [ 'error' => 'One of "url", "file_path", or "base64_data" is required.' ];
        }

        // media_sideload_image() and its dependencies (wp_handle_sideload,
        // wp_generate_attachment_metadata) live in wp-admin-only includes that
        // are not loaded during a REST/MCP request by default.
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $post_id = ! empty( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
        $title   = isset( $input['title'] ) ? sanitize_text_field( $input['title'] ) : null;
        $attachment_id = 0;

        if ( '' !== $base64_data || '' !== $file_path ) {
            $file_content = '';
            if ( '' !== $base64_data ) {
                if ( '' === $filename ) {
                    return [ 'error' => '"filename" is required when using base64_data.' ];
                }
                // Check if there is a data URI scheme, e.g. "data:image/png;base64,"
                if ( strpos( $base64_data, 'data:image' ) === 0 && strpos( $base64_data, 'base64,' ) !== false ) {
                    $base64_parts = explode( 'base64,', $base64_data );
                    $base64_data  = $base64_parts[1];
                }
                $file_content = base64_decode( $base64_data );
                if ( $file_content === false ) {
                    return [ 'error' => 'Invalid base64_data.' ];
                }
            } elseif ( '' !== $file_path ) {
                if ( ! file_exists( $file_path ) ) {
                    return [ 'error' => 'File not found at file_path.' ];
                }
                $file_content = file_get_contents( $file_path );
                if ( '' === $filename ) {
                    $filename = basename( $file_path );
                }
            }

            $upload = wp_upload_bits( $filename, null, $file_content );
            if ( ! empty( $upload['error'] ) ) {
                return [ 'error' => $upload['error'] ];
            }

            $wp_filetype = wp_check_filetype( $filename, null );
            $attachment = [
                'post_mime_type' => $wp_filetype['type'],
                'post_title'     => $title ?: preg_replace( '/\.[^.]+$/', '', $filename ),
                'post_content'   => '',
                'post_status'    => 'inherit',
            ];

            $attachment_id = wp_insert_attachment( $attachment, $upload['file'], $post_id );
            
            if ( is_wp_error( $attachment_id ) ) {
                return [ 'error' => $attachment_id->get_error_message() ];
            }

            $attach_data = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
            wp_update_attachment_metadata( $attachment_id, $attach_data );
        } else {
            $attachment_id = media_sideload_image( $url, $post_id, $title, 'id' );
            if ( is_wp_error( $attachment_id ) ) {
                return [ 'error' => $attachment_id->get_error_message() ];
            }
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
