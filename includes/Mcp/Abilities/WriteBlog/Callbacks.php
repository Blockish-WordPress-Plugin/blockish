<?php

namespace Blockish\Mcp\Abilities\WriteBlog;

use Blockish\Mcp\Abilities\ManagePost\Callbacks as ManagePostCallbacks;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function write_blog( $input ): array
    {
        if ( empty( $input['post_type'] ) ) {
            $input['post_type'] = 'post';
        }
        return ManagePostCallbacks::manage_post( $input );
    }
}
