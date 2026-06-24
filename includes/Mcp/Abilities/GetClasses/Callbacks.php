<?php

namespace Blockish\Mcp\Abilities\GetClasses;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_classes( $_input ): array
    {
        $posts = get_posts( [
            'post_type'      => 'blockish-classes',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ] );

        $result = [];

        foreach ( $posts as $post ) {
            $is_child     = (int) $post->post_parent > 0;
            $css_selector = self::build_selector( $post->ID, $post->post_title, $post->post_parent );

            $content = json_decode( (string) $post->post_content, true );

            $result[ $post->ID ] = [
                'post_id'      => $post->ID,
                'name'         => $post->post_title,
                'css_selector' => $css_selector,
                'parent_id'    => $is_child ? (int) $post->post_parent : null,
                'content'      => is_array( $content ) ? $content : new \stdClass(),
                'css'          => get_post_meta( $post->ID, 'blockishClassManagerStyles', true ),
            ];
        }

        return $result;
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
        $value = strtolower( trim( $value ) );
        $value = str_replace( ' ', '-', $value );
        $value = preg_replace( '/[^a-z0-9_-]/', '', $value );

        if ( ! is_string( $value ) || ! preg_match( '/^[a-z_][a-z0-9_-]*$/', $value ) ) {
            return '';
        }

        return $value;
    }
}
