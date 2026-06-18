<?php

namespace Blockish\Mcp\Abilities\ExtensionsInfo;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_extensions_info( $_input ): array
    {
        return get_option( 'blockish_extension_list', [] );
    }
}
