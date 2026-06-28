<?php

namespace Blockish\Mcp\Abilities\ManageTemplate;

use WP_Query;
use Blockish\Mcp\BlockSchemaMeta;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_template($input): array
    {
        $theme_slug = wp_get_theme()->get_stylesheet();
        $slug = $input['slug'] ?? '';
        
        if (empty($slug)) {
            return ['error' => 'slug is required.'];
        }

        $type = $input['type'] ?? 'wp_template';
        if (!in_array($type, ['wp_template', 'wp_template_part'])) {
            return ['error' => 'type must be wp_template or wp_template_part.'];
        }

        // Find existing template
        $args = [
            'post_type'      => $type,
            'name'           => $slug,
            'post_status'    => 'publish',
            'posts_per_page' => 1,
            'tax_query'      => [
                [
                    'taxonomy' => 'wp_theme',
                    'field'    => 'name',
                    'terms'    => $theme_slug,
                ],
            ],
        ];

        $query = new WP_Query($args);
        $existing = !empty($query->posts) ? $query->posts[0] : null;

        $is_delete = !empty($input['delete']);

        if ($is_delete) {
            if (!$existing) {
                return ['error' => 'Template not found for deletion.'];
            }
            wp_delete_post($existing->ID, true);
            return [
                'id' => $existing->ID,
                'slug' => $slug,
                'action' => 'deleted',
                'schema_staged' => false,
            ];
        }

        // Create or update
        $post_data = [
            'post_type'   => $type,
            'post_name'   => $slug,
            'post_title'  => $input['title'] ?? ($existing ? $existing->post_title : $slug),
            'post_status' => 'publish',
        ];

        if ($existing) {
            $post_data['ID'] = $existing->ID;
            $post_id = wp_update_post($post_data, true);
            $action = 'updated';
        } else {
            $post_id = wp_insert_post($post_data, true);
            $action = 'created';
        }

        if (is_wp_error($post_id)) {
            return ['error' => $post_id->get_error_message()];
        }

        // Handle Taxonomy
        wp_set_post_terms($post_id, $theme_slug, 'wp_theme');
        if ($type === 'wp_template_part' && !empty($input['area'])) {
            wp_set_post_terms($post_id, $input['area'], 'wp_template_part_area');
        }

        $schema_staged = false;
        if (array_key_exists('block_schema', $input) && is_array($input['block_schema'])) {
            $encoded = empty($input['block_schema']) ? '' : wp_json_encode($input['block_schema']);
            $schema_json = BlockSchemaMeta::sanitize(false === $encoded ? '' : $encoded);
            $slushed = wp_slash($schema_json);
            update_post_meta($post_id, BlockSchemaMeta::META_KEY, $slushed);
            $schema_staged = '' !== $slushed;
        }

        return [
            'id' => $post_id,
            'slug' => $slug,
            'edit_url' => get_edit_post_link($post_id, 'raw'),
            'action' => $action,
            'schema_staged' => $schema_staged,
        ];
    }
}
