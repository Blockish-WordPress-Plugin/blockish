<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

use Blockish\Mcp\SchemaUtils;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_templates($input): array
    {
        if ( ! function_exists( 'wp_is_block_theme' ) || ! wp_is_block_theme() ) {
            return [ 'error' => 'This tool is not available for the active theme because it is not a block theme.' ];
        }

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
                $has_preview = SchemaUtils::content_has_ai_preview( (string) $template->content );

                $template_data = [
                    'id'            => $template->wp_id ?? 0,
                    'slug'          => $template->slug,
                    'title'         => $template->title,
                    'type'          => $template->type,
                    'area'          => $template->area ?? '',
                    'source'        => $template->source,
                    'is_custom'     => $template->is_custom,
                    'has_theme_file'=> $template->has_theme_file,
                    'schema_staged' => $has_preview,
                ];

                if (!empty($input['slug'])) {
                    $template_data['content'] = $template->content;
                    $template_data['schema']  = SchemaUtils::resolve_schema_from_content( (string) $template->content );
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
