<?php

namespace Blockish\Mcp\Abilities\ManageGlobalInteractions;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/manage-global-interactions';

    public static function get(): array
    {
        return [
            'label'               => __('Manage Global Interactions', 'blockish'),
            'description'         => __('Get or update global vanilla JS interactions (animations and event listeners applied to the entire document).', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type' => 'string',
                        'enum' => ['get', 'update'],
                        'description' => 'The action to perform: "get" to retrieve current global interactions, "update" to set new ones.'
                    ],
                    'interactions' => [
                        'type' => 'array',
                        'description' => 'Required if action is "update". The array of global interaction objects.',
                        'items' => [
                            'type' => 'object',
                            'properties' => [
                                'id' => [ 'type' => 'string', 'description' => 'Unique ID for the interaction.' ],
                                'scope' => [ 'type' => 'string', 'enum' => ['global'] ],
                                'event' => [ 'type' => 'string', 'description' => 'DOM event name (e.g. "click", "scroll"), or lifecycle "ready"/"init" (runs once after the interactions script boots — safe even if DOMContentLoaded already fired). Use ready/init for one-time setup; use DOM events for ongoing listeners.' ],
                                'selector' => [ 'type' => 'string', 'description' => 'Optional CSS selector for event delegation on document.body (or query targets for ready/init).' ],
                                'callbacks' => [
                                    'type' => 'array',
                                    'items' => [ 'type' => 'string' ],
                                    'description' => 'Array of raw JS code strings to execute. The variables `event` and `blockElement` (document.body, or the matched selector target) are available.'
                                ]
                            ],
                            'required' => ['id', 'scope', 'event', 'callbacks']
                        ]
                    ]
                ],
                'required' => ['action']
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'interactions' => [
                        'type' => 'array',
                        'description' => 'The current global interactions.'
                    ],
                    'message' => [ 'type' => 'string' ]
                ]
            ],
            'execute_callback'    => [Callbacks::class, 'execute'],
            'permission_callback' => fn() => current_user_can('edit_theme_options'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this ability to add or remove site-wide animations or custom vanilla JS event listeners. Note: for block-specific interactions, use the interactionData attribute in manage-post instead. Lifecycle: event "ready" or "init" runs once after boot (prefer this over DOMContentLoaded inside callbacks). CRITICAL RULE FOR ANIMATIONS & INTERACTIONS: If a user complains about an animation looking weird or applies styling to an outer wrapper when it should apply to an inner element, DO NOT guess the fix. 1. Use the `blockish/get-posts` MCP tool to fetch the post and inspect the raw HTML structure (or ask the user for a screenshot of the raw markup). 2. Add the correct `selector` property to the interaction schema so that the animation applies exactly to the inner target element instead of the outer wrapper (when `selector` is used, the `blockElement` variable in the callback automatically refers to the matched inner element). 3. COMBINE WITH CLASS MANAGER: To reliably target specific blocks, always assign a unique CSS class using the Class Manager extension, ensuring you get a unique class for any block.'
            ],
        ];
    }
}
