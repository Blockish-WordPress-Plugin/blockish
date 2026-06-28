<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

use WP_Query;
use Blockish\Mcp\BlockSchemaMeta;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_templates($input): array
    {
        $theme_slug = wp_get_theme()->get_stylesheet();
        $post_type = $input['type'] ?? ['wp_template', 'wp_template_part'];
        
        if (!is_array($post_type)) {
            $post_type = [$post_type];
        }

        $args = [
            'post_type'      => $post_type,
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'tax_query'      => [
                [
                    'taxonomy' => 'wp_theme',
                    'field'    => 'name',
                    'terms'    => $theme_slug,
                ],
            ],
        ];

        $query = new WP_Query($args);
        $templates = [];

        foreach ($query->posts as $post) {
            $has_schema = (bool) get_post_meta($post->ID, BlockSchemaMeta::META_KEY, true);
            $area = wp_get_post_terms($post->ID, 'wp_template_part_area', ['fields' => 'names']);
            $area = (!empty($area) && !is_wp_error($area)) ? $area[0] : '';
            
            $templates[] = [
                'id'            => $post->ID,
                'slug'          => $post->post_name,
                'title'         => $post->post_title,
                'type'          => $post->post_type,
                'area'          => $area,
                'schema_staged' => $has_schema,
            ];
        }

        return [
            'theme'     => $theme_slug,
            'templates' => $templates,
        ];
    }
}
