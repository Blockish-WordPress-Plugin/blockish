<?php

namespace Blockish\Mcp\Abilities\ExtensionsInfo;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_extensions_info( $_input ): array
    {
        $list = get_option( 'blockish_extension_list', [] );
        if ( is_array( $list ) ) {
            unset( $list['animation'] );
        }
        return is_array( $list ) ? $list : [];
    }
}
