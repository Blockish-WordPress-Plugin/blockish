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
            'description'         => __('Creates, updates or deletes a Full Site Editing (FSE) template or template part (set delete to remove); returns id, slug, edit_url and action. Pass Blockish layouts as block_schema, never raw HTML. Never wrap with core/group — use one blockish/container with tagName main around blockish/post-content. front-page, page, and single share that skeleton; Homepage content is the page assigned under Reading, not pattern refs in the template. core/template-part and core/block have no innerBlocks. Staged as blockish/ai-preview. Share edit_url for Accept/Discard. Call get-designer-workflow and get-block-docs first. Always trigger-refresh after staging.', 'blockish'),
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
                        'description' => 'Array of block schema nodes ({name, attributes, innerBlocks}) to stage. Never raw HTML. Never core/group. wp_template example: header template-part, then blockish/container tagName=main innerContentWidth=true wrapping blockish/post-content align=full, then footer template-part. Header/footer: {"name":"core/template-part","attributes":{"slug":"header","theme":"<active_theme_slug>"}} with no innerBlocks. Pass an empty array to clear.',
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
                    'schema_file' => [
                        'type'        => 'string',
                        'description' => 'Absolute path on the WordPress SERVER only to a JSON file containing block_schema. Never a Cursor/client path when MCP points at a remote site.',
                    ],
                    'schema_url' => [
                        'type'        => 'string',
                        'description' => 'PREFERRED for large or client-local schemas on remote MCP. Write the block_schema JSON, upload that file to a third-party temporary hosting service (e.g. tmpfiles.org), take the DIRECT download URL that returns raw JSON (not an HTML page), then pass that HTTPS URL here. Do not inline huge block_schema when it risks truncation. Do not use base64. Max download 2 MB. Do not pass schema_file at the same time.',
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
                    'warnings'      => ['type' => 'array', 'description' => 'Non-blocking agent warnings.', 'items' => ['type' => 'string']],
                    'error'         => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_template'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Staged as blockish/ai-preview. ALWAYS trigger-refresh and share edit_url. Never core/group. Never pattern refs on wp_template — those go on the page. Same skeleton for front-page, page, single: [{"name":"core/template-part","attributes":{"slug":"header","theme":"<stylesheet>"}},{"name":"blockish/container","attributes":{"tagName":{"label":"Main","value":"main"},"flexDirection":{"Desktop":"column"},"alignItems":{"Desktop":"stretch"},"justifyContent":{"Desktop":"flex-start"},"innerContentWidth":true},"innerBlocks":[{"name":"blockish/post-content","attributes":{"align":"full"}}]},{"name":"core/template-part","attributes":{"slug":"footer","theme":"<stylesheet>"}}]. Header/footer parts: tagName stays div. Call get-block-docs for blockish/container and blockish/post-content.',
            ],
        ];
    }
}
