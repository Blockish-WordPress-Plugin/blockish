<?php

namespace Blockish\Mcp\Abilities\GetFonts;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-fonts';

    public static function get(): array
    {
        return [
            'label'               => __('Get Fonts', 'blockish'),
            'description'         => __('Fetches all installed fonts (Font Families and Font Faces) along with theme-provided fonts from global styles.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'theme_fonts' => [
                        'type' => 'array',
                        'description' => 'Fonts provided by the active theme',
                        'items' => ['type' => 'object']
                    ],
                    'installed_fonts' => [
                        'type' => 'array',
                        'description' => 'Fonts installed via the WordPress Font Library (wp_font_family)',
                        'items' => ['type' => 'object']
                    ]
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_fonts'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this to see what fonts are currently available in the site. Returns both theme-provided fonts and manually installed fonts. Note: To verify if a font is active or deactivated, cross-reference this tool with blockish-get-theme-json-docs. If a font is in `installed_fonts` here but NOT in the active theme.json custom fontFamilies, it means the font is currently DEACTIVATED. If it is in both, it is ACTIVE.',
            ],
        ];
    }
}
