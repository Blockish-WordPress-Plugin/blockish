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

        $schema_data = null;
        $theme_json_path = get_stylesheet_directory() . '/theme.json';
        if (file_exists($theme_json_path)) {
            $raw = file_get_contents($theme_json_path);
            $decoded = json_decode($raw, true);
            if (isset($decoded['$schema'])) {
                $schema_url = $decoded['$schema'];
                // Check transient first
                $cached = get_transient('blockish_theme_json_schema');
                if ($cached) {
                    $schema_data = $cached;
                } else {
                    $response = wp_remote_get($schema_url);
                    if (!is_wp_error($response)) {
                        $schema_data = json_decode(wp_remote_retrieve_body($response), true);
                        if ($schema_data) {
                            set_transient('blockish_theme_json_schema', $schema_data, WEEK_IN_SECONDS);
                        }
                    }
                }
            }
        }

        return [
            'theme_json' => $theme_data,
            'schema'     => $schema_data
        ];
    }
}
