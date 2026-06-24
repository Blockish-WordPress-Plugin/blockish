<?php

namespace Blockish\Mcp\Abilities\SiteInfo;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-site-info';

    public static function get(): array
    {
        return [
            'label'               => __('Get Site Info', 'blockish'),
            'description'         => __('Returns WordPress site name, description, URL and version.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'name'        => ['type' => 'string'],
                    'description' => ['type' => 'string'],
                    'url'         => ['type' => 'string'],
                    'wp_version'  => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_site_info'],
            'permission_callback' => fn() => current_user_can('read'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
