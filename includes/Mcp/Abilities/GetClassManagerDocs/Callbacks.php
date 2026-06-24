<?php

namespace Blockish\Mcp\Abilities\GetClassManagerDocs;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_docs( $_input ): array
    {
        $file    = plugin_dir_path( __FILE__ ) . '../../class-manager-docs.md';
        $content = is_readable( $file ) ? file_get_contents( $file ) : '';

        return [ 'docs' => $content ];
    }
}
