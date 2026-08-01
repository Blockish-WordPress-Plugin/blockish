<?php

namespace Blockish\Mcp\Abilities\ManageOptions;

defined('ABSPATH') || exit;

class Callbacks
{
    private static array $default_keys = [
        // WordPress Core Options
        'blogname',
        'blogdescription',
        'date_format',
        'time_format',
        'posts_per_page',
        'page_on_front',
        'page_for_posts',
        'show_on_front',
        'default_category',
        'default_comment_status',
        'timezone_string',
        // siteurl / home intentionally omitted — wrong values break the whole site.

        // Blockish Options
        'blockish_global_meta_description',
        'blockish_device_list'
    ];

    public static function manage_options(array $args): array
    {
        $action = $args['action'] ?? '';

        if ($action === 'get') {
            return self::get_options($args);
        } elseif ($action === 'update') {
            return self::update_options($args);
        }

        return ['error' => 'Invalid action. Use "get" or "update".'];
    }

    private static function is_key_allowed(string $key): bool
    {
        if (in_array($key, self::$default_keys, true)) {
            return true;
        }

        if (strpos($key, 'blockish_') === 0) {
            return true;
        }

        return false;
    }

    private static function get_options(array $args): array
    {
        $keys = $args['keys'] ?? [];
        
        if (empty($keys) || !is_array($keys)) {
            $keys = self::$default_keys; // default to core and blockish keys if none specified
        }

        $data = [];
        foreach ($keys as $key) {
            if (self::is_key_allowed($key)) {
                $data[$key] = get_option($key);
            } else {
                $data[$key] = null; // Or indicate it's not allowed
            }
        }

        return ['data' => $data];
    }

    private static function update_options(array $args): array
    {
        $values = $args['values'] ?? [];

        if (empty($values) || !is_array($values)) {
            return ['error' => 'Values must be a non-empty object map.'];
        }

        $updated = [];
        $failed = [];

        foreach ($values as $key => $value) {
            if (self::is_key_allowed($key)) {
                update_option($key, $value);
                $updated[] = $key;
            } else {
                $failed[] = $key;
            }
        }

        return [
            'data' => [
                'message' => 'Update operation completed.',
                'updated' => $updated,
                'not_allowed' => $failed,
            ]
        ];
    }
}
