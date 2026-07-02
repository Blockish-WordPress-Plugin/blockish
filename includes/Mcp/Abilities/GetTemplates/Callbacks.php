<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

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

        $templates = [];

        foreach ($post_type as $pt) {
            $query_args = [];
            if (!empty($input['slug'])) {
                $query_args['slug__in'] = [$input['slug']];
            }

            $block_templates = get_block_templates($query_args, $pt);

            foreach ($block_templates as $template) {
                $has_schema = false;
                if ($template->wp_id) {
                    $has_schema = (bool) get_post_meta($template->wp_id, BlockSchemaMeta::META_KEY, true);
                } else {
                    $option_name = $pt === 'wp_template' ? 'blockish_mcp_staged_template' : 'blockish_mcp_staged_template_part';
                    $staged_data = get_option($option_name, []);
                    $has_schema = isset($staged_data[$template->slug]);
                }

                $template_data = [
                    'id'            => $template->wp_id ?? 0,
                    'slug'          => $template->slug,
                    'title'         => $template->title,
                    'type'          => $template->type,
                    'area'          => $template->area ?? '',
                    'source'        => $template->source,
                    'is_custom'     => $template->is_custom,
                    'has_theme_file'=> $template->has_theme_file,
                    'schema_staged' => $has_schema,
                ];

                if (!empty($input['slug'])) {
                    $template_data['content'] = $template->content;
                    $parsed_blocks = parse_blocks($template->content);
                    $template_data['schema']  = \Blockish\Mcp\SchemaUtils::convert_to_js_schema($parsed_blocks);
                }

                $templates[] = $template_data;
            }
        }

        return [
            'theme'     => $theme_slug,
            'templates' => $templates,
        ];
    }
}
