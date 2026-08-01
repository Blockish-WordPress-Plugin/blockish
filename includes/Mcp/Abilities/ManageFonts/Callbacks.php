<?php

namespace Blockish\Mcp\Abilities\ManageFonts;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_fonts(array $args): array
    {
        $actions = $args['actions'] ?? [];
        if (!is_array($actions) || empty($actions)) {
            // fallback to single action for backward compatibility
            if (!empty($args['action'])) {
                $actions = [$args['action']];
            }
        }

        if (empty($actions)) {
            throw new \Exception('No action(s) provided. Use "actions" array.');
        }

        $messages = [];
        $family_id = null;

        foreach ($actions as $action) {
            if ($action === 'install' || $action === 'update') {
                $result = self::install_font($args);
                $family_id = $result['id'];
                $messages[] = $result['message'];
            } elseif ($action === 'activate') {
                $result = self::activate_font($args, $family_id);
                $family_id = $result['id'];
                $messages[] = $result['message'];
            } elseif ($action === 'deactivate') {
                $result = self::deactivate_font($args, $family_id);
                $family_id = $result['id'];
                $messages[] = $result['message'];
            } elseif ($action === 'delete') {
                $result = self::delete_font($args, $family_id);
                $messages[] = $result['message'];
            } else {
                throw new \Exception(sprintf('Invalid action "%s".', $action));
            }
        }

        $output = [
            'message' => implode(' ', $messages)
        ];
        
        $final_id = $family_id ?? ($args['font_family_id'] ?? null);
        if ($final_id !== null) {
            $output['id'] = $final_id;
        }

        return $output;
    }

    private static function install_font(array $args): array
    {
        if (empty($args['name']) || empty($args['fontFamily']) || empty($args['fontFace'])) {
            throw new \Exception('Missing required fields for install: name, fontFamily, fontFace.');
        }

        $slug = $args['slug'] ?? sanitize_title($args['name']);

        // Check if already exists
        $existing = get_posts([
            'post_type' => 'wp_font_family',
            'name' => $slug,
            'posts_per_page' => 1,
            'post_status' => 'any'
        ]);

        require_once ABSPATH . 'wp-admin/includes/file.php';
        WP_Filesystem();
        global $wp_filesystem;

        if (!empty($existing)) {
            $family_id = $existing[0]->ID;

            // Map existing font faces to avoid duplicates and update them if needed
            $font_faces = get_posts([
                'post_type' => 'wp_font_face',
                'post_parent' => $family_id,
                'posts_per_page' => -1,
                'post_status' => 'any'
            ]);

            foreach ($font_faces as $face) {
                $face_data = json_decode($face->post_content, true);
                if (is_array($face_data) && isset($face_data['fontWeight']) && isset($face_data['fontStyle'])) {
                    $key = $face_data['fontWeight'] . '-' . $face_data['fontStyle'];
                    $existing_faces_map[$key] = [
                        'post_id' => $face->ID,
                        'src' => $face_data['src'] ?? ''
                    ];
                }
            }
        } else {
            // Create wp_font_family post
            $family_id = wp_insert_post([
                'post_type' => 'wp_font_family',
                'post_title' => sanitize_text_field($args['name']),
                'post_name' => $slug,
                'post_status' => 'publish',
                'post_content' => wp_slash(wp_json_encode([
                    'fontFamily' => $args['fontFamily'],
                    'preview' => ''
                ]))
            ]);

            if (is_wp_error($family_id)) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
                throw new \Exception('Failed to create font family: ' . $family_id->get_error_message());
            }
        }

        $installed_faces = 0;

        // Process font faces
        foreach ($args['fontFace'] as $face) {
            if (empty($face['src']) || empty($face['fontWeight']) || empty($face['fontStyle'])) {
                continue;
            }

            $src_url = $face['src'];
            
            // Generate a face slug based on attributes
            $face_slug = sanitize_title($slug . '-' . $face['fontWeight'] . '-' . $face['fontStyle']);

            // Download file
            $tmp_file = download_url($src_url);
            if (is_wp_error($tmp_file)) {
                // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
                throw new \Exception('Failed to download font file: ' . $tmp_file->get_error_message());
            }

            $wp_upload_dir = wp_upload_dir();
            $fonts_dir = $wp_upload_dir['basedir'] . '/fonts';
            $fonts_url = $wp_upload_dir['baseurl'] . '/fonts';

            if (!wp_mkdir_p($fonts_dir)) {
                wp_delete_file($tmp_file);
                continue;
            }

            $filename = basename(wp_parse_url($src_url, PHP_URL_PATH));
            // Sanitize filename
            $filename = sanitize_file_name($filename);
            
            $dest_file = $fonts_dir . '/' . $filename;
            
            // Ensure unique filename
            $i = 1;
            $info = pathinfo($dest_file);
            while (file_exists($dest_file)) {
                $dest_file = $info['dirname'] . '/' . $info['filename'] . '-' . $i . '.' . $info['extension'];
                $filename = $info['filename'] . '-' . $i . '.' . $info['extension'];
                $i++;
            }

            $wp_filesystem->copy($tmp_file, $dest_file);
            wp_delete_file($tmp_file);

            $local_src_url = $fonts_url . '/' . $filename;

            $face_content = [
                'src' => $local_src_url,
                'fontWeight' => $face['fontWeight'],
                'fontStyle' => $face['fontStyle'],
                'fontFamily' => $args['fontFamily'],
            ];

            if (!empty($face['fontStretch'])) {
                $face_content['fontStretch'] = $face['fontStretch'];
            }

            $face_title = $slug . ';' . $face['fontStyle'] . ';' . $face['fontWeight'] . ';100%;U+0-10FFFF';
            $key = $face['fontWeight'] . '-' . $face['fontStyle'];

            if (isset($existing_faces_map[$key])) {
                $existing_face = $existing_faces_map[$key];

                // Delete old font file
                if (!empty($existing_face['src'])) {
                    $old_src = $existing_face['src'];
                    $wp_upload_dir = wp_upload_dir();
                    if (str_starts_with($old_src, $wp_upload_dir['baseurl'])) {
                        $local_path = str_replace($wp_upload_dir['baseurl'], $wp_upload_dir['basedir'], $old_src);
                        if ($wp_filesystem->exists($local_path)) {
                            $wp_filesystem->delete($local_path);
                        }
                    }
                }

                // Update existing post
                wp_update_post([
                    'ID' => $existing_face['post_id'],
                    'post_title' => $face_title,
                    'post_name' => $face_slug,
                    'post_content' => wp_slash(wp_json_encode($face_content))
                ]);

                unset($existing_faces_map[$key]);
            } else {
                wp_insert_post([
                    'post_type' => 'wp_font_face',
                    'post_parent' => $family_id,
                    'post_title' => $face_title,
                    'post_name' => $face_slug,
                    'post_status' => 'publish',
                    'post_content' => wp_slash(wp_json_encode($face_content))
                ]);
            }

            $installed_faces++;
        }

        // Delete any existing faces that were not included in this install request
        foreach ($existing_faces_map as $old_face) {
            if (!empty($old_face['src'])) {
                $old_src = $old_face['src'];
                $wp_upload_dir = wp_upload_dir();
                if (str_starts_with($old_src, $wp_upload_dir['baseurl'])) {
                    $local_path = str_replace($wp_upload_dir['baseurl'], $wp_upload_dir['basedir'], $old_src);
                    if ($wp_filesystem->exists($local_path)) {
                        $wp_filesystem->delete($local_path);
                    }
                }
            }
            wp_delete_post($old_face['post_id'], true);
        }

        return [
            'id' => $family_id,
            'message' => sprintf('Successfully installed font family "%s" with %d font faces.', $args['name'], $installed_faces)
        ];
    }

    private static function activate_font(array $args, $chained_family_id = null): array
    {
        $family_id = $chained_family_id ?? ($args['font_family_id'] ?? null);
        
        if (!$family_id) {
            // Try to find it by slug if provided
            if (!empty($args['name'])) {
                $slug = $args['slug'] ?? sanitize_title($args['name']);
                $existing = get_posts([
                    'post_type' => 'wp_font_family',
                    'name' => $slug,
                    'posts_per_page' => 1,
                    'post_status' => 'any'
                ]);
                if (!empty($existing)) {
                    $family_id = $existing[0]->ID;
                }
            }
        }

        if (!$family_id) {
            throw new \Exception('font_family_id or valid name/slug is required for activate.');
        }

        $family = get_post($family_id);
        if (!$family || $family->post_type !== 'wp_font_family') {
            throw new \Exception('Invalid font family ID for activation.');
        }

        $content = json_decode($family->post_content, true);
        $fontFamily = $content['fontFamily'] ?? $family->post_title;
        $name = $family->post_title;
        $slug = $family->post_name;

        self::update_global_styles_font($slug, $name, $fontFamily, $family_id);

        return [
            'id' => $family_id,
            'message' => sprintf('Successfully activated font family "%s" in global styles.', $name)
        ];
    }

    private static function deactivate_font(array $args, $chained_family_id = null): array
    {
        $family_id = $chained_family_id ?? ($args['font_family_id'] ?? null);
        
        if (!$family_id) {
            if (!empty($args['name'])) {
                $slug = $args['slug'] ?? sanitize_title($args['name']);
                self::remove_global_styles_font($slug);
                return [
                    'id' => null,
                    'message' => sprintf('Successfully deactivated font family slug "%s".', $slug)
                ];
            }
            throw new \Exception('font_family_id or valid name is required for deactivate.');
        }

        $family = get_post($family_id);
        if (!$family || $family->post_type !== 'wp_font_family') {
            throw new \Exception('Invalid font family ID for deactivation.');
        }

        self::remove_global_styles_font($family->post_name);

        return [
            'id' => $family_id,
            'message' => sprintf('Successfully deactivated font family "%s" from global styles.', $family->post_title)
        ];
    }

    private static function delete_font(array $args, $chained_family_id = null): array
    {
        $family_id = $chained_family_id ?? ($args['font_family_id'] ?? null);
        if (!$family_id) {
            throw new \Exception('font_family_id is required for delete.');
        }
        $family = get_post($family_id);

        if (!$family || $family->post_type !== 'wp_font_family') {
            throw new \Exception('Invalid font family ID.');
        }

        // Delete font faces and their files
        $font_faces = get_posts([
            'post_type' => 'wp_font_face',
            'post_parent' => $family_id,
            'posts_per_page' => -1,
            'post_status' => 'any'
        ]);

        WP_Filesystem();
        global $wp_filesystem;

        foreach ($font_faces as $face) {
            $face_data = json_decode($face->post_content, true);
            if (!empty($face_data['src'])) {
                $src = $face_data['src'];
                // Only delete if it's in our uploads dir
                $wp_upload_dir = wp_upload_dir();
                if (str_starts_with($src, $wp_upload_dir['baseurl'])) {
                    $local_path = str_replace($wp_upload_dir['baseurl'], $wp_upload_dir['basedir'], $src);
                    if ($wp_filesystem->exists($local_path)) {
                        $wp_filesystem->delete($local_path);
                    }
                }
            }
            wp_delete_post($face->ID, true);
        }

        wp_delete_post($family_id, true);
        
        self::remove_global_styles_font($family->post_name);

        return [
            'id' => $family_id,
            'message' => 'Successfully deleted font family and associated files.'
        ];
    }

    private static function update_global_styles_font($slug, $name, $fontFamily, $family_id)
    {
        $new_font = [
            'id' => (int) $family_id,
            'name' => $name,
            'slug' => $slug,
            'fontFamily' => $fontFamily,
            'preview' => '',
            'fontFace' => [],
            'source' => 'custom'
        ];

        // Quick fetch of the newly created faces to get their correct local src
        $faces = get_posts([
            'post_type' => 'wp_font_face',
            'post_parent' => $family_id,
            'posts_per_page' => -1,
            'post_status' => 'publish'
        ]);

        foreach ($faces as $f) {
            $data = json_decode($f->post_content, true);
            if (!empty($data)) {
                $new_font['fontFace'][] = $data;
            }
        }

        $args = [
            'post_type' => 'wp_global_styles',
            'posts_per_page' => 1,
            'post_status' => 'publish',
            'ignore_sticky_posts' => true,
            'no_found_rows' => true,
            'order' => 'DESC',
            'orderby' => 'date',
            // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_tax_query
            'tax_query' => [
                [
                    'taxonomy' => 'wp_theme',
                    'field'    => 'name',
                    'terms'    => wp_get_theme()->get_stylesheet(),
                ],
            ],
        ];
        $query = new \WP_Query($args);
        $post = !empty($query->posts) ? $query->posts[0] : null;

        if ($post) {
            $data = json_decode($post->post_content, true);
            if (!isset($data['settings']['typography']['fontFamilies']['custom'])) {
                $data['settings']['typography']['fontFamilies']['custom'] = [];
            }
            
            // Avoid duplicates
            $filtered = array_filter($data['settings']['typography']['fontFamilies']['custom'], function($f) use ($slug) {
                return isset($f['slug']) && $f['slug'] !== $slug;
            });
            $filtered[] = $new_font;
            
            $data['settings']['typography']['fontFamilies']['custom'] = array_values($filtered);
            
            wp_update_post([
                'ID' => $post->ID,
                'post_content' => wp_slash(wp_json_encode($data))
            ]);
            
            if (function_exists('wp_clean_theme_json_cache')) wp_clean_theme_json_cache();
            if (class_exists('\WP_Theme_JSON_Resolver')) \WP_Theme_JSON_Resolver::clean_cached_data();
        }
    }

    private static function remove_global_styles_font($slug)
    {
        // For remove, it's slightly trickier because ManageThemeJson merges. 
        // We'd need to fetch current global styles, remove the item, and save.
        $post_name = 'wp-global-styles-' . urlencode(wp_get_theme()->get_stylesheet());
        $args = [
            'post_type' => 'wp_global_styles',
            'name' => $post_name,
            'posts_per_page' => 1,
            'post_status' => 'publish'
        ];
        $query = new \WP_Query($args);
        $post = !empty($query->posts) ? $query->posts[0] : null;

        if ($post) {
            $data = json_decode($post->post_content, true);
            if (isset($data['settings']['typography']['fontFamilies']['custom'])) {
                $custom_fonts = $data['settings']['typography']['fontFamilies']['custom'];
                $filtered = array_filter($custom_fonts, function($f) use ($slug) {
                    return isset($f['slug']) && $f['slug'] !== $slug;
                });
                $data['settings']['typography']['fontFamilies']['custom'] = array_values($filtered);
                wp_update_post([
                    'ID' => $post->ID,
                    'post_content' => wp_slash(wp_json_encode($data))
                ]);
                
                if (function_exists('wp_clean_theme_json_cache')) wp_clean_theme_json_cache();
                if (class_exists('\WP_Theme_JSON_Resolver')) \WP_Theme_JSON_Resolver::clean_cached_data();
            }
        }
    }
}
