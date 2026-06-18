<?php

namespace Blockish\Mcp\Abilities\PostTypes;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_post_types( $_input ): array
    {
        $types  = get_post_types( [], 'objects' );
        $result = [];

        foreach ( $types as $type ) {
            $result[ $type->name ] = [
                'label'        => $type->label,
                'public'       => $type->public,
                'hierarchical' => $type->hierarchical,
            ];
        }

        return $result;
    }
}
