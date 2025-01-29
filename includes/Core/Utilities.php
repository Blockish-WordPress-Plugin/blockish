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

                            $value = str_replace($placeholder, $attribute_value ?? '', $value);
                            break;

                        case '{{TOP}}':
                            $top_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['top']) && (is_string($attribute['top']) || is_numeric($attribute['top']))) {
                                $top_value = $attribute['top'];
                            }

                            if (!empty($top_value) && strpos($top_value, 'var:preset|spacing') !== false) {
                                $top_value = 'var(' . str_replace(['var:', '|'], ['--wp--', '--'], $top_value) . ')';
                            }

                            $value = str_replace($placeholder, $top_value ?? '', $value);
                            break;

                        case '{{BOTTOM}}':
                            $bottom_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['bottom']) && (is_string($attribute['bottom']) || is_numeric($attribute['bottom']))) {
                                $bottom_value = $attribute['bottom'];
                            }

                            if (!empty($bottom_value) && strpos($bottom_value, 'var:preset|spacing') !== false) {
                                $bottom_value = 'var(' . str_replace(['var:', '|'], ['--wp--', '--'], $bottom_value) . ')';
                            }

                            $value = str_replace($placeholder, $bottom_value ?? '', $value);
                            break;

                        case '{{LEFT}}':
                            $left_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['left']) && (is_string($attribute['left']) || is_numeric($attribute['left']))) {
                                $left_value = $attribute['left'];
                            }

                            if (!empty($left_value) && strpos($left_value, 'var:preset|spacing') !== false) {
                                $left_value = 'var(' . str_replace(['var:', '|'], ['--wp--', '--'], $left_value) . ')';
                            }

                            $value = str_replace($placeholder, $left_value ?? '', $value);
                            break;

                        case '{{RIGHT}}':
                            $right_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['right']) && (is_string($attribute['right']) || is_numeric($attribute['right']))) {
                                $right_value = $attribute['right'];
                            }

                            if (!empty($right_value) && strpos($right_value, 'var:preset|spacing') !== false) {
                                $right_value = 'var(' . str_replace(['var:', '|'], ['--wp--', '--'], $right_value) . ')';
                            }

                            $value = str_replace($placeholder, $right_value ?? '', $value);
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
