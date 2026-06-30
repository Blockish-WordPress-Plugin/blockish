<?php

namespace Blockish\Mcp\Abilities\GetDesignerWorkflow;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/get-designer-workflow';

    public static function get(): array
    {
        return [
            'label'               => __('Get Designer Workflow', 'blockish'),
            'description'         => __('Call this tool before starting any website design task to get the strict workflow and best practices (SOP).', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [],
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'workflow' => [
                        'type' => 'array',
                        'items' => ['type' => 'string']
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'get_workflow'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
            ],
        ];
    }
}
