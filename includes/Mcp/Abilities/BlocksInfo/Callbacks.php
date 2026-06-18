<?php

namespace Blockish\Mcp\Abilities\BlocksInfo;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_blocks_info( $_input ): array
    {
        return get_option( 'blockish_block_list', [] );
    }
}
