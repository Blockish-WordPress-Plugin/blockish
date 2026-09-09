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
            'description'         => __('Creates, updates or deletes a template or template part. Block themes: FSE wp_template / wp_template_part. Classic themes with Theme Builder: same type values map to TB templates and parts. Pass Blockish layouts as block_schema, never raw HTML. Staged as blockish/ai-preview. After staging AGENT opens edit_url once (resolves whole pending queue), waitUntil domcontentloaded, wait 10–15s, then give a normal WordPress frontend view URL for that template (home, a page, etc.). Settings Accept/Discard only if asked. Call get-designer-workflow and get-block-docs first.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'slug'         => ['type' => 'string', 'description' => 'The slug of the template (e.g., "header", "single", "index").'],
                    'type'         => ['type' => 'string', 'description' => '"wp_template" or "wp_template_part". Defaults to "wp_template".', 'enum' => ['wp_template', 'wp_template_part']],
                    'title'        => ['type' => 'string', 'description' => 'Human-readable title.'],
                    'area'         => ['type' => 'string', 'description' => 'For template parts, the area (header, footer). Theme Builder header/footer parts also accept show_on.'],
                    'show_on'      => [
                        'type'        => 'string',
                        'description' => 'Theme Builder header/footer parts only. One of: entire_site, front_page, singular, archive, search, 404, post_type:post, post_type:page.',
                    ],
                    'conditions'   => [
                        'type'        => 'array',
                        'description' => 'Theme Builder header/footer parts only. Alternative to show_on — same shape stored in blockish_tb_conditions.',
                    ],
                    'active'       => ['type' => 'boolean', 'description' => 'Theme Builder only. Whether the template/part is active on the frontend.'],
                    'priority'     => ['type' => 'integer', 'description' => 'Theme Builder header/footer parts only. Higher wins when multiple parts match (default 10).'],
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
                    'backend'       => ['type' => 'string', 'description' => 'fse or theme_builder.'],
                    'id'            => ['type' => 'integer'],
                    'slug'          => ['type' => 'string'],
                    'edit_url'      => ['type' => 'string', 'description' => 'URL to edit the template in the Site Editor.'],
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
                'usage_notes' => 'Same tool on block themes (FSE) and classic + Theme Builder. FSE: core/template-part with theme slug on wp_template. Theme Builder: blockish/template-part with area or catalog slug (checkout-header, mini-cart, …). Header/footer parts: set show_on. TB template example: [{"name":"blockish/template-part","attributes":{"slug":"header"}},{"name":"blockish/container","attributes":{"tagName":{"label":"Main","value":"main"},"flexDirection":{"Desktop":"column"},"innerContentWidth":true},"innerBlocks":[{"name":"blockish/post-content","attributes":{"align":"full"}}]},{"name":"blockish/template-part","attributes":{"slug":"footer"}}]. After staging: AGENT opens edit_url once (any editor resolves the whole pending queue), waitUntil domcontentloaded, wait 10–15s, then suggest a normal WP frontend view URL for that template.',
            ],
        ];
    }
}
