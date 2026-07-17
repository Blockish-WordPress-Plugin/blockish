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
            'description'         => __('Creates, edits, or deletes an attachment (image). To CREATE: provide url, file_path, or base64_data. To EDIT: provide attachment_id and title/alt_text. To DELETE: provide attachment_id and set delete to true. Images only.', 'blockish'),
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
                        'description' => 'Public URL of the image to download, or an array of URLs for batch processing. Must end in .jpg, .jpeg, .png, .gif, or .webp (before any query string).',
                    ],
                    'file_path' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Absolute path to a local file on the server, or an array of paths.',
                    ],
                    'base64_data' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Base64 encoded string of the image data, or array of strings.',
                    ],
                    'filename' => [
                        'anyOf' => [ [ 'type' => 'string' ], [ 'type' => 'array', 'items' => [ 'type' => 'string' ] ] ],
                        'description' => 'Required if using base64_data, optional for file_path. The name of the file (e.g. "image.png"). If passing an array for base64_data, pass an array of filenames.',
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
                'usage_notes' => 'Use this to obtain an attachment_id for a featured image (blockish/manage-post featured_media) or an image-type block attribute when no suitable image already exists — call blockish/get-media first to avoid duplicate uploads. The returned {id, url, width, height} matches the Image object shape used in block attributes, so it can be plugged almost directly into an image-type attribute. Also use this to update alt_text or title of existing media, or delete them.',
            ],
        ];
    }
}
