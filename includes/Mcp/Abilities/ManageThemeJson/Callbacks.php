<?php

namespace Blockish\Mcp\Abilities\ManageThemeJson;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle($input): array
    {
        $delete     = $input['delete'] ?? false;
        $theme_json = $input['theme_json'] ?? null;

        $post_name = 'wp-global-styles-' . urlencode(wp_get_theme()->get_stylesheet());
        $args      = [
            'post_type'              => 'wp_global_styles',
            'name'                   => $post_name,
            'posts_per_page'         => 1,
            'no_found_rows'          => true,
            'ignore_sticky_posts'    => true,
            'update_post_term_cache' => false,
            'update_post_meta_cache' => false,
            'tax_query'              => [
                [
                    'taxonomy' => 'wp_theme',
                    'field'    => 'name',
                    'terms'    => wp_get_theme()->get_stylesheet(),
                ],
            ],
        ];
        $query = new \WP_Query($args);
        $post  = !empty($query->posts) ? $query->posts[0] : null;

        if ($delete) {
            if ($post) {
                wp_delete_post($post->ID, true);
                if (function_exists('wp_clean_theme_json_cache')) {
                    wp_clean_theme_json_cache();
                }
                if (class_exists('\WP_Theme_JSON_Resolver')) {
                    \WP_Theme_JSON_Resolver::clean_cached_data();
                }
            }
            return [
                'action' => 'deleted',
            ];
        }

        if (empty($theme_json) || !is_array($theme_json)) {
            return ['error' => 'theme_json must be an object.'];
        }

        $current_data = [];
        if ($post) {
            $decoded = json_decode($post->post_content, true);
            if (is_array($decoded) && !empty($decoded['isGlobalStylesUserThemeJSON'])) {
                unset($decoded['isGlobalStylesUserThemeJSON']);
                $current_data = $decoded;
            } elseif (is_array($decoded)) {
                $current_data = $decoded;
            }
        }

        if (class_exists('\WP_Theme_JSON')) {
            $current_theme_json = new \WP_Theme_JSON($current_data, 'custom');
            $new_theme_json_obj = new \WP_Theme_JSON($theme_json, 'custom');
            $current_theme_json->merge($new_theme_json_obj);
            $final_data = $current_theme_json->get_raw_data();
        } else {
            $final_data = array_replace_recursive($current_data, $theme_json);
        }

        // Ensure flags required by WP Core
        $final_data['isGlobalStylesUserThemeJSON'] = true;
        if (!isset($final_data['version'])) {
            $final_data['version'] = 3;
        }

        $post_content = wp_slash(wp_json_encode($final_data));

        if ($post) {
            wp_update_post([
                'ID'           => $post->ID,
                'post_content' => $post_content,
            ]);
        } else {
            $post_id = wp_insert_post([
                'post_type'    => 'wp_global_styles',
                'post_name'    => $post_name,
                'post_title'   => 'Custom Styles',
                'post_status'  => 'publish',
                'post_content' => $post_content,
            ]);
            wp_set_post_terms($post_id, wp_get_theme()->get_stylesheet(), 'wp_theme');
        }

        if (function_exists('wp_clean_theme_json_cache')) {
            wp_clean_theme_json_cache();
        }
        if (class_exists('\WP_Theme_JSON_Resolver')) {
            \WP_Theme_JSON_Resolver::clean_cached_data();
        }

        return [
            'action'   => 'updated',
            'edit_url' => admin_url('site-editor.php?canvas=edit'),
        ];
    }
}
