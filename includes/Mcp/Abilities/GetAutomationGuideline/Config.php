<?php

namespace Blockish\Mcp\Abilities\GetAutomationGuideline;

use Blockish\Mcp\Abilities\GetAutomationGuideline\Callbacks;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-automation-guideline';

    public static function get(): array
    {
        return [
            'label'               => __('Get Automation Guideline', 'blockish'),
            'description'         => __('Provides critical instructions and code snippets for writing a Node.js Puppeteer script to automatically accept staged layouts, inspect the DOM, and take screenshots. MUST BE READ before attempting browser automation.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'context' => [
                        'type' => 'string',
                        'description' => 'Optional context (e.g. "accept_schema", "screenshot")'
                    ]
                ]
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'guideline' => ['type' => 'string'],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'handle'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
