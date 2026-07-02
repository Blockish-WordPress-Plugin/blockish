<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

class SEO
{
    use \Blockish\Traits\SingletonTrait;

    private function __construct()
    {
        add_action('wp_head', [$this, 'output_meta_description'], 1);
    }

    public function output_meta_description()
    {
        $global_meta = get_option('blockish_global_meta_description', '');

        // For a global setting, we might want it only on the front page, 
        // or as a fallback if the page doesn't have a specific description.
        // The user said "Global Meta Description", so we output it if it exists.
        // To be safe, we'll output it on the front page if it's set.
        if (is_front_page() && '' !== trim($global_meta)) {
            printf(
                '<meta name="description" content="%s" />' . "\n",
                esc_attr(trim($global_meta))
            );
        }
    }
}
