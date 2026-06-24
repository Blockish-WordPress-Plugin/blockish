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
            'description'         => __('Manages reusable styling classes in the Blockish Class Manager. Each class is a custom post of type "blockish-classes".

RULE: Only use this for styling that has no equivalent block attribute. If a block attribute or control already produces the style (background, border, padding, typography, box-shadow, etc. — see blockish/get-block-docs), set that attribute on the block directly instead of creating a class for it.

HOW STORAGE WORKS (read blockish/get-class-manager-docs for the full format):
- The post TITLE ("name") is the CSS class name. It is auto-normalized: lowercase, spaces → hyphens, only a-z / 0-9 / hyphen / underscore, must start with a letter or underscore.
- The post CONTENT ("content") is a JSON *style object* — a structured map of style properties (padding, background, border, fontSize, transform, customCss, etc., each optionally responsive). This is the single source of truth you write.
- You do NOT write CSS and you do NOT write to meta. The compiled CSS is generated from the style object automatically by the editor; the frontend reads that generated CSS. Writing raw CSS to meta is wrong — it gets overwritten the moment the class is opened in the editor.
- "parent_id": set this to create a child/variation class of an existing parent. Children apply via the ".blockish-cm-{post_id}" selector (returned as css_selector); parents apply via ".{class-name}".

ACTIONS:
- "create": omit post_id. Required: name. Optional: content (style object), parent_id.
- "update": provide post_id. Update name and/or content. Re-send the COMPLETE style object you want — content REPLACES the stored object, it is not merged.
- "delete": provide post_id. Permanently deletes the class (and its child classes).

ALWAYS call blockish/get-class-manager-docs before your first class operation in a session (it defines every style-object key and its value shape). ALWAYS call blockish/get-classes before creating, to avoid duplicates.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action'    => [
                        'type'        => 'string',
                        'enum'        => [ 'create', 'update', 'delete' ],
                        'description' => 'create (default), update, or delete.',
                    ],
                    'post_id'   => [
                        'type'        => 'integer',
                        'description' => 'Required for update and delete.',
                    ],
                    'name'      => [
                        'type'        => 'string',
                        'description' => 'The CSS class name. Lowercase, hyphens/underscores allowed, must start with a letter or underscore.',
                    ],
                    'content'   => [
                        'type'        => 'object',
                        'description' => 'The style object (JSON) stored as the post content — see blockish/get-class-manager-docs for every key and value shape. Compiled to CSS automatically; do not write raw CSS.',
                    ],
                    'parent_id' => [
                        'type'        => 'integer',
                        'description' => 'Set to make this a child/variation class of an existing parent class.',
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
            ],
        ];
    }
}
