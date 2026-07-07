<?php

namespace Blockish\Mcp\Abilities\GetFonts;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_fonts(array $args): array
    {
        $response = [
            'theme_fonts' => [],
            'installed_fonts' => []
        ];

        // 1. Get theme fonts from global styles
        if (class_exists('WP_Theme_JSON_Resolver')) {
            $theme_json = \WP_Theme_JSON_Resolver::get_theme_data();
            $settings = $theme_json->get_settings();
            if (isset($settings['typography']['fontFamilies']['theme'])) {
                $response['theme_fonts'] = $settings['typography']['fontFamilies']['theme'];
            }
        }

        // 2. Get installed fonts from wp_font_family
        $font_families = get_posts([
            'post_type' => 'wp_font_family',
            'posts_per_page' => -1,
            'post_status' => 'any'
        ]);

        foreach ($font_families as $family) {
            $family_data = json_decode($family->post_content, true) ?: [];
            $family_item = [
                'id' => $family->ID,
                'name' => $family->post_title,
                'fontFamily' => $family_data['fontFamily'] ?? '',
                'preview' => $family_data['preview'] ?? '',
                'fontFace' => []
            ];

            // Get font faces for this family
            $font_faces = get_posts([
                'post_type' => 'wp_font_face',
                'post_parent' => $family->ID,
                'posts_per_page' => -1,
                'post_status' => 'any'
            ]);

            foreach ($font_faces as $face) {
                $face_data = json_decode($face->post_content, true) ?: [];
                $face_data['id'] = $face->ID;
                $family_item['fontFace'][] = $face_data;
            }

            $response['installed_fonts'][] = $family_item;
        }

        return $response;
    }
}
