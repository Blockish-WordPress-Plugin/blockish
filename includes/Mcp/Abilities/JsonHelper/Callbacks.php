<?php

namespace Blockish\Mcp\Abilities\JsonHelper;

defined('ABSPATH') || exit;

use WP_Error;

class Callbacks
{
    public static function execute(array $_input): array|WP_Error
    {
        $action = $_input['action'] ?? '';
        $data   = $_input['data'] ?? null;

        if ($action === 'stringify') {
            // Encode data to string
            $result = wp_json_encode($data);
            if ($result === false) {
                return new WP_Error('json_encode_error', __('Failed to stringify JSON data.', 'blockish'));
            }
            return ['result' => $result];
        } elseif ($action === 'parse') {
            // Decode string to object/array
            if (!is_string($data)) {
                return new WP_Error('invalid_data', __('Data must be a string for parse action.', 'blockish'));
            }
            $result = json_decode($data, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                return new WP_Error('json_decode_error', __('Failed to parse JSON string: ', 'blockish') . json_last_error_msg());
            }
            return ['result' => $result];
        }

        return new WP_Error('invalid_action', __('Action must be stringify or parse.', 'blockish'));
    }
}
