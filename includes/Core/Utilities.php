<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

class Utilities
{
    public static function get_filesystem()
    {
        // Check if WP_Filesystem is available
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Initialize WP_Filesystem
        WP_Filesystem();
    }

    public static function generate_uniqueId($length)
    {
        return substr(bin2hex(random_bytes($length / 2)), 0, $length);
    }

    public static function get_block_metadata($block_name)
    {
        self::get_filesystem();

        global $wp_filesystem;

        $block_metadata_path = BLOCKISH_DIR . '/build/blocks/' . $block_name . '/block.json';

        if (!is_readable($block_metadata_path)) {
            return false;
        }

        $metadata = $wp_filesystem->get_contents($block_metadata_path);

        if (empty($metadata)) {
            return false;
        }

        $decoded_metadata = json_decode($metadata, true);

        if (empty($decoded_metadata)) {
            return false;
        }

        return $decoded_metadata;
    }

    public static function replace_css_placeholders($value, $attribute)
    {
        if (!empty($attribute)) {
            foreach (BLOCKISH_RESERVED_PLACEHOLDERS as $placeholder) {
                if (strpos($value, $placeholder) !== false) {
                    switch ($placeholder) {
                        case '{{VALUE}}':
                            $attribute_value = '';
                            if ($attribute && (is_string($attribute) || is_numeric($attribute))) {
                                $attribute_value = $attribute;
                            }

                            if ($attribute && is_array($attribute) && !empty($attribute['value']) && is_string($attribute['value'])) {
                                $attribute_value = $attribute['value'];
                            }
                            
                            $value = str_replace($placeholder, $attribute_value, $value);
                            break;
                        case '{{TOP}}':
                            $value = str_replace($placeholder, $attribute['top'] ?? '', $value);
                            break;
                        case '{{BOTTOM}}':
                            $value = str_replace($placeholder, $attribute['bottom'] ?? '', $value);
                            break;
                        case '{{LEFT}}':
                            $value = str_replace($placeholder, $attribute['left'] ?? '', $value);
                            break;
                        case '{{RIGHT}}':
                            $value = str_replace($placeholder, $attribute['right'] ?? '', $value);
                            break;
                    }
                }
            }
        }

        return $value;
    }

    public static function generate_css_string($css_rules, $breakpoints)
    {
        $final_css = '';

        foreach ($breakpoints as $breakpoint_key => $breakpoint) {
            $css_string = '';
            if (isset($css_rules[$breakpoint_key])) {
                foreach ($css_rules[$breakpoint_key] as $selector => $rules) {
                    $css_string .= "{$selector}{{$rules}}";
                }
            }

            if ($breakpoint_key === 'Desktop') {
                $final_css .= $css_string;
            } else {
                $final_css .= "@media screen and (max-width: {$breakpoint}){{$css_string}}";
            }
        }

        return $final_css;
    }

    public static function minify_css($css)
    {
        // Remove comments and unnecessary spaces
        $css = preg_replace('!/\*.*?\*/!s', '', $css);
        $css = preg_replace('/\s+/', ' ', $css);
        $css = preg_replace('/\s*([{}|:;,])\s*/', '$1', $css);
        $css = preg_replace('/;}/', '}', $css);
        return trim($css);
    }
}
