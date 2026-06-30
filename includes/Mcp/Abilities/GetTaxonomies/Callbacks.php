<?php

namespace Blockish\Mcp\Abilities\GetTaxonomies;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_taxonomies( $_input ): array
    {
        $taxonomies = get_taxonomies( [], 'objects' );
        $result     = [];

        foreach ( $taxonomies as $tax ) {
            $result[ $tax->name ] = [
                'label'        => $tax->label,
                'public'       => $tax->public,
                'hierarchical' => $tax->hierarchical,
                'post_types'   => $tax->object_type,
            ];
        }

        return $result;
    }
}
