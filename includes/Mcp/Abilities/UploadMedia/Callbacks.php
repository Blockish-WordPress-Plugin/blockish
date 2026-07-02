<?php

namespace Blockish\Mcp\Abilities\UploadMedia;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function upload_media( $input ): array
    {
        $urls         = isset( $input['url'] ) ? (array) $input['url'] : [];
        $file_paths   = isset( $input['file_path'] ) ? (array) $input['file_path'] : [];
        $base64_datas = isset( $input['base64_data'] ) ? (array) $input['base64_data'] : [];
        $filenames    = isset( $input['filename'] ) ? (array) $input['filename'] : [];
        $titles       = isset( $input['title'] ) ? (array) $input['title'] : [];
        $alt_texts    = isset( $input['alt_text'] ) ? (array) $input['alt_text'] : [];
        
        $post_id      = ! empty( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

        if ( empty( $urls ) && empty( $file_paths ) && empty( $base64_datas ) ) {
            return [ 'items' => [[ 'error' => 'One of "url", "file_path", or "base64_data" is required.' ]] ];
        }

        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/media.php';
        require_once ABSPATH . 'wp-admin/includes/image.php';

        $max_count = max( count( $urls ), count( $file_paths ), count( $base64_datas ) );
        $results = [];

        for ( $i = 0; $i < $max_count; $i++ ) {
            $url         = $urls[$i] ?? ( count($urls) === 1 ? $urls[0] : '' );
            $file_path   = $file_paths[$i] ?? ( count($file_paths) === 1 ? $file_paths[0] : '' );
            $base64_data = $base64_datas[$i] ?? ( count($base64_datas) === 1 ? $base64_datas[0] : '' );
            $filename    = $filenames[$i] ?? ( count($filenames) === 1 ? $filenames[0] : '' );
            $title       = $titles[$i] ?? ( count($titles) === 1 ? $titles[0] : null );
            $alt_text    = $alt_texts[$i] ?? ( count($alt_texts) === 1 ? $alt_texts[0] : '' );

            if ( '' === $url && '' === $file_path && '' === $base64_data ) {
                continue;
            }

            $results[] = self::process_single_upload(
                $url, $file_path, $base64_data, $filename, $title, $alt_text, $post_id
            );
        }

        return [ 'items' => $results ];
    }

    private static function process_single_upload( $url, $file_path, $base64_data, $filename, $title, $alt_text, $post_id ): array
    {
        $attachment_id = 0;

        if ( '' !== $base64_data || '' !== $file_path ) {
            $file_content = '';
            if ( '' !== $base64_data ) {
                if ( '' === $filename ) {
                    return [ 'error' => '"filename" is required when using base64_data.' ];
                }
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
                    return [ 'error' => 'File not found at file_path: ' . $file_path ];
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

        if ( ! empty( $alt_text ) ) {
            update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );
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
