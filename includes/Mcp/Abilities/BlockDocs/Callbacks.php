<?php

namespace Blockish\Mcp\Abilities\BlockDocs;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_block_docs( $_input ): array
    {
        $docs_dir = plugin_dir_path( __FILE__ ) . '../../docs/';
        
        $content = '';
        
        // Read core.md
        $core_file = $docs_dir . 'core.md';
        if ( is_readable( $core_file ) ) {
            $content .= file_get_contents( $core_file ) . "\n\n";
        }
        
        // Read all block files
        $content .= "## 7. Per-block reference\n\n";
        $block_files = glob( $docs_dir . 'blocks/*.md' );
        if ( $block_files ) {
            foreach ( $block_files as $file ) {
                if ( is_readable( $file ) ) {
                    $content .= file_get_contents( $file ) . "\n\n";
                }
            }
        }
        
        // Read core-footer.md
        $footer_file = $docs_dir . 'core-footer.md';
        if ( is_readable( $footer_file ) ) {
            $content .= file_get_contents( $footer_file ) . "\n\n";
        }
        
        // Apply filter for extensions/addons to append their docs
        $content = apply_filters( 'blockish_mcp_block_docs', $content );

        return [ 'docs' => $content ];
    }
}
