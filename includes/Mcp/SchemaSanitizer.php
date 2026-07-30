<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

use WP\McpSchema\Server\Tools\DTO\Tool;

/**
 * Repairs tool schemas before they are serialised for a client.
 *
 * JSON Schema requires `properties` to be an object. The DTOs only guard the root of a
 * schema, so a nested `properties` that is empty (common in REST-derived schemas, e.g. a
 * term's `meta` when no term meta is registered) encodes as `[]` and strict clients such
 * as Cursor reject the whole tools/list response.
 */
class SchemaSanitizer
{

    /**
     * @param mixed $tools
     * @param mixed $server
     * @return mixed
     */
    public static function sanitize_tools( $tools, $server = null )
    {
        if ( ! is_array( $tools ) ) {
            return $tools;
        }

        foreach ( $tools as $index => $tool ) {
            if ( ! $tool instanceof Tool ) {
                continue;
            }

            $data    = $tool->toArray();
            $changed = false;

            foreach ( [ 'inputSchema', 'outputSchema' ] as $key ) {
                if ( ! isset( $data[ $key ] ) || ! is_array( $data[ $key ] ) ) {
                    continue;
                }

                $data[ $key ] = self::fix_schema( $data[ $key ], $changed );
            }

            if ( ! $changed ) {
                continue;
            }

            try {
                $tools[ $index ] = Tool::fromArray( $data );
            } catch ( \Throwable $e ) {
                // Leave the original tool in place rather than dropping it from the list.
                continue;
            }
        }

        return $tools;
    }

    /**
     * Walks the property map of a schema root. The root itself is left alone because the
     * DTO already emits an empty root `properties` as an object.
     *
     * @param array $schema
     * @param bool  $changed
     * @return array
     */
    private static function fix_schema( array $schema, &$changed ): array
    {
        $properties = $schema['properties'] ?? null;

        if ( $properties instanceof \stdClass ) {
            $properties = (array) $properties;
        }

        if ( ! is_array( $properties ) || empty( $properties ) ) {
            return $schema;
        }

        foreach ( $properties as $name => $value ) {
            $properties[ $name ] = self::fix( $value, $changed );
        }

        $schema['properties'] = $properties;

        return $schema;
    }

    /**
     * @param mixed $node
     * @param bool  $changed
     * @return mixed
     */
    private static function fix( $node, &$changed )
    {
        if ( $node instanceof \stdClass ) {
            // An empty object is already correct; only unwrap when there is something to walk.
            if ( empty( (array) $node ) ) {
                return $node;
            }

            $node = (array) $node;
        }

        if ( ! is_array( $node ) ) {
            return $node;
        }

        foreach ( $node as $key => $value ) {
            if ( 'properties' === $key && self::is_empty_map( $value ) ) {
                $node[ $key ] = new \stdClass();
                $changed      = true;
                continue;
            }

            $node[ $key ] = self::fix( $value, $changed );
        }

        return $node;
    }

    /**
     * @param mixed $value
     * @return bool
     */
    private static function is_empty_map( $value ): bool
    {
        if ( $value instanceof \stdClass ) {
            return false;
        }

        return is_array( $value ) && empty( $value );
    }
}
