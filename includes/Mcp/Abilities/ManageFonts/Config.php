<?php

namespace Blockish\Mcp\Abilities\ManageFonts;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-fonts';

    public static function get(): array
    {
        return [
            'label'               => __('Manage Fonts', 'blockish'),
            'description'         => __('Installs or deletes custom fonts in the WordPress Font Library.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type' => 'string',
                        'enum' => ['install', 'delete'],
                        'description' => 'Action to perform: install or delete.'
                    ],
                    'font_family_id' => [
                        'type' => 'integer',
                        'description' => 'Required for delete. The ID of the wp_font_family post to delete.'
                    ],
                    'name' => [
                        'type' => 'string',
                        'description' => 'Required for install. The name of the font family (e.g. "Roboto").'
                    ],
                    'slug' => [
                        'type' => 'string',
                        'description' => 'Optional. Slug for the font family. Auto-generated if not provided.'
                    ],
                    'fontFamily' => [
                        'type' => 'string',
                        'description' => 'Required for install. The CSS font-family stack (e.g. "Roboto, sans-serif").'
                    ],
                    'fontFace' => [
                        'type' => 'array',
                        'description' => 'Required for install. Array of font face configurations.',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'src' => [
                                    'type' => 'string',
                                    'description' => 'Direct URL to the font file (.woff2, .ttf, etc) to be downloaded and installed.'
                                ],
                                'fontWeight' => [
                                    'type' => 'string',
                                    'description' => 'CSS font-weight value (e.g. "400", "400 700").'
                                ],
                                'fontStyle' => [
                                    'type' => 'string',
                                    'description' => 'CSS font-style value (e.g. "normal", "italic").'
                                ],
                                'fontStretch' => [
                                    'type' => 'string',
                                    'description' => 'Optional CSS font-stretch value.'
                                ]
                            ],
                            'required' => ['src', 'fontWeight', 'fontStyle']
                        ]
                    ]
                ],
                'required' => ['action']
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'id' => [ 'type' => 'integer' ],
                    'message' => [ 'type' => 'string' ]
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_fonts'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this to install new fonts. You must provide a direct URL to the font file in the src parameter of each fontFace. WordPress will download the font file and save it locally. CRITICAL: If a font is already installed (exists in blockish-get-fonts installed_fonts) but is just deactivated from the UI, do NOT use this tool to install it again, as it will create duplicates. Instead, use blockish-manage-theme-json to add the existing font back to the wp_global_styles custom fontFamilies array.',
            ],
        ];
    }
}
