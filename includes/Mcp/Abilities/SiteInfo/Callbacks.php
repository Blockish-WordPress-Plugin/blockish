<?php

namespace Blockish\Mcp\Abilities\SiteInfo;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_site_info( $_input ): array
    {
        return [
            'name'        => get_bloginfo('name'),
            'description' => get_bloginfo('description'),
            'url'         => home_url(),
            'wp_version'  => get_bloginfo('version'),
        ];
    }
}
