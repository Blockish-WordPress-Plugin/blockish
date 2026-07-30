<?php

namespace Blockish\Mcp\Abilities\ManageClass;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-class';

    public static function get(): array
    {
        return [
            'label'               => __('Create, Update or Delete CSS Class', 'blockish'),
            'description'         => __('Creates, updates or deletes a reusable Class Manager class. AI writes raw CSS only — never style objects or child posts. Selectors must stay under .{name}; :hover / descendants in the same stylesheet are converted internally into Class Manager parent + child posts for the editor UI. Returns post_id, name, css_selector, and combined css.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action'    => [
                        'type'        => 'string',
                        'enum'        => [ 'create', 'update', 'delete', 'sweep' ],
                        'description' => 'create (default; omit post_id, requires name), update (provide parent post_id), delete (provide post_id; also deletes child classes), or sweep (delete unused parent classes — dry-run unless confirm:true).',
                    ],
                    'post_id'   => [
                        'type'        => 'integer',
                        'description' => 'Required for update and delete. Must be a parent class when sending css. For sweep, optional single unused id to delete.',
                    ],
                    'post_ids'  => [
                        'type'        => 'array',
                        'items'       => [ 'type' => 'integer' ],
                        'description' => 'Optional for sweep — whitelist of unused parent class IDs to delete. Omit to sweep all unused.',
                    ],
                    'confirm'   => [
                        'type'        => 'boolean',
                        'description' => 'Required true for action=sweep to permanently delete. Omit/false = dry-run listing unused classes.',
                    ],
                    'name'      => [
                        'type'        => 'string',
                        'description' => 'CSS class name (auto-normalized). Required on create.',
                    ],
                    'css'       => [
                        'type'        => 'string',
                        'description' => 'Raw stylesheet. Every selector must start with .{name} (or {{SELECTOR}}). Include :hover and descendants in the same string. Declarations with !important are preserved via customCss. Full replace on update. Pass "" to clear.',
                    ],
                ],
                'required' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => [ 'type' => 'integer' ],
                    'name'         => [ 'type' => 'string' ],
                    'css_selector' => [ 'type' => 'string' ],
                    'parent_id'    => [ 'type' => [ 'integer', 'null' ] ],
                    'css'          => [ 'type' => 'string', 'description' => 'Combined raw CSS returned to AI.' ],
                    'deleted'      => [ 'type' => [ 'boolean', 'array' ] ],
                    'dry_run'      => [ 'type' => 'boolean' ],
                    'unused'       => [ 'type' => 'array' ],
                    'note'         => [ 'type' => 'string' ],
                    'error'        => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_class'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Call get-class-manager-docs then get-classes before creating. Write css only (!important → customCss automatically). Attach with classManager: "name1, name2". Prefer Class Manager over one-off convert-css when styles are reusable. Use get-class-usage then action=sweep to clean unused classes. Child posts are created automatically for UI — do not create them yourself.',
            ],
        ];
    }
}
