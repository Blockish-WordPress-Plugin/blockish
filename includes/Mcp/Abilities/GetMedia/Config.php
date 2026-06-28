<?php

namespace Blockish\Mcp\Abilities\GetMedia;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-media';

    public static function get(): array
    {
        return [
            'label'               => __('Get Media', 'blockish'),
            'description'         => __('Lists existing items in the WordPress Media Library, filterable by search, mime_type and pagination.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'search'    => [ 'type' => 'string',  'description' => 'Search term matched against title/filename.' ],
                    'mime_type' => [ 'type' => 'string',  'description' => 'Filter by MIME type prefix, e.g. "image" or "image/png". Defaults to "image".' ],
                    'number'    => [ 'type' => 'integer', 'description' => 'Max items to return. Defaults to 20.' ],
                    'page'      => [ 'type' => 'integer', 'description' => 'Page number for pagination. Defaults to 1.' ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'items' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'        => [ 'type' => 'integer' ],
                                'title'     => [ 'type' => 'string' ],
                                'url'       => [ 'type' => 'string' ],
                                'alt'       => [ 'type' => 'string' ],
                                'width'     => [ 'type' => 'integer' ],
                                'height'    => [ 'type' => 'integer' ],
                                'mime_type' => [ 'type' => 'string' ],
                                'date'      => [ 'type' => 'string' ],
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_media'],
            'permission_callback' => fn() => current_user_can('upload_files'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Always call this before blockish/upload-media to check whether a suitable image already exists and avoid uploading duplicates of the same image.',
            ],
        ];
    }
}
