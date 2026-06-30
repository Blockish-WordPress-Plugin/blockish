<?php

namespace Blockish\Mcp\Abilities\ManageTerm;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function manage_term( $input ): array
    {
        $taxonomy = $input['taxonomy'] ?? '';
        if ( empty( $taxonomy ) || ! taxonomy_exists( $taxonomy ) ) {
            return [ 'error' => 'Invalid or missing taxonomy.' ];
        }

        $editing = ! empty( $input['term_id'] );
        $args    = [];

        if ( isset( $input['description'] ) ) {
            $args['description'] = $input['description'];
        }
        if ( isset( $input['slug'] ) ) {
            $args['slug'] = $input['slug'];
        }
        if ( isset( $input['parent'] ) ) {
            $args['parent'] = absint( $input['parent'] );
        }

        if ( $editing ) {
            $term_id = absint( $input['term_id'] );
            
            if ( isset( $input['name'] ) && ! empty( $input['name'] ) ) {
                $args['name'] = $input['name'];
            }

            $result = wp_update_term( $term_id, $taxonomy, $args );
        } else {
            if ( empty( $input['name'] ) ) {
                return [ 'error' => 'Name is required when creating a term.' ];
            }

            $result = wp_insert_term( $input['name'], $taxonomy, $args );
        }

        if ( is_wp_error( $result ) ) {
            return [ 'error' => $result->get_error_message() ];
        }

        $term = get_term( $result['term_id'], $taxonomy );
        if ( is_wp_error( $term ) || ! $term ) {
            return [ 'error' => 'Term created/updated but could not be retrieved.' ];
        }

        return [
            'term_id'          => $term->term_id,
            'term_taxonomy_id' => $term->term_taxonomy_id,
            'taxonomy'         => $term->taxonomy,
            'name'             => $term->name,
            'slug'             => $term->slug,
        ];
    }
}
