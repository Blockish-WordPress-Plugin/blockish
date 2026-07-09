<?php

namespace Blockish\Mcp\Abilities\FetchCloudTemplates;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/fetch-cloud-templates';

    public static function get(): array
    {
        return [
            'label'               => __('Fetch Cloud Templates', 'blockish'),
            'description'         => __('Fetches boilerplate design templates (patterns and pages) from the Blockish Cloud Template Library. CRITICAL: The returned block schemas are starting points. You MUST modify colors, placeholder text, and structure based on the user\'s prompt before inserting them.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'type' => [
                        'type' => 'string',
                        'description' => 'Type of templates to fetch. Either "patterns" or "pages".',
                        'enum' => ['patterns', 'pages'],
                        'default' => 'patterns'
                    ],
                    'keywords' => [
                        'type' => 'array',
                        'items' => ['type' => 'string'],
                        'description' => 'List of keywords describing the design, e.g. ["hero", "app", "dark"]. We will automatically map these to categories, tags, or search queries.'
                    ],
                    'posts_per_page' => [
                        'type' => 'integer',
                        'description' => 'Number of templates to return per page. Default 10.'
                    ],
                    'paged' => [
                        'type' => 'integer',
                        'description' => 'Page number. Default 1.'
                    ]
                ],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'total_pages' => ['type' => 'integer'],
                    'current_page' => ['type' => 'integer'],
                    'designs' => [
                        'type'  => 'array',
                        'items' => [
                            'type'       => 'object',
                            'properties' => [
                                'id'             => ['type' => 'integer'],
                                'title'          => ['type' => 'string'],
                                'slug'           => ['type' => 'string'],
                                'featured_image' => ['type' => 'string', 'description' => 'URL to visual representation of the template.'],
                                'schema'         => ['type' => 'array', 'description' => 'Native JS block schema array for this design. Modify this directly to edit layout.']
                            ]
                        ]
                    ],
                    'error' => ['type' => 'string']
                ]
            ],
            'execute_callback'    => [Callbacks::class, 'fetch'],
            'permission_callback' => fn() => true,
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'NOTE TO AI: The fetched designs are boilerplate starter templates. YOU MUST NOT USE THEM EXACTLY AS THEY ARE. Analyze the user\'s request and modify the returned block_schema to match the user\'s requested colors, typography, layout preferences, and placeholder text before returning or inserting the final schema.',
            ],
        ];
    }
}
