<?php

namespace Blockish\Mcp\Abilities\JsonHelper;

defined('ABSPATH') || exit;

class Config
{
    const NAME = 'blockish/json-helper';

    public static function get(): array
    {
        return [
            'label'               => __('JSON Helper', 'blockish'),
            'description'         => __('Helper to safely stringify a JSON object/array into a string, or parse a stringified JSON back into an object. Use this to avoid manual string escaping errors when building schemas for typography, backgrounds, etc.', 'blockish'),
            'category'            => 'blockish',
            'input_schema'        => [
                'type'       => 'object',
                'properties' => [
                    'action' => [
                        'type' => 'string',
                        'enum' => ['stringify', 'parse'],
                        'description' => 'The action to perform.',
                    ],
                    'data' => [
                        'description' => 'The data to process. If action is "stringify", pass a JSON object/array. If action is "parse", pass a string.',
                    ]
                ],
                'required' => ['action', 'data']
            ],
            'output_schema'       => [
                'type'       => 'object',
                'properties' => [
                    'result' => [
                        'description' => 'The processed result. If action was stringify, this is a string. If action was parse, this is an object/array.'
                    ],
                ],
            ],
            'execute_callback'    => [Callbacks::class, 'execute'],
            'permission_callback' => fn() => current_user_can('edit_posts'),
            'meta'                => [
                'mcp' => ['public' => true],
                'usage_notes' => 'Use this whenever you need to provide a Stringified-JSON attribute (like Typography or Background) to blockish/manage-post, and you want to be 100% sure the string escaping is valid.',
            ],
        ];
    }
}
