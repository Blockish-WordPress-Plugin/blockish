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
            'description'         => __('Upserts reusable Class Manager classes from raw CSS. Just send css — the class name is read from each selector (e.g. ".hero-title { … }" → class "hero-title"), and the class is created if new or updated (full replace) if it already exists. One stylesheet may declare several classes; each ".name" root becomes its own class, while :hover / descendants (".name h2") become that class\'s children. You never pass action/name/post_id for normal styling, and never write style objects or child posts. Returns the affected classes (post_id, name, css_selector, combined css) under "classes".', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'        => 'object',
                'description' => 'Normal styling input is exactly { "css": ".hero-title { color: red; }" }. Do not send action, name, or post_id: class names come from the CSS and each class is upserted automatically. action is only for delete/sweep.',
                'properties' => [
                    'action'    => [
                        'type'        => 'string',
                        'enum'        => [ 'delete', 'sweep' ],
                        'description' => 'Administrative operations only. Omit for CSS writes. delete requires post_id; sweep is a dry-run unless confirm is true.',
                    ],
                    'post_id'   => [
                        'type'        => 'integer',
                        'minimum'     => 1,
                        'description' => 'Required with action:"delete". With action:"sweep", optionally restricts the sweep to one unused parent. For the exceptional single-class {{SELECTOR}}/clear path, identifies the target parent. Never needed for normal .class CSS.',
                    ],
                    'post_ids'  => [
                        'type'        => 'array',
                        'items'       => [ 'type' => 'integer', 'minimum' => 1 ],
                        'uniqueItems' => true,
                        'description' => 'Optional for sweep — whitelist of unused parent class IDs to delete. Omit to sweep all unused.',
                    ],
                    'confirm'   => [
                        'type'        => 'boolean',
                        'description' => 'Required true for action=sweep to permanently delete. Omit/false = dry-run listing unused classes.',
                    ],
                    'name'      => [
                        'type'        => 'string',
                        'minLength'   => 1,
                        'description' => 'Exceptional single-class override only: use with {{SELECTOR}}, or with css:"" to clear a class. Never send for normal .class CSS because the selector is the source of truth.',
                    ],
                    'css'       => [
                        'type'        => 'string',
                        'description' => 'EXPECTED WRITE PAYLOAD: { "css": ".hero-title { color: red; }" }. Raw stylesheet only. The leftmost .class in every rule is the class name: .hero-title:hover and .hero-title h2 belong to hero-title; a different root such as .hero-card creates/updates another class in the same call. Existing classes are fully replaced, so first read get-classes and resend their complete CSS. Supports @media max-width 1024px/768px and !important. Empty css requires name or post_id to clear one class. {{SELECTOR}} requires explicit name.',
                    ],
                ],
                'anyOf' => [
                    [
                        'required' => [ 'css' ],
                    ],
                    [
                        'properties' => [
                            'action' => [ 'const' => 'delete' ],
                        ],
                        'required' => [ 'action', 'post_id' ],
                    ],
                    [
                        'properties' => [
                            'action' => [ 'const' => 'sweep' ],
                        ],
                        'required' => [ 'action' ],
                    ],
                ],
                'examples' => [
                    [ 'css' => '.hero-title { color: #14162b; font-size: 3rem; } .hero-title:hover { color: #4f46e5; }' ],
                    [ 'css' => '.feature-card { padding: 24px; } .feature-title { font-weight: 700; }' ],
                    [ 'action' => 'delete', 'post_id' => 45 ],
                    [ 'action' => 'sweep', 'confirm' => false ],
                ],
            ],
            'output_schema'       => [
                'type'        => 'object',
                'description' => 'CSS writes return every upserted class in classes. A one-class write also mirrors its first item at the top level for backward compatibility. Delete/sweep return deleted; sweep also returns dry_run and unused. Failures return error.',
                'properties' => [
                    'post_id'      => [ 'type' => 'integer', 'minimum' => 1, 'description' => 'Backward-compatible mirror of the first affected class post ID.' ],
                    'name'         => [ 'type' => 'string', 'description' => 'Backward-compatible mirror of the first affected class name.' ],
                    'css_selector' => [ 'type' => 'string', 'description' => 'Backward-compatible mirror of the first affected root selector, e.g. .hero-title.' ],
                    'parent_id'    => [ 'type' => [ 'integer', 'null' ], 'description' => 'Always null for the parent classes exposed by this ability.' ],
                    'css'          => [ 'type' => 'string', 'description' => 'Backward-compatible mirror of the first affected class’s complete canonical CSS.' ],
                    'created'      => [ 'type' => 'boolean', 'description' => 'Backward-compatible mirror: true if the first class was created; false if updated.' ],
                    'classes'      => [
                        'type'        => 'array',
                        'description' => 'AUTHORITATIVE CSS-WRITE RESULT. One item per root class found in the input stylesheet, in first-seen order.',
                        'items'       => [
                            'type'                 => 'object',
                            'additionalProperties' => false,
                            'properties'           => [
                                'post_id'      => [ 'type' => 'integer', 'minimum' => 1, 'description' => 'Class Manager parent post ID.' ],
                                'name'         => [ 'type' => 'string', 'description' => 'Normalized class name without the leading dot.' ],
                                'css_selector' => [ 'type' => 'string', 'description' => 'Root CSS selector with leading dot.' ],
                                'parent_id'    => [ 'type' => [ 'integer', 'null' ], 'description' => 'Null because this item is a parent class.' ],
                                'css'          => [ 'type' => 'string', 'description' => 'Complete canonical CSS stored for this class, including hover/descendant/media rules.' ],
                                'created'      => [ 'type' => 'boolean', 'description' => 'True when inserted; false when an existing same-name class was fully replaced.' ],
                            ],
                            'required' => [ 'post_id', 'name', 'css_selector', 'parent_id', 'css', 'created' ],
                        ],
                        'minItems' => 1,
                    ],
                    'deleted'      => [
                        'oneOf' => [
                            [ 'type' => 'boolean', 'description' => 'For action:"delete", true after the requested class is permanently deleted.' ],
                            [
                                'type'        => 'array',
                                'description' => 'For action:"sweep", the parent classes permanently deleted; empty during dry-run.',
                                'items'       => [
                                    'type'       => 'object',
                                    'properties' => [
                                        'post_id'      => [ 'type' => 'integer', 'minimum' => 1 ],
                                        'name'         => [ 'type' => 'string' ],
                                        'css_selector' => [ 'type' => 'string' ],
                                    ],
                                    'required' => [ 'post_id', 'name', 'css_selector' ],
                                ],
                            ],
                        ],
                    ],
                    'dry_run'      => [ 'type' => 'boolean', 'description' => 'Sweep only. True means nothing was deleted.' ],
                    'unused'       => [
                        'type'        => 'array',
                        'description' => 'Sweep candidates remaining after any post_ids filter. During a confirmed successful sweep this is empty.',
                        'items'       => [
                            'type'       => 'object',
                            'properties' => [
                                'post_id'      => [ 'type' => 'integer', 'minimum' => 1 ],
                                'name'         => [ 'type' => 'string' ],
                                'css_selector' => [ 'type' => 'string' ],
                            ],
                            'required' => [ 'post_id', 'name', 'css_selector' ],
                        ],
                    ],
                    'note'         => [ 'type' => 'string', 'description' => 'Human-readable instruction, primarily returned by sweep dry-runs.' ],
                    'error'        => [ 'type' => 'string', 'description' => 'Present instead of a success payload when validation, conversion, permission, or persistence fails.' ],
                ],
                'examples' => [
                    [
                        'post_id'      => 45,
                        'name'         => 'hero-title',
                        'css_selector' => '.hero-title',
                        'parent_id'    => null,
                        'css'          => '.hero-title { color: #14162b; }',
                        'created'      => true,
                        'classes'      => [
                            [
                                'post_id'      => 45,
                                'name'         => 'hero-title',
                                'css_selector' => '.hero-title',
                                'parent_id'    => null,
                                'css'          => '.hero-title { color: #14162b; }',
                                'created'      => true,
                            ],
                        ],
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'manage_class'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Call get-class-manager-docs then get-classes before writing. Send css only — the class name is read from the selector, and create-vs-update is automatic (matched by name). Updating an existing class is a full replace, so include its complete stylesheet (read current css via get-classes first). One css string can define several classes. !important → customCss automatically. Attach with classManager: "name1, name2". Prefer Class Manager over one-off convert-css when styles are reusable. Use get-class-usage then action=sweep to clean unused classes. Child posts (:hover / descendants) are created automatically — do not create them yourself.',
            ],
        ];
    }
}
