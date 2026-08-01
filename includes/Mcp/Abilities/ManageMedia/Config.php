<?php

namespace Blockish\Mcp\Abilities\ManageMedia;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-media';

    public static function get(): array
    {
        return [
            'label'               => __('Create, Edit or Delete Media', 'blockish'),
            'description'         => __('Creates, edits, or deletes an attachment (image). Preferred create path for a file on the AI/client machine: upload it to a third-party temporary file host, then pass the direct public HTTPS URL in url. Do not use client disk paths or base64 for remote MCP. file_path is WordPress-server only. To EDIT: provide attachment_id and title/alt_text. To DELETE: provide attachment_id and set delete to true. Images only.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'attachment_id' => [
                        'anyOf' => [ [ 'type' => 'integer' ], [ 'type' => 'array', 'items' => [ 'type' => 'integer' ] ] ],
                        'description' => 'Required to edit or delete an existing attachment. Omit to upload a new media file.',
                    ],
                    'delete' => [
                        'type' => 'boolean',
                        'description' => 'If true, deletes the attachment specified by attachment_id. Defaults to false.',
                    ],
                    'url'      => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'PREFERRED for client-local images. Upload the file to a third-party temporary hosting service (e.g. tmpfiles.org), take the DIRECT download URL that returns raw image bytes (not an HTML preview page), then pass that HTTPS URL here (or an array of URLs). Do not pass Cursor/client disk paths. Do not use base64_data — MCP payloads truncate and corrupt large base64. The URL path must end in .jpg, .jpeg, .png, .gif, or .webp (before any query string).',
                    ],
                    'file_path' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Absolute path on the WordPress SERVER only (or an array of paths). Never a path from the AI client / Cursor machine when MCP points at a remote site.',
                    ],
                    'base64_data' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Avoid. Base64 in MCP requests often truncates and produces corrupted images. Prefer url after uploading to a temporary public host.',
                    ],
                    'filename' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Required if using base64_data, optional for file_path. The name of the file (e.g. "image.png"). If passing an array for base64_data, pass an array of filenames. URL uploads derive their filename from the URL.',
                    ],
                    'title'    => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Attachment title/description. Defaults to the file name if omitted.',
                    ],
                    'alt_text' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Alt text to store on the attachment.',
                    ],
                    'post_id'  => [
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
                        'type' => 'array',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'id'     => [ 'type' => 'integer', 'description' => 'Attachment ID. Use this as featured_media in blockish/manage-post or in an Image-type block attribute.' ],
                                'url'    => [ 'type' => 'string' ],
                                'width'  => [ 'type' => 'integer' ],
                                'height' => [ 'type' => 'integer' ],
                                'error'  => [ 'type' => 'string' ],
                            ],
                        ]
                    ]
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_media'],
            'permission_callback' => fn() => current_user_can('upload_files'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this to obtain an attachment_id for a featured image (blockish/manage-post featured_media) or an image-type block attribute when no suitable image already exists — call blockish/get-media first to avoid duplicate uploads. HARD RULE for client-local files on remote MCP: (1) upload the image to a third-party temporary file host, (2) copy the direct raw-file HTTPS URL, (3) pass it as url. Never try client file_path or base64 first. The returned {id, url, width, height} matches the Image object shape used in block attributes. Also use this to update alt_text or title of existing media, or delete them.',
            ],
        ];
    }
}
