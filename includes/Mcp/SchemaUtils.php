<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

class SchemaUtils
{
    /**
     * Recursively formats a parsed Gutenberg block array into the JS block schema expected by Blockish MCP abilities.
     * Maps 'blockName' to 'name', 'attrs' to 'attributes', and strips null blocks and raw HTML content.
     */
    public static function convert_to_js_schema( array $blocks ): array {
        $schema = [];
        foreach ( $blocks as $block ) {
            if ( empty( $block['blockName'] ) ) {
                continue;
            }

            $schema_block = [
                'name'       => $block['blockName'],
                'attributes' => isset( $block['attrs'] ) ? $block['attrs'] : [],
            ];

            if ( ! empty( $block['innerBlocks'] ) ) {
                $schema_block['innerBlocks'] = self::convert_to_js_schema( $block['innerBlocks'] );
            } else {
                $schema_block['innerBlocks'] = [];
            }

            $schema[] = $schema_block;
        }
        return $schema;
    }
}
