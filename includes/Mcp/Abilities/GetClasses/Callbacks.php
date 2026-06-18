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
            $is_child    = (int) $post->post_parent > 0;
            $slug        = self::normalize_slug( $post->post_title );
            $css_selector = $is_child
                ? '.blockish-cm-' . $post->ID
                : ( $slug ? '.' . $slug : '' );

            $result[ $post->ID ] = [
                'post_id'      => $post->ID,
                'name'         => $post->post_title,
                'css_selector' => $css_selector,
                'parent_id'    => $is_child ? (int) $post->post_parent : null,
                'css'          => get_post_meta( $post->ID, 'blockishClassManagerStyles', true ),
            ];
        }

        return $result;
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
