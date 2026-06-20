<?php

namespace Blockish\Mcp\Abilities\UploadMedia;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/upload-media';

    public static function get(): array
    {
        return [
            'label'               => __('Upload Media', 'blockish'),
            'description'         => __('Downloads an image from a public URL and adds it to the WordPress Media Library as a new attachment. Use this when you need an attachment_id for a featured image or a block image attribute and no suitable image already exists (check blockish/get-media first to avoid duplicate uploads).

The URL must be publicly reachable and end with a recognized image extension (jpg, jpeg, png, gif, webp) before any query string. This ability only handles images — it cannot upload video or other file types.

Returns an attachment_id plus the resulting WordPress URL, width and height — the same shape as the "Image" object used in block attributes (see blockish/get-block-docs), so you can plug the result almost directly into an image-type block attribute.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'url'      => [
                        'type'        => 'string',
                        'description' => 'Public URL of the image to download. Must end in .jpg, .jpeg, .png, .gif, or .webp (before any query string).',
                    ],
                    'title'    => [
                        'type'        => 'string',
                        'description' => 'Attachment title/description. Defaults to the file name if omitted.',
                    ],
                    'alt_text' => [
                        'type'        => 'string',
                        'description' => 'Alt text to store on the attachment.',
                    ],
                    'post_id'  => [
                        'type'        => 'integer',
                        'description' => 'Optional. Post ID to attach this media item to as a child/parent association.',
                    ],
                ],
                'required'   => [ 'url' ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'id'     => [ 'type' => 'integer', 'description' => 'Attachment ID. Use this as featured_media in blockish/manage-post or in an Image-type block attribute.' ],
                    'url'    => [ 'type' => 'string' ],
                    'width'  => [ 'type' => 'integer' ],
                    'height' => [ 'type' => 'integer' ],
                    'error'  => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'upload_media'],
            'permission_callback' => fn() => current_user_can('upload_files'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
