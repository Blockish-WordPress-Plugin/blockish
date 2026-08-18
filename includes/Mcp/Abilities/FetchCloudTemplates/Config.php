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
            'description'         => __('Fetches boilerplate design templates (patterns and pages) from the Blockish Cloud Template Library. Designs may include dependencies.patterns, dependencies.forms, and dependencies.classes (cloud id + content/css). Recreate those as local wp_block / blockish_form / blockish-classes posts, remap ref/formId/classManager ids cloud→local, then adapt the schema to the user request. CRITICAL: Never use cloud IDs as-is on the destination site.', 'blockish'),
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
                                'featured_image' => ['type' => ['string', 'boolean', 'null'], 'description' => 'URL to visual representation of the template.'],
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
                'usage_notes' => 'NOTE TO AI: Designs include content + optional dependencies (patterns/forms/classes with cloud ids). 1) Create local entities from dependencies (classes via manage-class css or template-library import). 2) Remap ref/formId/classManager id from cloud IDs to new local IDs in content/schema. 3) Modify colors/copy/layout for the user. 4) Stage via manage-pattern / manage-post block_schema and share edit_url — never paste unresolved cloud refs. Unlicensed Dynamicity/Forms cloud packages are omitted — if `note` says PRO REQUIRED, tell the user using designer-workflow step 6 / 6b (do not invent those templates).',
            ],
        ];
    }
}
