<?php

namespace Blockish\Mcp\Abilities\GetThemeJsonDocs;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle($input): array
    {
        if (!class_exists('\WP_Theme_JSON_Resolver')) {
            return ['error' => 'WP_Theme_JSON_Resolver class not found.'];
        }

        $theme_data = \WP_Theme_JSON_Resolver::get_merged_data('theme')->get_raw_data();

        // Optional: filter out overly huge properties if needed, but returning full is fine.
        return [
            'theme_json' => $theme_data,
        ];
    }
}
