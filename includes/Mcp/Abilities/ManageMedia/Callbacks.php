<?php

namespace Blockish\Mcp\Abilities\ManageMedia;

defined( 'ABSPATH' ) || exit;

class Callbacks
{
	/**
	 * Extensions allowed for MCP create (images + common video for Video / container background).
	 *
	 * @return string[]
	 */
	private static function allowed_extensions(): array {
		return [ 'jpg', 'jpeg', 'png', 'gif', 'webp', 'mp4', 'webm', 'mov' ];
	}

	public static function manage_media( $input ): array {
		$attachment_ids = isset( $input['attachment_id'] ) ? (array) $input['attachment_id'] : [];
		$is_delete      = ! empty( $input['delete'] );

		$urls         = isset( $input['url'] ) ? (array) $input['url'] : [];
		$file_paths   = isset( $input['file_path'] ) ? (array) $input['file_path'] : [];
		$base64_datas = isset( $input['base64_data'] ) ? (array) $input['base64_data'] : [];
		$filenames    = isset( $input['filename'] ) ? (array) $input['filename'] : [];
		$titles       = isset( $input['title'] ) ? (array) $input['title'] : [];
		$alt_texts    = isset( $input['alt_text'] ) ? (array) $input['alt_text'] : [];

		$post_id = ! empty( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;

		$results = [];

		if ( $is_delete ) {
			if ( empty( $attachment_ids ) ) {
				return [ 'items' => [ [ 'error' => '"attachment_id" is required for deletion.' ] ] ];
			}
			foreach ( $attachment_ids as $id ) {
				$id = absint( $id );
				if ( ! current_user_can( 'delete_post', $id ) ) {
					$results[] = [ 'id' => $id, 'error' => 'You do not have access to delete this attachment.' ];
					continue;
				}
				if ( wp_delete_attachment( $id, true ) ) {
					$results[] = [ 'id' => $id, 'deleted' => true ];
				} else {
					$results[] = [ 'id' => $id, 'error' => 'Failed to delete attachment.' ];
				}
			}
			return [ 'items' => $results ];
		}

		if ( ! empty( $attachment_ids ) ) {
			foreach ( $attachment_ids as $i => $id ) {
				$id       = absint( $id );
				$title    = $titles[ $i ] ?? ( count( $titles ) === 1 ? $titles[0] : null );
				$alt_text = $alt_texts[ $i ] ?? ( count( $alt_texts ) === 1 ? $alt_texts[0] : null );

				if ( null !== $title ) {
					wp_update_post(
						[
							'ID'         => $id,
							'post_title' => sanitize_text_field( $title ),
						]
					);
				}
				if ( null !== $alt_text ) {
					update_post_meta( $id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );
				}

				$payload            = self::format_attachment_result( $id );
				$payload['updated'] = true;
				$results[]          = $payload;
			}
			return [ 'items' => $results ];
		}

		if ( empty( $urls ) && empty( $file_paths ) && empty( $base64_datas ) ) {
			return [ 'items' => [ [ 'error' => 'One of "url", "file_path", or "base64_data" is required to create an attachment.' ] ] ];
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$max_count = max( count( $urls ), count( $file_paths ), count( $base64_datas ) );

		for ( $i = 0; $i < $max_count; $i++ ) {
			$url         = $urls[ $i ] ?? ( count( $urls ) === 1 ? $urls[0] : '' );
			$file_path   = $file_paths[ $i ] ?? ( count( $file_paths ) === 1 ? $file_paths[0] : '' );
			$base64_data = $base64_datas[ $i ] ?? ( count( $base64_datas ) === 1 ? $base64_datas[0] : '' );
			$filename    = $filenames[ $i ] ?? ( count( $filenames ) === 1 ? $filenames[0] : '' );
			$title       = $titles[ $i ] ?? ( count( $titles ) === 1 ? $titles[0] : null );
			$alt_text    = $alt_texts[ $i ] ?? ( count( $alt_texts ) === 1 ? $alt_texts[0] : '' );

			if ( '' === $url && '' === $file_path && '' === $base64_data ) {
				continue;
			}

			$results[] = self::process_single_upload(
				$url,
				$file_path,
				$base64_data,
				$filename,
				$title,
				$alt_text,
				$post_id
			);
		}

		return [ 'items' => $results ];
	}

	/**
	 * @return array{id?:int,url?:string,width?:int,height?:int,mime?:string,filesize?:int,media_type?:string,error?:string}
	 */
	private static function process_single_upload( $url, $file_path, $base64_data, $filename, $title, $alt_text, $post_id ): array {
		$attachment_id = 0;

		if ( '' !== $base64_data || '' !== $file_path ) {
			$file_content = '';
			if ( '' !== $base64_data ) {
				if ( '' === $filename ) {
					return [ 'error' => '"filename" is required when using base64_data.' ];
				}
				if ( preg_match( '/^data:(image|video)\/[^;]+;base64,/', $base64_data ) && strpos( $base64_data, 'base64,' ) !== false ) {
					$base64_parts = explode( 'base64,', $base64_data, 2 );
					$base64_data  = $base64_parts[1];
				}
				$file_content = base64_decode( $base64_data );
				if ( false === $file_content ) {
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

			$ext_error = self::validate_filename_extension( $filename );
			if ( null !== $ext_error ) {
				return [ 'error' => $ext_error ];
			}

			$upload = wp_upload_bits( $filename, null, $file_content );
			if ( ! empty( $upload['error'] ) ) {
				return [ 'error' => $upload['error'] ];
			}

			$wp_filetype = wp_check_filetype( $filename, null );
			if ( empty( $wp_filetype['type'] ) ) {
				@unlink( $upload['file'] ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				return [ 'error' => 'Unsupported or unrecognized file type for: ' . $filename ];
			}

			$attachment = [
				'post_mime_type' => $wp_filetype['type'],
				'post_title'     => $title ?: preg_replace( '/\.[^.]+$/', '', $filename ),
				'post_content'   => '',
				'post_status'    => 'inherit',
			];

			$attachment_id = wp_insert_attachment( $attachment, $upload['file'], $post_id );

			if ( is_wp_error( $attachment_id ) ) {
				@unlink( $upload['file'] ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				return [ 'error' => $attachment_id->get_error_message() ];
			}

			$attach_data = wp_generate_attachment_metadata( $attachment_id, $upload['file'] );
			wp_update_attachment_metadata( $attachment_id, $attach_data );
		} else {
			$url_error = self::validate_url_extension( $url );
			if ( null !== $url_error ) {
				return [ 'error' => $url_error ];
			}

			$tmp = download_url( $url );
			if ( is_wp_error( $tmp ) ) {
				return [ 'error' => $tmp->get_error_message() ];
			}

			$name = self::filename_from_url( $url );
			$file = [
				'name'     => $name,
				'tmp_name' => $tmp,
			];

			$attachment_id = media_handle_sideload( $file, $post_id, $title ? (string) $title : null );
			if ( is_wp_error( $attachment_id ) ) {
				@unlink( $tmp ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged
				return [ 'error' => $attachment_id->get_error_message() ];
			}
		}

		if ( ! empty( $alt_text ) && wp_attachment_is_image( $attachment_id ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', sanitize_text_field( $alt_text ) );
		}

		return self::format_attachment_result( $attachment_id );
	}

	/**
	 * @return array{id:int,url:string,width:int,height:int,mime:string,filesize:int,media_type:string}
	 */
	private static function format_attachment_result( int $attachment_id ): array {
		$metadata = wp_get_attachment_metadata( $attachment_id );
		if ( ! is_array( $metadata ) ) {
			$metadata = [];
		}

		$mime = (string) get_post_mime_type( $attachment_id );
		$file = get_attached_file( $attachment_id );

		$width  = isset( $metadata['width'] ) ? (int) $metadata['width'] : 0;
		$height = isset( $metadata['height'] ) ? (int) $metadata['height'] : 0;
		if ( 0 === $width && ! empty( $metadata['sizes']['full']['width'] ) ) {
			$width = (int) $metadata['sizes']['full']['width'];
		}
		if ( 0 === $height && ! empty( $metadata['sizes']['full']['height'] ) ) {
			$height = (int) $metadata['sizes']['full']['height'];
		}

		$filesize = 0;
		if ( ! empty( $metadata['filesize'] ) ) {
			$filesize = (int) $metadata['filesize'];
		} elseif ( $file && file_exists( $file ) ) {
			$filesize = (int) filesize( $file );
		}

		$media_type = 'file';
		if ( 0 === strpos( $mime, 'image/' ) ) {
			$media_type = 'image';
		} elseif ( 0 === strpos( $mime, 'video/' ) ) {
			$media_type = 'video';
		}

		return [
			'id'         => $attachment_id,
			'url'        => (string) wp_get_attachment_url( $attachment_id ),
			'width'      => $width,
			'height'     => $height,
			'mime'       => $mime,
			'filesize'   => $filesize,
			'media_type' => $media_type,
		];
	}

	private static function filename_from_url( string $url ): string {
		$path = (string) wp_parse_url( $url, PHP_URL_PATH );
		$name = $path ? basename( $path ) : '';
		$name = rawurldecode( $name );
		if ( '' === $name || false === strpos( $name, '.' ) ) {
			$name = 'media-upload.bin';
		}
		return sanitize_file_name( $name );
	}

	private static function extension_from_name( string $name ): string {
		$ext = strtolower( pathinfo( $name, PATHINFO_EXTENSION ) );
		return is_string( $ext ) ? $ext : '';
	}

	/**
	 * @return string|null Error message or null if OK.
	 */
	private static function validate_filename_extension( string $filename ): ?string {
		$ext = self::extension_from_name( $filename );
		if ( '' === $ext || ! in_array( $ext, self::allowed_extensions(), true ) ) {
			return 'Unsupported file type ".' . $ext . '". Allowed: ' . implode( ', ', self::allowed_extensions() ) . '.';
		}
		return null;
	}

	/**
	 * @return string|null Error message or null if OK.
	 */
	private static function validate_url_extension( string $url ): ?string {
		$path = (string) wp_parse_url( $url, PHP_URL_PATH );
		$name = $path ? basename( $path ) : '';
		$ext  = self::extension_from_name( rawurldecode( $name ) );
		if ( '' === $ext || ! in_array( $ext, self::allowed_extensions(), true ) ) {
			return 'URL must end with an allowed extension (.' . implode( ', .', self::allowed_extensions() ) . ') before any query string. Got: ' . ( $ext ? ( '.' . $ext ) : '(none)' );
		}
		return null;
	}
}
