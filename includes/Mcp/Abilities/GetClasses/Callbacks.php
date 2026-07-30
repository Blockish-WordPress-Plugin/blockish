<?php

namespace Blockish\Mcp\Abilities\GetClasses;

use Blockish\Extensions\ClassUsage;
use Blockish\Mcp\Converter\ClassStyleConverter;

defined('ABSPATH') || exit;

class Callbacks
{
    /**
     * AI-facing list: parent classes only, each with combined CSS
     * (parent root + children rewritten as .slug:hover / .slug h2 / …).
     * Child posts exist for the Class Manager UI but are hidden from AI.
     */
    public static function get_classes( $input ): array
    {
        $include_usage = is_array( $input ) && ! empty( $input['include_usage'] );
        $usage_report  = $include_usage ? ClassUsage::report() : null;
        $usage_by_id   = is_array( $usage_report ) ? ( $usage_report['classes'] ?? [] ) : [];

        $posts = get_posts( [
            'post_type'      => 'blockish-classes',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'post_parent'    => 0,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ] );

        $result = [];

        foreach ( $posts as $post ) {
            $css_selector = self::build_selector( $post->ID, $post->post_title, 0 );

            $item = [
                'post_id'      => $post->ID,
                'name'         => $post->post_title,
                'css_selector' => $css_selector,
                'css'          => self::combined_css_for_parent( (int) $post->ID ),
            ];

            if ( $include_usage ) {
                $usage = $usage_by_id[ (int) $post->ID ] ?? null;
                $item['usage_count'] = is_array( $usage ) ? (int) ( $usage['usage_count'] ?? 0 ) : 0;
                $item['used_in']     = is_array( $usage ) ? ( $usage['used_in'] ?? [] ) : [];
            }

            $result[ $post->ID ] = $item;
        }

        return $result;
    }

    /**
     * Rebuild the AI stylesheet for a parent: root + each child remainder.
     */
    public static function combined_css_for_parent( int $parent_id ): string
    {
        $parent = get_post( $parent_id );
        if ( ! $parent || 'blockish-classes' !== $parent->post_type ) {
            return '';
        }

        $slug = self::normalize_slug( (string) $parent->post_title );
        if ( '' === $slug ) {
            return '';
        }

        $parent_content = json_decode( (string) $parent->post_content, true );
        if ( ! is_array( $parent_content ) ) {
            $parent_content = [];
        }

        $children_posts = get_posts([
            'post_type'      => 'blockish-classes',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'post_parent'    => $parent_id,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ]);

        $children = [];
        foreach ( $children_posts as $child ) {
            $content = json_decode( (string) $child->post_content, true );
            $children[] = [
                'name'    => (string) $child->post_title,
                'content' => is_array( $content ) ? $content : [],
            ];
        }

        return ClassStyleConverter::class_tree_to_css( $parent_content, $children, $slug );
    }

    /**
     * Builds the CSS selector a class targets, mirroring the editor's
     * generateClassSelector(): a parent uses ".{slug}"; a child appends its
     * title to ".{parent-slug}.blockish-cm-{id}" — directly when the title is a
     * pseudo (starts with ":"), or as a descendant (with a space) otherwise.
     */
    public static function build_selector( $id, string $title, $parent_id ): string
    {
        $title = trim( $title );
        if ( '' === $title ) {
            return '';
        }

        if ( empty( $parent_id ) ) {
            $slug = self::normalize_slug( $title );
            return $slug ? '.' . $slug : '';
        }

        $parent      = get_post( (int) $parent_id );
        $parent_slug = $parent ? self::normalize_slug( $parent->post_title ) : '';
        $base        = ( $parent_slug ? '.' . $parent_slug : '' ) . '.blockish-cm-' . (int) $id;

        return 0 === strpos( $title, ':' ) ? $base . $title : $base . ' ' . $title;
    }

    public static function normalize_slug( string $value ): string
    {
        return ClassStyleConverter::normalize_slug( $value );
    }
}
