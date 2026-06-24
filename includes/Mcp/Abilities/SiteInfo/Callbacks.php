<?php

namespace Blockish\Mcp\Abilities\SiteInfo;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_site_info($_input): array
    {
        return [
            'name'        => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url'         => home_url(),
            'wp_version'  => get_bloginfo('version'),
            'theme_info'  => self::get_site_theme_info(),
        ];
    }

    public static function get_site_theme_info(): array
    {
        // 1. Get the currently active theme object
        $active_theme = wp_get_theme();

        // 2. Compile the active theme's data
        $theme_data = [
            'name'           => $active_theme->get('Name'),
            'version'        => $active_theme->get('Version'),
            'is_block_theme' => wp_is_block_theme(), // Returns true if it's a Full Site Editing theme
            'has_parent'     => $active_theme->parent() ? true : false,
            'parent_data'    => null // Default if no parent exists
        ];

        // 3. If a parent theme exists (meaning the active theme is a child theme)
        if ($theme_data['has_parent']) {
            $parent_theme = $active_theme->parent();

            // Block theme check for parent requires checking its specific folder/stylesheet
            $is_parent_block = function_exists('wp_is_block_theme') && self::has_block_template_programmatically($parent_theme->get_stylesheet());

            $theme_data['parent_data'] = [
                'name'           => $parent_theme->get('Name'),
                'version'        => $parent_theme->get('Version'),
                'is_block_theme' => $is_parent_block,
                'has_parent'     => false // A parent theme cannot have another parent theme in WP
            ];
        }

        return $theme_data;
    }

    public static function has_block_template_programmatically($stylesheet)
    {
        return locate_block_template('', 'index', array()) || file_exists(get_theme_root() . '/' . $stylesheet . '/templates/index.html');
    }
}
