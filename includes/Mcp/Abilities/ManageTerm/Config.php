<?php

namespace Blockish\Mcp\Abilities\ManageTerm;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-term';

    public static function get(): array
    {
        return [
            'label'               => __('Create or Edit Term', 'blockish'),
            'description'         => __('Creates a term (omit term_id) or edits one (provide term_id) within any registered taxonomy.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'term_id'      => ['type' => 'integer', 'description' => 'Provide to edit an existing term. Omit to create a new one.'],
                    'taxonomy'     => ['type' => 'string',  'description' => 'Taxonomy slug (e.g., "category", "post_tag"). Required.'],
                    'name'         => ['type' => 'string',  'description' => 'Name of the term. Required when creating.'],
                    'description'  => ['type' => 'string',  'description' => 'Term description.'],
                    'slug'         => ['type' => 'string',  'description' => 'Term slug (optional, generated from name if omitted).'],
                    'parent'       => ['type' => 'integer', 'description' => 'Parent term ID for hierarchical taxonomies.'],
                ],
                'required'   => ['taxonomy'],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'term_id'          => ['type' => 'integer'],
                    'term_taxonomy_id' => ['type' => 'integer'],
                    'taxonomy'         => ['type' => 'string'],
                    'name'             => ['type' => 'string'],
                    'slug'             => ['type' => 'string'],
                    'error'            => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_term'],
            'permission_callback' => fn() => current_user_can('manage_categories'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
