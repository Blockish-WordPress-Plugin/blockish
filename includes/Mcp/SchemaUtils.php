<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

class SchemaUtils
{
    /**
     * Find the first blockish/ai-preview block in content, if any.
     */
    public static function find_ai_preview_block( string $content ): ?array {
        foreach ( parse_blocks( $content ) as $block ) {
            if ( ! empty( $block['blockName'] ) && 'blockish/ai-preview' === $block['blockName'] ) {
                return $block;
            }
        }
        return null;
    }

    public static function content_has_ai_preview( string $content ): bool {
        return null !== self::find_ai_preview_block( $content );
    }

    /**
     * Decode a schema attribute (JSON string or array) to a schema node list.
     */
    public static function decode_schema_attr( $value ): array {
        if ( is_array( $value ) ) {
            if ( isset( $value['name'] ) && is_string( $value['name'] ) ) {
                return [ $value ];
            }
            return $value;
        }

        if ( ! is_string( $value ) || '' === trim( $value ) ) {
            return [];
        }

        $decoded = json_decode( $value, true );
        if ( ! is_array( $decoded ) ) {
            return [];
        }

        if ( isset( $decoded['name'] ) && is_string( $decoded['name'] ) ) {
            return [ $decoded ];
        }

        return $decoded;
    }

    /**
     * Resolve the schema AI should edit:
     * - ai-preview in content → pendingSchema (staged truth)
     * - else → schema parsed from content
     */
    public static function resolve_schema_from_content( string $content ): array {
        $preview = self::find_ai_preview_block( $content );
        if ( $preview ) {
            $pending = self::decode_schema_attr( $preview['attrs']['pendingSchema'] ?? '' );
            if ( ! empty( $pending ) ) {
                return $pending;
            }
            return self::decode_schema_attr( $preview['attrs']['previousSchema'] ?? '' );
        }

        return self::convert_to_js_schema( parse_blocks( $content ) );
    }

    /**
     * Stage AI output as a single dynamic ai-preview block in content.
     * Re-stage keeps previousSchema and only replaces pendingSchema.
     * Empty pending clears content.
     */
    public static function build_staged_ai_preview_content( string $existing_content, array $pending_schema ): string {
        if ( empty( $pending_schema ) ) {
            return '';
        }

        $pending_schema = BlockSchemaMeta::force_required_attributes( $pending_schema );

        $preview = self::find_ai_preview_block( $existing_content );
        if ( $preview ) {
            $previous = self::decode_schema_attr( $preview['attrs']['previousSchema'] ?? '' );
        } else {
            $previous = self::convert_to_js_schema( parse_blocks( $existing_content ) );
        }

        $previous_json = wp_json_encode( $previous );
        $pending_json  = wp_json_encode( $pending_schema );
        if ( false === $previous_json || false === $pending_json ) {
            return '';
        }

        $block = [
            'blockName'    => 'blockish/ai-preview',
            'attrs'        => [
                'previousSchema' => $previous_json,
                'pendingSchema'  => $pending_json,
            ],
            'innerBlocks'  => [],
            'innerHTML'    => '',
            'innerContent' => [],
        ];

        return serialize_blocks( [ $block ] );
    }

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

    /**
     * Load schema_file: must exist, valid JSON, and schema node shape.
     *
     * @return array|string Decoded schema array, or error string.
     */
    public static function load_schema_file( string $path ) {
        if ( '' === $path || ! file_exists( $path ) ) {
            return 'schema_file not found: ' . $path;
        }

        $json = file_get_contents( $path );
        if ( false === $json ) {
            return 'Could not read schema_file: ' . $path;
        }

        $decoded = json_decode( $json, true );
        if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $decoded ) ) {
            return 'schema_file must contain valid JSON (array of block schema nodes).';
        }

        $shape_error = self::validate_schema_shape( $decoded );
        if ( $shape_error ) {
            return $shape_error;
        }

        return $decoded;
    }

    /**
     * Validate block schema nodes: each needs name; attributes object; innerBlocks array when present.
     *
     * @param array $nodes
     * @return string|null Error message or null if ok.
     */
    public static function validate_schema_shape( array $nodes ): ?string {
        // Allow a single root object by normalizing callers; here we expect a list.
        if ( isset( $nodes['name'] ) && is_string( $nodes['name'] ) ) {
            $nodes = [ $nodes ];
        }

        if ( array_keys( $nodes ) !== range( 0, count( $nodes ) - 1 ) && ! empty( $nodes ) ) {
            // Associative non-list without name — not a schema tree.
            if ( ! isset( $nodes[0] ) ) {
                return 'schema_file JSON must be an array of {name, attributes, innerBlocks} nodes.';
            }
        }

        foreach ( $nodes as $i => $node ) {
            if ( ! is_array( $node ) ) {
                return 'Invalid schema node at index ' . $i . ': expected object.';
            }
            if ( empty( $node['name'] ) || ! is_string( $node['name'] ) ) {
                return 'Invalid schema node at index ' . $i . ': "name" (string) is required.';
            }
            if ( array_key_exists( 'attributes', $node ) && ! is_array( $node['attributes'] ) ) {
                return 'Invalid schema node "' . $node['name'] . '": "attributes" must be an object.';
            }
            if ( array_key_exists( 'innerBlocks', $node ) ) {
                if ( ! is_array( $node['innerBlocks'] ) ) {
                    return 'Invalid schema node "' . $node['name'] . '": "innerBlocks" must be an array.';
                }
                $child_error = self::validate_schema_shape( $node['innerBlocks'] );
                if ( $child_error ) {
                    return $child_error;
                }
            }
        }

        return null;
    }

    /**
     * Whether post content is empty enough for live pattern-ref assembly
     * (no real blocks and no staged ai-preview).
     */
    public static function is_assembly_target_empty( string $content, int $post_id = 0 ): bool {
        if ( ! self::is_content_effectively_empty( $content ) ) {
            return false;
        }

        if ( self::content_has_ai_preview( $content ) ) {
            return false;
        }

        return true;
    }

    /**
     * True when content is blank or only empty whitespace / empty paragraphs.
     */
    public static function is_content_effectively_empty( string $content ): bool {
        if ( '' === trim( $content ) ) {
            return true;
        }

        $blocks = parse_blocks( $content );
        foreach ( $blocks as $block ) {
            if ( empty( $block['blockName'] ) ) {
                if ( '' !== trim( $block['innerHTML'] ?? '' ) ) {
                    return false;
                }
                continue;
            }
            if ( 'core/paragraph' === $block['blockName'] ) {
                if ( '' !== trim( wp_strip_all_tags( $block['innerHTML'] ?? '' ) ) ) {
                    return false;
                }
                continue;
            }
            return false;
        }

        return true;
    }

    /**
     * post_content for manage-post assembly must be only core/block pattern refs
     * pointing at existing wp_block posts with no staged ai-preview.
     *
     * @return string|null Error or null if ok.
     */
    public static function validate_pattern_ref_markup( string $content ): ?string {
        $blocks = parse_blocks( $content );
        $refs   = [];

        foreach ( $blocks as $block ) {
            if ( empty( $block['blockName'] ) ) {
                if ( '' !== trim( $block['innerHTML'] ?? '' ) ) {
                    return 'post_content may only contain synced pattern refs (<!-- wp:block {"ref":ID} /-->). Remove other markup.';
                }
                continue;
            }

            if ( 'core/block' !== $block['blockName'] ) {
                return 'post_content may only contain core/block pattern refs. Found "' . $block['blockName'] . '". Use block_schema for non-empty pages, or manage-pattern for section design.';
            }

            $ref = isset( $block['attrs']['ref'] ) ? absint( $block['attrs']['ref'] ) : 0;
            if ( $ref < 1 ) {
                return 'Each core/block in post_content must have a numeric attributes.ref pattern ID.';
            }

            $pattern = get_post( $ref );
            if ( ! $pattern || 'wp_block' !== $pattern->post_type ) {
                return 'Pattern ref ' . $ref . ' is not a valid wp_block. Create the pattern with blockish/manage-pattern first and use the returned ID.';
            }

            if ( self::content_has_ai_preview( (string) $pattern->post_content ) ) {
                $edit = get_edit_post_link( $ref, 'raw' );
                return 'Pattern ' . $ref . ' still has a staged AI preview. Accept it in the editor first'
                    . ( $edit ? ( ': ' . $edit ) : '.' );
            }

            $refs[] = $ref;
        }

        if ( empty( $refs ) ) {
            return 'post_content must include at least one <!-- wp:block {"ref":ID} /--> pattern ref.';
        }

        return null;
    }
}
