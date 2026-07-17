<?php

namespace Blockish\Mcp\Abilities\ManagePattern;

use Blockish\Mcp\Abilities\ManagePost\Callbacks as ManagePostCallbacks;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_pattern( $input ): array
    {
        // Force the post_type to wp_block
        $input['post_type']   = 'wp_block';
        $input['post_status'] = 'publish';

        // Delegate the actual staging and saving to ManagePost
        $result = ManagePostCallbacks::manage_post( $input );

        if ( isset( $result['error'] ) ) {
            return $result;
        }

        $out = [
            'pattern_id'    => $result['post_id'] ?? 0,
            'post_status'   => $result['post_status'] ?? '',
            'schema_staged' => $result['schema_staged'] ?? false,
        ];
        if ( ! empty( $result['warnings'] ) ) {
            $out['warnings'] = $result['warnings'];
        }
        return $out;
    }
}
