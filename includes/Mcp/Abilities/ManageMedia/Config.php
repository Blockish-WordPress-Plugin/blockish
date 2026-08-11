<?php

namespace Blockish\Mcp\Abilities\ManageMedia;

defined( 'ABSPATH' ) || exit;

class Config
{
	const NAME = 'blockish/manage-media';

	public static function get(): array {
		return [
			'label'               => __( 'Create, Edit or Delete Media', 'blockish' ),
			'description'         => __( 'Creates, edits, or deletes a media attachment (images and common videos). Preferred create path for a file on the AI/client machine: upload it to a third-party temporary file host, then pass the direct public HTTPS URL in url. Do not use client disk paths or base64 for remote MCP. file_path is WordPress-server only. To EDIT: provide attachment_id and title/alt_text (alt_text for images). To DELETE: provide attachment_id and set delete to true. Allowed: jpg/jpeg/png/gif/webp + mp4/webm/mov.', 'blockish' ),
			'category'            => 'blockish',
			'input_schema'        => [
				'type'       => 'object',
				'properties' => [
					'attachment_id' => [
						'anyOf'       => [
							[ 'type' => 'integer' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'integer' ] ],
						],
						'description' => 'Required to edit or delete an existing attachment. Omit to upload a new media file.',
					],
					'delete'        => [
						'type'        => 'boolean',
						'description' => 'If true, deletes the attachment specified by attachment_id. Defaults to false.',
					],
					'url'           => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'PREFERRED for client-local files. Upload to a temporary host, take the DIRECT raw-bytes HTTPS URL (not an HTML page), then pass it here (or an array). Do not pass Cursor/client disk paths. Avoid base64_data for large files (especially video). URL path must end in .jpg, .jpeg, .png, .gif, .webp, .mp4, .webm, or .mov (before any query string).',
					],
					'file_path'     => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'Absolute path on the WordPress SERVER only (or an array of paths). Never a path from the AI client / Cursor machine when MCP points at a remote site.',
					],
					'base64_data'   => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'Avoid. Base64 in MCP requests often truncates — especially for video. Prefer url after uploading to a temporary public host. Images only if you must; do not base64 large videos.',
					],
					'filename'      => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'Required if using base64_data, optional for file_path. Include extension (e.g. "hero.mp4", "photo.png"). URL uploads derive filename from the URL.',
					],
					'title'         => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'Attachment title. Defaults to the file name if omitted.',
					],
					'alt_text'      => [
						'anyOf'       => [
							[ 'type' => 'string' ],
							[ 'type' => 'array', 'items' => [ 'type' => 'string' ] ],
						],
						'description' => 'Alt text stored on image attachments only (ignored for video).',
					],
					'post_id'       => [
						'type'        => 'integer',
						'description' => 'Optional. Post ID to attach this media item to as a child/parent association.',
					],
				],
				'required'   => [],
			],
			'output_schema'       => [
				'type'       => 'object',
				'properties' => [
					'items' => [
						'type'  => 'array',
						'items' => [
							'type'       => 'object',
							'properties' => [
								'id'         => [ 'type' => 'integer', 'description' => 'Attachment ID for featured_media, Image attrs, or Video media attrs.' ],
								'url'        => [ 'type' => 'string' ],
								'width'      => [ 'type' => 'integer', 'description' => 'Pixel width when available (images; video if WP metadata has it).' ],
								'height'     => [ 'type' => 'integer' ],
								'mime'       => [ 'type' => 'string', 'description' => 'e.g. image/png or video/mp4.' ],
								'filesize'   => [ 'type' => 'integer' ],
								'media_type' => [ 'type' => 'string', 'description' => 'image | video | file' ],
								'error'      => [ 'type' => 'string' ],
							],
						],
					],
				],
			],
			'execute_callback'    => [ Callbacks::class, 'manage_media' ],
			'permission_callback' => fn() => current_user_can( 'upload_files' ),
			'meta'                => [
				'mcp'         => [ 'public' => true ],
				'usage_notes' => 'Call blockish/get-media first to reuse existing files. CREATE: prefer url (temp host → direct raw URL). Images: .jpg/.png/.gif/.webp. Video for blockish/video or container backgroundVideo: .mp4/.webm/.mov. file_path = WordPress server only. Avoid base64 for video. Returned {id,url,width,height,mime,media_type} — use id+url in Image/Video attrs. URL sideload uses media_handle_sideload (not image-only media_sideload_image).',
			],
		];
	}
}
