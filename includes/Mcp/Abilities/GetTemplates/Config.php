<?php

namespace Blockish\Mcp\Abilities\GetTemplates;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-templates';

    public static function get(): array
    {
        return [
            'label'               => __('Get Site Editor Templates', 'blockish'),
            'description'         => __('Fetches existing Full Site Editing (FSE) templates (wp_template) and template parts (wp_template_part) for the active theme, optionally filtered by type.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'type' => [
                        'type' => 'string',
                        'description' => 'Optional filter. Either "wp_template" or "wp_template_part". If omitted, returns both.',
                        'enum' => ['wp_template', 'wp_template_part']
                    ],
                    'slug' => [
                        'type' => 'string',
                        'description' => 'Optional slug to fetch a specific template and its schema.',
                    ],
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'theme'     => ['type' => 'string'],
                    'templates' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'            => ['type' => 'integer'],
                                'slug'          => ['type' => 'string'],
                                'title'         => ['type' => 'string'],
                                'type'          => ['type' => 'string'],
                                'area'          => ['type' => 'string'],
                                'source'        => ['type' => 'string', 'description' => 'Origin of the template: "theme" (default file) or "custom" (user modified).'],
                                'is_custom'     => ['type' => 'boolean', 'description' => 'True if this template has been customized in the database.'],
                                'has_theme_file'=> ['type' => 'boolean', 'description' => 'True if a default physical file exists for this template.'],
                                'schema_staged' => ['type' => 'boolean'],
                                'content'       => ['type' => 'string', 'description' => 'Raw post_content. Only included when fetching via slug.'],
                                'schema'        => ['type' => 'array', 'description' => 'Native JS block schema array for this template. Modify this directly to edit layout. Only included when fetching via slug.'],
                            ],
                        ],
                    ],
                    'error'     => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_templates'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this to discover which templates exist before managing them with blockish/manage-template.',
            ],
        ];
    }
}
