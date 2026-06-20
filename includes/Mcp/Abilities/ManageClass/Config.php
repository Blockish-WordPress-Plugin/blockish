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
            'description'         => __('Manages CSS classes in the Blockish Class Manager. Each class is a custom post of type "blockish-classes".

RULE: Only use this for CSS that has no equivalent block attribute. If a block attribute or control already produces the style (background, border, padding, typography, box-shadow, etc. — see blockish/get-block-docs), set that attribute directly instead of creating a class for it.

HOW IT WORKS:
- "name" becomes the CSS class name applied to blocks. It is auto-normalized: lowercase, spaces become hyphens, only a-z / 0-9 / hyphens / underscores allowed, must start with a letter or underscore.
- "css" stores raw CSS in post meta. It is output to the page exactly as stored — no selector is added automatically. You MUST write complete CSS rules including the selector. Use the "css_selector" value returned in the response as the root selector.
- "parent_id": set this to create a child class that is a variation of an existing parent. Child classes get the selector ".blockish-cm-{post_id}" (returned in the response).

WRITING CSS:
Parent class (e.g. name="hero-card", css_selector=".hero-card"):
  .hero-card { background: #fff; border-radius: 12px; padding: 32px; }
  .hero-card:hover { box-shadow: 0 8px 24px rgba(0,0,0,0.12); transform: translateY(-2px); }
  .hero-card h2 { font-size: 1.5rem; color: #111; }

Child class (css_selector=".blockish-cm-67"):
  .blockish-cm-67 { border: 2px solid #1a73e8; }
  .blockish-cm-67:hover { background: #e8f0fe; }

Rules:
- Always use the css_selector from the response as the root. Nest child selectors under it.
- Standard CSS only — no SCSS/Less. Pseudo-classes (:hover, :focus), pseudo-elements (::before, ::after), and child/descendant combinators are all valid.
- For transitions write them in the same rule: ".hero-card { transition: box-shadow 0.3s ease, transform 0.3s ease; }"
- The CSS is global — keep selectors specific enough to avoid collisions.

ACTIONS:
- "create": omit post_id. Required: name. Optional: css, parent_id.
- "update": provide post_id. Any combination of name, css can be updated.
- "delete": provide post_id. Permanently deletes the class.

IMPORTANT: Always call blockish/get-class-manager-docs before your first class operation in a session. Always call blockish/get-classes before creating to avoid duplicates.', 'blockish'),
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
                    'css'       => [
                        'type'        => 'string',
                        'description' => 'Full CSS including selector. Use the css_selector returned in the response (e.g. ".my-button { color: red; }").',
                    ],
                    'parent_id' => [
                        'type'        => 'integer',
                        'description' => 'Set to make this a subselector/child class of an existing parent class.',
                    ],
                ],
                'required' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'post_id'      => [ 'type' => 'integer' ],
                    'name'         => [ 'type' => 'string' ],
                    'css_selector' => [ 'type' => 'string', 'description' => 'The exact CSS selector to use when writing CSS rules for this class.' ],
                    'parent_id'    => [ 'type' => [ 'integer', 'null' ] ],
                    'css'          => [ 'type' => 'string' ],
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
