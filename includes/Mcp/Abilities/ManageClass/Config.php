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
            'description'         => __('Creates, updates or deletes a reusable Blockish Class Manager class (a "blockish-classes" custom post) selected by the action param; returns post_id, name, css_selector and content. You write only name and the JSON style object (content) — never raw CSS, and on update content fully replaces the stored object (not merged). Only create a class for styling that has no equivalent block attribute.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action'    => [
                        'type'        => 'string',
                        'enum'        => [ 'create', 'update', 'delete' ],
                        'description' => 'create (default; omit post_id, requires name), update (provide post_id), or delete (provide post_id; also deletes child classes).',
                    ],
                    'post_id'   => [
                        'type'        => 'integer',
                        'description' => 'Required for update and delete.',
                    ],
                    'name'      => [
                        'type'        => 'string',
                        'description' => 'The CSS class name; becomes the post title and is auto-normalized (lowercase, spaces → hyphens, only a-z/0-9/hyphen/underscore, must start with a letter or underscore).',
                    ],
                    'content'   => [
                        'type'        => 'object',
                        'description' => 'The style object (JSON) stored as the post content and the single source of truth — a structured map of style properties (padding, background, border, fontSize, transform, customCss, etc., each optionally responsive); see blockish/get-class-manager-docs for every key and value shape. Compiled to CSS automatically; do not write raw CSS and do not write to meta (raw CSS in meta is overwritten when the class opens in the editor). On update it REPLACES the stored object (not merged) — re-send the complete object.',
                    ],
                    'parent_id' => [
                        'type'        => 'integer',
                        'description' => 'Set to make this a child/variation class of an existing parent class. Children apply via the ".blockish-cm-{post_id}" selector (returned as css_selector); parents apply via ".{class-name}".',
                    ],
                ],
                'required' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => [ 'type' => 'integer' ],
                    'name'         => [ 'type' => 'string' ],
                    'css_selector' => [ 'type' => 'string', 'description' => 'The CSS selector this class produces — its style object targets this selector. Use it when applying the class to blocks.' ],
                    'parent_id'    => [ 'type' => [ 'integer', 'null' ] ],
                    'content'      => [ 'type' => 'object', 'description' => 'The stored style object.' ],
                    'deleted'      => [ 'type' => 'boolean' ],
                    'error'        => [ 'type' => 'string' ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_class'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Always call blockish/get-class-manager-docs before your first class operation in a session (it defines every style-object key and its value shape), and call blockish/get-classes before creating to avoid duplicates. Only use this ability for styling that has no equivalent block attribute or control (background, border, padding, typography, box-shadow, etc. — see blockish/get-block-docs); if an attribute already produces the style, set it on the block directly instead of creating a class.',
            ],
        ];
    }
}
