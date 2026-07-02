<?php

namespace Blockish\Mcp\Abilities\GetIcons;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_icons( $input ): array
    {
        $search_input = $input['search'] ?? '';
        $search_terms = [];
        if ( is_array( $search_input ) ) {
            foreach ( $search_input as $term ) {
                if ( is_string( $term ) && trim( $term ) !== '' ) {
                    $search_terms[] = strtolower( sanitize_text_field( $term ) );
                }
            }
        } elseif ( is_string( $search_input ) && trim( $search_input ) !== '' ) {
            $search_terms[] = strtolower( sanitize_text_field( $search_input ) );
        }

        $category = ! empty( $input['category'] ) ? sanitize_key( $input['category'] ) : 'all';
        $limit    = ! empty( $input['limit'] ) ? max( 1, absint( $input['limit'] ) ) : 20;

        $icons = self::load_all_icons();
        $results = [];

        // Pre-filter by category to save loop time
        if ( $category !== 'all' ) {
            $filtered_icons = [];
            foreach ( $icons as $icon ) {
                if ( isset($icon['category']) && $icon['category'] === $category ) {
                    $filtered_icons[] = $icon;
                }
            }
            $icons = $filtered_icons;
        }

        if ( empty( $search_terms ) ) {
            // No search terms, just return top $limit icons
            $results = array_slice( $icons, 0, $limit );
        } else {
            // Search per term to ensure each term gets up to $limit results
            foreach ( $search_terms as $search ) {
                $term_results = [];
                foreach ( $icons as $icon ) {
                    $label = isset($icon['label']) ? strtolower($icon['label']) : '';
                    $terms = isset($icon['terms']) && is_array($icon['terms']) ? $icon['terms'] : [];
                    $terms = array_map('strtolower', $terms);
                    
                    $matches_search = strpos( $label, $search ) !== false;
                    if ( ! $matches_search ) {
                        foreach ( $terms as $term ) {
                            if ( strpos( (string) $term, $search ) !== false ) {
                                $matches_search = true;
                                break;
                            }
                        }
                    }

                    if ( $matches_search ) {
                        $term_results[] = $icon;
                        if ( count( $term_results ) >= $limit ) {
                            break;
                        }
                    }
                }
                
                // Merge this term's results into global results (avoiding exact duplicates if terms overlap)
                foreach ( $term_results as $tr ) {
                    if ( ! in_array( $tr, $results, true ) ) {
                        $results[] = $tr;
                    }
                }
            }
        }

        return [ 'items' => $results ];
    }

    private static function load_all_icons(): array
    {
        $icons = [];
        $files = glob( BLOCKISH_DIR . 'build/*.json' );
        
        if ( ! $files ) {
            return $icons;
        }

        foreach ( $files as $file ) {
            // Only process Webpack-hashed files (e.g. 05bdf8735c0e2a89d312.json)
            if ( ! preg_match( '/^[a-f0-9]{20}\.json$/', basename( $file ) ) ) {
                continue;
            }

            $content = file_get_contents( $file );
            if ( ! $content ) {
                continue;
            }

            $data = json_decode( $content, true );
            
            // Check if this file actually contains our icon format
            // Icons have 'label', 'category', 'icon' structure
            if ( is_array( $data ) && ! empty( $data ) && isset( $data[0]['icon'], $data[0]['label'] ) ) {
                $icons = array_merge( $icons, $data );
            }
        }

        return $icons;
    }
}
