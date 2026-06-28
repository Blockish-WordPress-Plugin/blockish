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
            'description'         => __('Creates, updates or deletes a Full Site Editing (FSE) template or template part (set delete to remove); returns id, slug, edit_url and action. Pass Blockish layouts as block_schema, never raw HTML. When a schema is staged, share edit_url (not the preview link) so the user can approve.', 'blockish'),
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
                        'description' => 'Array of Blockish block schema nodes ({name, attributes, innerBlocks}) to stage on this template. Build it from blockish/get-block-docs; do not pass raw HTML. Stored as pending data for a human to review and apply in the Site Editor — never written directly into the template. Pass an empty array to clear previously staged schema.',
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
                'usage_notes' => 'block_schema is never written into the template — it is staged as pending data that a human must review by opening edit_url and clicking "Apply AI Layout" in the Site Editor, so AI-generated layouts are always reviewed before going live. Call blockish/get-block-docs first to learn each block\'s attributes before building block_schema. After staging, share edit_url so the user can approve; do not share the preview link by default — if the user insists, warn them the page appears empty or unchanged until they approve the pending layout in the editor.',
            ],
        ];
    }
}
