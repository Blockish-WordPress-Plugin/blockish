<?php

namespace Blockish\Mcp\Abilities\ManageThemeJson;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle($input): array
    {
        $delete     = $input['delete'] ?? false;
        $theme_json = $input['theme_json'] ?? null;

        $args      = [
            'post_type'              => 'wp_global_styles',
            'posts_per_page'         => 1,
            'post_status'            => 'publish',
            'ignore_sticky_posts'    => true,
            'no_found_rows'          => true,
            'order'                  => 'DESC',
            'orderby'                => 'date',
            'update_post_term_cache' => false,
            'update_post_meta_cache' => false,
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
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
            if ($post && ! current_user_can( 'edit_theme_options' ) ) {
                return [ 'error' => 'You do not have access to edit theme options.' ];
            }
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

        if (!empty($input['reset'])) {
            $custom_fonts = $current_data['settings']['typography']['fontFamilies']['custom'] ?? [];
            $final_data = [
                'settings' => [
                    'typography' => [
                        'fontFamilies' => [
                            'custom' => $custom_fonts
                        ]
                    ]
                ]
            ];
        } else {
            if (empty($theme_json) || !is_array($theme_json)) {
                return ['error' => 'theme_json must be an object.'];
            }
            $validate_error = self::validate_theme_json_payload($theme_json);
            if ($validate_error) {
                return ['error' => $validate_error];
            }
            $theme_json = self::normalize_preset_origins($theme_json);
            $final_data = array_replace_recursive($current_data, $theme_json);
            $final_data = self::replace_preset_leaves($final_data, $theme_json);
            $final_data = self::strip_invalid_preset_origins($final_data);
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
                'post_name'    => 'wp-global-styles-' . urlencode(wp_get_theme()->get_stylesheet()),
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

    /**
     * Light validation: object with known top-level keys; settings/styles must be objects when present.
     */
    private static function validate_theme_json_payload(array $theme_json): ?string
    {
        $allowed = [
            'version',
            'settings',
            'styles',
            'title',
            'slug',
            'isGlobalStylesUserThemeJSON',
        ];

        foreach (array_keys($theme_json) as $key) {
            if (!in_array($key, $allowed, true)) {
                return 'theme_json has unsupported top-level key "' . $key . '". Allowed: version, settings, styles, title, slug.';
            }
        }

        if (isset($theme_json['settings']) && !is_array($theme_json['settings'])) {
            return 'theme_json.settings must be an object.';
        }
        if (isset($theme_json['styles']) && !is_array($theme_json['styles'])) {
            return 'theme_json.styles must be an object.';
        }
        if (isset($theme_json['version']) && !is_numeric($theme_json['version'])) {
            return 'theme_json.version must be a number.';
        }

        // Deep validation for styles (AI often mistakenly passes objects instead of strings for values)
        if (isset($theme_json['styles'])) {
            $check_style_primitives = function($styles, $path = 'styles', $is_container = false) use (&$check_style_primitives) {
                foreach ($styles as $k => $v) {
                    // Pseudo-selector keys (:hover, :focus, …) nest a full style object.
                    $is_pseudo  = is_string($k) && 0 === strpos($k, ':');
                    $is_section = $is_pseudo || in_array($k, ['elements', 'blocks', 'color', 'typography', 'spacing', 'border', 'outline', 'dimensions', 'filter'], true);
                    if ($is_section || $is_container) {
                        if (!is_array($v)) return "$path.$k must be an object.";
                        // Elements and blocks contain arbitrary block/element names which act as containers
                        $child_is_container = in_array($k, ['elements', 'blocks'], true);
                        $res = $check_style_primitives($v, "$path.$k", $child_is_container);
                        if ($res) return $res;
                    } elseif (is_array($v) && !isset($v['top']) && !isset($v['bottom']) && !isset($v['left']) && !isset($v['right']) && $k !== 'css') {
                        // e.g. styles.color.text should be a string, not an object. (padding/margin have top/bottom objects)
                        return "$path.$k should be a primitive string, not an object.";
                    }
                }
                return null;
            };
            $style_err = $check_style_primitives($theme_json['styles']);
            if ($style_err) return $style_err;
        }

        // Deep validation for preset arrays (palette, fontFamilies)
        if (isset($theme_json['settings'])) {
            $check_presets = function($path_keys, $required_item_keys) use ($theme_json) {
                $curr = $theme_json['settings'];
                foreach ($path_keys as $k) {
                    if (!isset($curr[$k])) return null;
                    $curr = $curr[$k];
                }
                
                // If it's an object with origins (theme/custom)
                $lists_to_check = [];
                if (is_array($curr) && !isset($curr[0])) {
                    if (isset($curr['theme'])) $lists_to_check[] = $curr['theme'];
                    if (isset($curr['custom'])) $lists_to_check[] = $curr['custom'];
                } elseif (is_array($curr) && isset($curr[0])) {
                    $lists_to_check[] = $curr; // flat array
                }

                foreach ($lists_to_check as $list) {
                    if (!is_array($list)) return implode('.', array_merge(['settings'], $path_keys)) . " must contain arrays.";
                    foreach ($list as $item) {
                        if (!is_array($item)) return implode('.', array_merge(['settings'], $path_keys)) . " items must be objects.";
                        foreach ($required_item_keys as $req) {
                            if (!isset($item[$req])) {
                                return implode('.', array_merge(['settings'], $path_keys)) . " items MUST have '$req' key.";
                            }
                        }
                    }
                }
                return null;
            };

            $err = $check_presets(['color', 'palette'], ['color', 'slug']);
            if ($err) return $err;

            $err = $check_presets(['typography', 'fontFamilies'], ['fontFamily', 'slug']);
            if ($err) return $err;
        }

        if (!isset($theme_json['settings']) && !isset($theme_json['styles']) && empty($theme_json['reset'])) {
            // Allow empty merge objects only if at least one known section — empty object already rejected upstream.
            // Partial updates may send only settings or only styles.
        }

        return null;
    }

    /**
     * User global styles store presets under origin keys (theme/custom/default/blocks).
     * Flat arrays from agents must be wrapped under "theme" or array_replace_recursive
     * leaves numeric keys that trigger WP_Theme_JSON "Undefined array key slug" warnings.
     */
    private static function normalize_preset_origins(array $theme_json): array
    {
        foreach (self::preset_paths() as $path) {
            $value = self::array_get($theme_json, $path);
            if (!is_array($value) || self::is_list($value)) {
                if (is_array($value) && self::is_list($value)) {
                    self::array_set($theme_json, $path, ['theme' => $value]);
                }
                continue;
            }
        }

        return $theme_json;
    }

    private static function replace_preset_leaves(array $final_data, array $incoming): array
    {
        $origins = ['default', 'blocks', 'theme', 'custom'];
        
        foreach (self::preset_paths() as $path) {
            $value = self::array_get($incoming, $path);
            if (!is_array($value)) {
                continue;
            }
            
            $has_origin = false;
            foreach ($origins as $origin) {
                if (isset($value[$origin])) {
                    $has_origin = true;
                    $current = self::array_get($final_data, $path) ?: [];
                    if (!is_array($current)) {
                        $current = [];
                    }
                    $current[$origin] = $value[$origin];
                    self::array_set($final_data, $path, $current);
                }
            }
            
            if (!$has_origin) {
                self::array_set($final_data, $path, $value);
            }
        }

        return $final_data;
    }

    private static function strip_invalid_preset_origins(array $theme_json): array
    {
        $valid = ['default', 'blocks', 'theme', 'custom'];

        foreach (self::preset_paths() as $path) {
            $value = self::array_get($theme_json, $path);
            if (!is_array($value) || self::is_list($value)) {
                continue;
            }

            $clean = [];
            foreach ($value as $origin => $presets) {
                if (!in_array((string) $origin, $valid, true) || !is_array($presets)) {
                    continue;
                }
                $clean[$origin] = array_values(array_filter($presets, static function ($preset) {
                    return is_array($preset) && !empty($preset['slug']);
                }));
            }
            self::array_set($theme_json, $path, $clean);
        }

        return $theme_json;
    }

    private static function preset_paths(): array
    {
        return [
            ['settings', 'color', 'palette'],
            ['settings', 'color', 'gradients'],
            ['settings', 'color', 'duotone'],
            ['settings', 'typography', 'fontSizes'],
            ['settings', 'typography', 'fontFamilies'],
            ['settings', 'spacing', 'spacingSizes'],
            ['settings', 'shadow', 'presets'],
        ];
    }

    private static function is_list(array $value): bool
    {
        if (function_exists('array_is_list')) {
            $fn = 'array_is_list';
            return $fn($value);
        }

        return array_keys($value) === range(0, count($value) - 1);
    }

    private static function array_get(array $data, array $path)
    {
        $current = $data;
        foreach ($path as $key) {
            if (!is_array($current) || !array_key_exists($key, $current)) {
                return null;
            }
            $current = $current[$key];
        }

        return $current;
    }

    private static function array_set(array &$data, array $path, $value): void
    {
        $current = &$data;
        $last    = array_pop($path);
        foreach ($path as $key) {
            if (!isset($current[$key]) || !is_array($current[$key])) {
                $current[$key] = [];
            }
            $current = &$current[$key];
        }
        $current[$last] = $value;
    }
}
