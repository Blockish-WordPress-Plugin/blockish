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
            'description'         => __('Installs, updates, activates, deactivates, or deletes custom fonts in the WordPress Font Library and Global Styles.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'actions' => [
                        'type' => 'array',
                        'description' => 'List of actions to perform sequentially (e.g. ["install", "activate"]).',
                        'items' => [
                            'type' => 'string',
                            'enum' => ['install', 'update', 'delete', 'activate', 'deactivate']
                        ]
                    ],
                    'action' => [
                        'type' => 'string',
                        'enum' => ['install', 'update', 'delete', 'activate', 'deactivate'],
                        'description' => 'Single action to perform (legacy, use actions instead).'
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
                // neither is strictly required by JSON schema since we accept either, but we check in PHP.
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
                'usage_notes' => "Use this to manage fonts. You can pass an array of `actions` to run sequentially (e.g., [\"install\", \"activate\"]). Action `install` downloads the font and creates the posts. Action `activate` adds it to the theme.json custom fontFamilies array. Action `deactivate` removes it from theme.json without deleting files. Action `delete` permanently deletes the posts and files. Note: 'install' alone NO LONGER activates the font; you must explicitly pass 'activate' as well if you want it applied to the site immediately. IMPORTANT: NEVER manually guess the `src` or `fontFace` data when installing a Google Font. You MUST first use the `blockish-fetch-google-fonts` tool to get the accurate variation data and source URLs directly from WordPress, and then pass its exact output as the payload here.",
            ],
        ];
    }
}
