<?php

namespace Blockish\Mcp\Abilities\ManageTemplate;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-template';

    public static function get(): array
    {
        return [
            'label'               => __('Create or Edit Template', 'blockish'),
            'description'         => __('Creates, updates, or deletes a Full Site Editing (FSE) template or template part. 
            
IMPORTANT: Like manage-post, block_schema is staged as pending data on the template. A human must open the template in the Site Editor and click "Apply AI Layout". Do not pass raw HTML into block_schema, build a block schema (array of {name, attributes, innerBlocks}).

LINK SHARING RULE: When you stage a schema for human approval, you MUST share the `edit_url` with the user so they can approve it. Do NOT share the preview link by default. If the user explicitly insists on seeing the preview link, you may share it, but you MUST warn them that the page will appear empty or unchanged until they approve the pending layout in the editor.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'slug'         => ['type' => 'string', 'description' => 'The slug of the template (e.g., "header", "single", "index").'],
                    'type'         => ['type' => 'string', 'description' => '"wp_template" or "wp_template_part". Defaults to "wp_template".', 'enum' => ['wp_template', 'wp_template_part']],
                    'title'        => ['type' => 'string', 'description' => 'Human-readable title.'],
                    'area'         => ['type' => 'string', 'description' => 'For template parts, the area it belongs to (e.g., "header", "footer", "uncategorized").'],
                    'delete'       => ['type' => 'boolean', 'description' => 'Set to true to delete this template customization, falling back to the theme default.'],
                    'block_schema' => [
                        'type'        => 'array',
                        'description' => 'Array of Blockish block schema nodes ({name, attributes, innerBlocks}) to stage on this template. Pass an empty array to clear previously staged schema.',
                        'items'       => [
                            'type'       => 'object',
                            'properties' => [
                                'name'        => [ 'type' => 'string' ],
                                'attributes'  => [ 'type' => 'object' ],
                                'innerBlocks' => [ 'type' => 'array' ],
                            ],
                            'required'   => [ 'name' ],
                        ],
                    ],
                ],
                'required' => ['slug'],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'id'            => ['type' => 'integer'],
                    'slug'          => ['type' => 'string'],
                    'edit_url'      => ['type' => 'string', 'description' => 'URL to edit the template in the Site Editor. Share this when schema is staged.'],
                    'action'        => ['type' => 'string', 'description' => '"created", "updated", or "deleted"'],
                    'schema_staged' => ['type' => 'boolean'],
                    'error'         => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_template'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
