<?php

namespace Blockish\Mcp\Abilities\BlockDocs;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_block_docs( $_input ): array
    {
        $file = plugin_dir_path( __FILE__ ) . '../../block-docs.md';
        $content = is_readable( $file ) ? file_get_contents( $file ) : '';

        return [ 'docs' => $content ];
    }
}
