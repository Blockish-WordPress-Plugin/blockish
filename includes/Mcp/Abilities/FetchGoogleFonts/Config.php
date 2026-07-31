<?php

namespace Blockish\Mcp\Abilities\FetchGoogleFonts;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/fetch-google-fonts';

    public static function get(): array
    {
        return [
            'label'               => __('Fetch Google Fonts', 'blockish'),
            'description'         => __('Fetches exact font face data from the official WordPress Google Fonts collection. Use this to prepare valid payloads for manage-fonts.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'name' => [
                        'type' => 'string',
                        'description' => 'The Google Font family name (e.g., "Outfit", "Inter").'
                    ],
                    'variants' => [
                        'type' => 'array',
                        'description' => 'Optional list of font weights/styles to extract (e.g., ["400", "700"]). If empty, returns all variants.',
                        'items' => [
                            'type' => 'string'
                        ]
                    ]
                ],
                'required' => ['name']
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'actions' => ['type' => 'array', 'items' => ['type' => 'string']],
                    'name' => ['type' => 'string'],
                    'slug' => ['type' => 'string'],
                    'fontFamily' => ['type' => 'string'],
                    'fontFace' => ['type' => 'array', 'items' => ['type' => 'object']]
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'fetch_font'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'This tool queries the official WordPress Google Fonts JSON. It returns a payload fully compatible with the blockish-manage-fonts tool. You can pass the output of this tool directly as the input to blockish-manage-fonts.'
            ],
        ];
    }
}
