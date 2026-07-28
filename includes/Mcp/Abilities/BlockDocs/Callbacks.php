<?php

namespace Blockish\Mcp\Abilities\BlockDocs;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_block_docs( $_input ): array
    {
        $requested_blocks = isset( $_input['block_names'] ) && is_array( $_input['block_names'] )
            ? array_values( array_filter( array_map( 'strval', $_input['block_names'] ) ) )
            : [];

        if ( empty( $requested_blocks ) ) {
            return [
                'error'      => 'block_names is required. Do not fetch the full library — it wastes context. Choose the blocks you need from `blocks` (and related addons from `extensions`), then call again with those names, e.g. block_names: ["blockish/container", "blockish/heading", "blockish/button"].',
                'blocks'     => get_option( 'blockish_block_list', [] ),
                'extensions' => get_option( 'blockish_extension_list', [] ),
            ];
        }

        $docs_dir = plugin_dir_path( __FILE__ ) . '../../docs/';

        $content = '';

        $core_file = $docs_dir . 'core.md';
        if ( is_readable( $core_file ) ) {
            $content .= file_get_contents( $core_file ) . "\n\n";
        }

        $content .= "## 7. Per-block reference\n\n";

        $missing = [];
        foreach ( $requested_blocks as $block_name ) {
            // Addon packages append their own docs via blockish_mcp_block_docs.
            if (
                'blockish-forms' === $block_name
                || 'blockish-dynamicity' === $block_name
                || str_starts_with( $block_name, 'blockish-forms/' )
                || str_starts_with( $block_name, 'blockish-dynamicity/' )
            ) {
                continue;
            }
            $slug     = str_replace( 'blockish/', '', $block_name );
            $filename = $slug . '.md';
            $file     = $docs_dir . 'blocks/' . basename( $filename );
            if ( is_readable( $file ) ) {
                $content .= file_get_contents( $file ) . "\n\n";
            } else {
                $missing[] = $block_name;
            }
        }

        $footer_file = $docs_dir . 'core-footer.md';
        if ( is_readable( $footer_file ) ) {
            $content .= file_get_contents( $footer_file ) . "\n\n";
        }

        $content = apply_filters( 'blockish_mcp_block_docs', $content, $requested_blocks );

        $result = [ 'docs' => $content ];

        if ( ! empty( $missing ) ) {
            $result['warning'] = 'No docs file for: ' . implode( ', ', $missing ) . '. Check `blocks` / `extensions` for valid names, then retry.';
            $result['blocks']  = get_option( 'blockish_block_list', [] );
            $result['extensions'] = get_option( 'blockish_extension_list', [] );
        }

        return $result;
    }
}
