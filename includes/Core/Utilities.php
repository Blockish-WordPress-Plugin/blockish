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

    public static function generate_background_control_styles($background, $device)
    {
        if (empty($background) || ! is_string($background)) {
            return '';
        }

        $json_background = json_decode($background, true);
        if (! is_array($json_background)) {
            return '';
        }

        $styles          = '';
        $background_type = isset($json_background['backgroundType']) ? $json_background['backgroundType'] : 'classic';

        if ('classic' === $background_type) {
            $background_image = isset($json_background['backgroundImage'][$device]) ? $json_background['backgroundImage'][$device] : '';
            $resolution       = isset($json_background['backgroundImageResolution'][$device]) ? $json_background['backgroundImageResolution'][$device] : '';

            if (! empty($resolution)) {
                $background_image = $resolution;
            }

            if (! empty($background_image['url'])) {
                $styles .= 'background-image: url(' . esc_url($background_image['url']) . ');';
            }

            if (! empty($json_background['backgroundImagePosition'][$device]['value'])) {
                $styles .= 'background-position: ' . esc_attr($json_background['backgroundImagePosition'][$device]['value']) . ';';
            }

            if (! empty($json_background['backgroundImageAttachment']['value'])) {
                $styles .= 'background-attachment: ' . esc_attr($json_background['backgroundImageAttachment']['value']) . ';';
            }

            if (! empty($json_background['backgroundImageRepeat'][$device]['value'])) {
                $styles .= 'background-repeat: ' . esc_attr($json_background['backgroundImageRepeat'][$device]['value']) . ';';
            }

            if (! empty($json_background['backgroundImageSize'][$device]['value'])) {
                $styles .= 'background-size: ' . esc_attr($json_background['backgroundImageSize'][$device]['value']) . ';';
            }

            if ('Desktop' === $device && ! empty($json_background['backgroundImageBlendMode']['value'])) {
                $styles .= 'background-blend-mode: ' . esc_attr($json_background['backgroundImageBlendMode']['value']) . ';';
            }

            if ('Desktop' === $device && ! empty($json_background['backgroundColor'])) {
                $color = strpos($json_background['backgroundColor'], '|') !== false ? explode('|', $json_background['backgroundColor']) : $json_background['backgroundColor'];
                $styles .= 'background-color: ' . (is_array($color) ? 'var(' . esc_attr($color[0]) . ', ' . esc_attr($color[1]) . ')' : esc_attr($color)) . ';';
            }
        }

        if ('gradient' === $background_type && 'Desktop' === $device) {
            $gradient = strpos($json_background['gradient'], '|') !== false ? explode('|', $json_background['gradient']) : $json_background['gradient'];
            if (! empty($gradient)) {
                $styles .= 'background: ' . (is_array($gradient) ? 'var(' . esc_attr($gradient[0]) . ', ' . esc_attr($gradient[1]) . ')' : esc_attr($gradient)) . ';';
            }
        }

        return $styles;
    }

    public static function generate_border_control_styles($border, $device)
    {
        if (empty($border) || !is_string($border)) {
            return '';
        }

        $json_border = json_decode($border, true);
        if (!is_array($json_border)) {
            return '';
        }

        $styles = '';

        // Loop through each border property in the JSON object
        foreach ($json_border as $key => $value) {
            // Check for linked border (e.g., "border")
            if ($key === 'width' && isset($value[$device])) {
                $style = !empty($value['style']) ? $value['style'] : 'solid';
                $color = !empty($value['color']) ? $value['color'] : '#000';
                $styles .= 'border: ' . $value[$device] . ' ' . $style . ' ' . $color . ';';
            }

            // Check for unlinked borders (e.g., "top", "left", "right", "bottom")
            elseif (in_array($key, ['top', 'left', 'right', 'bottom'], true) && isset($value['width'][$device])) {
                $style = !empty($value['style']) ? $value['style'] : 'solid';
                $color = !empty($value['color']) ? $value['color'] : '#000';
                $styles .= 'border-' . $key . ': ' . $value['width'][$device] . ' ' . $style . ' ' . $color . ';';
            }
        }

        return $styles;
    }

    public static function generate_box_shadow_control_styles($box_shadows)
    {
        $styles = '';

        if (!empty($box_shadows)) {
            $json_box_shadows = json_decode($box_shadows, true);
            $shadows_string = [];

            foreach ($json_box_shadows as $shadow) {
                if ((isset($shadow['x']) || isset($shadow['y']))) {
                    $x = isset($shadow['x']) ? $shadow['x'] : "0";
                    $y = isset($shadow['y']) ? $shadow['y'] : "0";
                    $blur = isset($shadow['blur']) ? $shadow['blur'] : "0";
                    $spread = isset($shadow['spread']) ? $shadow['spread'] : "0";
                    $color = isset($shadow['color']) ? $shadow['color'] : 'rgba(0, 0, 0, 0.2)';
                    $inset = isset($shadow['inset']) && $shadow['inset'] ? 'inset' : '';
                    $shadows_string[] = <<<EOT
                    {$x} {$y} {$blur} {$spread} {$color} {$inset}
                EOT;
                }
            }
            $styles = count($shadows_string) > 0 ? 'box-shadow: ' . join(',', $shadows_string) . ';' : '';
        }

        return $styles;
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

                        case '{{TOP_LEFT}}':
                            $top_left_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['topLeft'])) {
                                $top_left_value = $attribute['topLeft'];
                            }

                            if ($attribute && is_string($attribute)) {
                                $top_left_value = $attribute;
                            }

                            $value = str_replace($placeholder, $top_left_value ?? '', $value);
                            break;

                        case '{{TOP_RIGHT}}':
                            $top_right_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['topRight'])) {
                                $top_right_value = $attribute['topRight'];
                            }

                            if ($attribute && is_string($attribute)) {
                                $top_right_value = $attribute;
                            }

                            $value = str_replace($placeholder, $top_right_value ?? '', $value);
                            break;

                        case '{{BOTTOM_LEFT}}':
                            $bottom_left_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['bottomLeft'])) {
                                $bottom_left_value = $attribute['bottomLeft'];
                            }

                            if ($attribute && is_string($attribute)) {
                                $bottom_left_value = $attribute;
                            }

                            $value = str_replace($placeholder, $bottom_left_value ?? '', $value);
                            break;

                        case '{{BOTTOM_RIGHT}}':
                            $bottom_right_value = '0';
                            if ($attribute && is_array($attribute) && isset($attribute['bottomRight'])) {
                                $bottom_right_value = $attribute['bottomRight'];
                            }

                            if ($attribute && is_string($attribute)) {
                                $bottom_right_value = $attribute;
                            }

                            $value = str_replace($placeholder, $bottom_right_value ?? '', $value);
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
            $device_slug = $breakpoint['slug'];
            $device_value = $breakpoint['value'];
            if (isset($css_rules[$device_slug])) {
                foreach ($css_rules[$device_slug] as $selector => $rules) {
                    $css_string .= "{$selector}{{$rules}}";
                }
            }

            if ($device_slug === 'Desktop') {
                $final_css .= $css_string;
            } else {
                $final_css .= "@media screen and (max-width: {$device_value}){{$css_string}}";
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

    public static function get_global_attributes()
    {
        self::get_filesystem();

        global $wp_filesystem;

        $global_metadata_path = BLOCKISH_DIR . '/build/global/block.json';

        if (!is_readable($global_metadata_path)) {
            return [];
        }

        $metadata = $wp_filesystem->get_contents($global_metadata_path);

        if (empty($metadata)) {
            return [];
        }

        $decoded_metadata = json_decode($metadata, true);

        if (empty($decoded_metadata['attributes'])) {
            return [];
        }

        return $decoded_metadata['attributes'];
    }

    public static function get_device_list()
    {
        return get_option('blockish_device_list', [
            [
                'label' => 'Desktop',
                'value' => 'base',
                'slug' => 'Desktop',
            ],
            [
                'label' => 'Tablet',
                'value' => '1024px',
                'slug' => 'Tablet',
            ],
            [
                'label' => 'Mobile',
                'value' => '768px',
                'slug' => 'Mobile',
            ]
        ]);
    }

    public static function is_resposive_value($attribute, $breakpoints)
    {
        return is_array($attribute) && array_intersect_key($attribute, array_flip(array_column($breakpoints, 'slug')));
    }
}
