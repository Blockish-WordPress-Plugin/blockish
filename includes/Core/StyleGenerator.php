<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

class StyleGenerator
{
    use \Blockish\Traits\SingletonTrait;

    public $block_class = '';
    private $collected_block_css = ''; // Store CSS for all blocks
    private $block_count = 0;
    private $current_url = '';

    private function __construct()
    {
        if (!is_admin()) {
            add_filter('render_block_data', [$this, 'collect_block_css'], 10);
            add_filter('render_block', [$this, 'add_unique_class_to_block'], 10, 2);
            add_action('wp_enqueue_scripts', [$this, 'enqueue_block_styles']);
        }
        add_action('template_redirect', [$this, 'set_cache_related_data']);
        add_action('save_post', [$this, 'delete_cache_on_save']); // Fires on insert & update  
        add_action('delete_post', [$this, 'delete_cache_on_save']); // Fires when a post is permanently deleted  
        add_action('trash_post', [$this, 'delete_cache_on_save']); // Fires when moving a post to trash  
        add_action('untrash_post', [$this, 'delete_cache_on_save']); // Fires when restoring from trash  
        add_action('delete_attachment', [$this, 'delete_cache_on_save']); // Fires when an attachment is permanently deleted  
        add_action('update_option_permalink_structure', [$this, 'delete_cache_on_save']); // Fires when permalink structure changes  
    }

    public function delete_cache_on_save($post_id)
    {
        global $wpdb;

        // Fetch all transient keys related to blockish_style_
        $transient_keys = $wpdb->get_col($wpdb->prepare(
            "SELECT option_name FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s",
            '_transient_blockish_style_%',
            '_transient_timeout_blockish_style_%'
        ));

        // Delete each transient if found
        if (!empty($transient_keys)) {
            foreach ($transient_keys as $option_name) {
                delete_option($option_name);
            }
        }
    }

    public function set_cache_related_data()
    {
        $this->set_current_url();
    }

    private function set_current_url()
    {
        $this->current_url = isset($_SERVER['REQUEST_URI']) ? home_url($_SERVER['REQUEST_URI']) : home_url('/');
    }

    private function get_cache_key()
    {
        return 'blockish_style_transient_' . md5($this->current_url);
    }

    private function get_cached_css_data($cache_key)
    {
        return get_transient($cache_key) ?: [];
    }

    public function add_unique_class_to_block($block_content, $block)
    {
        $block_class = $block['attrs']['blockClass'] ?? '';
        if (!empty($block['blockName']) && str_contains($block['blockName'], 'blockish') && !empty($block_class)) {
            $block_content = new \WP_HTML_Tag_Processor($block_content);
            $block_content->next_tag();
            $block_content->add_class($block_class);
            return $block_content->get_updated_html();
        }

        return $block_content;
    }

    public function get_block_default_attributes($meta_attributes)
    {
        $default_attributes = [];

        foreach ($meta_attributes as $attribute_key => $attribute) {
            if (!empty($attribute['default'])) {
                $default_attributes[$attribute_key] = $attribute['default'];
            }
        }

        return $default_attributes;
    }

    public function process_attr_value($value)
    {
        $attribute_value = $value;

        if (!empty($value['value'])) {
            $attribute_value = $value['value'];
        }

        return $attribute_value;
    }

    public function collect_block_css($block_data)
    {
        if (empty($block_data['blockName']) || !str_contains($block_data['blockName'], 'blockish')) {
            return $block_data;
        }

        $cache_key = $this->get_cache_key();
        if (!empty($this->get_cached_css_data($cache_key)[$this->block_count])) {
            $cached_data = $this->get_cached_css_data($cache_key)[$this->block_count];
            $cached_block_name = $cached_data['blockName'];
            $cached_block_class = $cached_data['blockClass'];
            $cached_css = $cached_data['css'];
            if (
                $block_data['blockName'] === $cached_block_name &&
                !empty($cached_css) &&
                !empty($cached_block_class)
            ) {
                $block_data['attrs']['blockClass'] = $cached_block_class;
                $this->collected_block_css .= $cached_css;
                $this->block_count += 1;
                return $block_data;
            }
        }

        $block_data['attrs']['blockClass'] = 'bb-' . \Blockish\Core\Utilities::generate_uniqueId(6);
        $block_class = $block_data['attrs']['blockClass'];
        $name = str_replace('blockish/', '', $block_data['blockName']);
        $metadata = \Blockish\Core\Utilities::get_block_metadata($name);
        $block_meta_attributes = $metadata['attributes'] ?? [];
        $meta_attributes = array_merge($block_meta_attributes, Utilities::get_global_attributes());
        $default_attributes = $this->get_block_default_attributes($meta_attributes);
        $attributes = wp_parse_args($block_data['attrs'], $default_attributes);
        $breakpoints = Utilities::get_device_list();
        $css_rules = array_fill_keys(array_column($breakpoints, 'slug'), []);

        foreach ($meta_attributes as $meta_key => $meta_attr) {
            if ((empty($meta_attr['selectors']) && empty($meta_attr['groupSelector'])) || empty($attributes[$meta_key])) {
                continue;
            }

            $attribute_value = $attributes[$meta_key];

            // Function to apply CSS to the rules
            $apply_css = function ($device_slug, $value) use ($meta_attr, &$css_rules, $block_class) {
                if (!empty($meta_attr['selectors'])) {
                    foreach ($meta_attr['selectors'] as $selector => $rule) {
                        $final_rule = Utilities::replace_css_placeholders($rule, $value);
                        $selector = str_replace('{{WRAPPER}}', $block_class, $selector);
                        $css_rules[$device_slug][$selector] = isset($css_rules[$device_slug][$selector])
                            ? $css_rules[$device_slug][$selector] . $final_rule
                            : $final_rule;
                    }
                }

                if (!empty($meta_attr['groupSelector']['type'])) {
                    $type = $meta_attr['groupSelector']['type'];
                    $selector = str_replace('{{WRAPPER}}', $block_class, $meta_attr['groupSelector']['selector']);

                    switch ($type) {
                        case 'BlockishBackground':
                            $styles = Utilities::generate_background_control_styles($value, $device_slug);
                            $css_rules[$device_slug][$selector] = isset($css_rules[$device_slug][$selector])
                                ? $css_rules[$device_slug][$selector] . $styles
                                : $styles;
                            break;
                        case 'BlockishBorder':
                            $styles = Utilities::generate_border_control_styles($value, $device_slug);
                            $css_rules[$device_slug][$selector] = isset($css_rules[$device_slug][$selector])
                                ? $css_rules[$device_slug][$selector] . $styles
                                : $styles;
                            break;
                        case 'BlockishBoxShadow':
                            $styles = Utilities::generate_box_shadow_control_styles($value, $device_slug);
                            $css_rules[$device_slug][$selector] = isset($css_rules[$device_slug][$selector])
                                ? $css_rules[$device_slug][$selector] . $styles
                                : $styles;
                            break;
                    }
                }
            };

            // Check if conditions exist and evaluate them
            if (!empty($meta_attr['condition']['rules'])) {
                foreach ($breakpoints as $breakpoint) {
                    $device_slug = $breakpoint['slug'];
                    $processed_value = $this->process_attr_value(
                        Utilities::is_resposive_value($attribute_value, $breakpoints)
                            ? ($attribute_value[$device_slug] ?? null)
                            : $attribute_value
                    );

                    if (!$processed_value) {
                        continue;
                    }

                    $relation = $meta_attr['condition']['relation'] ?? "AND";
                    $all_conditions_met = ($relation === "AND");

                    // Evaluate each rule for conditions
                    foreach ($meta_attr['condition']['rules'] as $rule) {
                        $condition_value = $attributes[$rule['key']] ?? null;
                        $processed_condition_value = $this->process_attr_value(
                            Utilities::is_resposive_value($condition_value, Utilities::get_device_list())
                                ? $condition_value[$device_slug] ?? null
                                : $condition_value
                        );

                        $condition_met = false;
                        switch ($rule['condition']) {
                            case '==':
                                $condition_met = ($processed_condition_value == $rule['value']);
                                break;
                            case '!=':
                                $condition_met = ($processed_condition_value != $rule['value']);
                                break;
                            case 'empty':
                                $condition_met = empty($processed_condition_value);
                                break;
                            case 'not_empty':
                                $condition_met = !empty($processed_condition_value);
                                break;
                        }

                        if ($relation === "AND" && !$condition_met) {
                            $all_conditions_met = false;
                            break;
                        }
                        if ($relation === "OR" && $condition_met) {
                            $all_conditions_met = true;
                            break;
                        }
                    }

                    // If all conditions are met, apply the styles
                    if ($all_conditions_met) {
                        $apply_css($device_slug, $processed_value);
                    }
                }
            } else {
                // If no conditions, apply CSS for all breakpoints
                if (is_array($attribute_value)) {
                    foreach ($breakpoints as $breakpoint) {
                        $device_slug = $breakpoint['slug'];
                        if (!empty($attribute_value[$device_slug])) {
                            $apply_css($device_slug, $attribute_value[$device_slug]);
                        }
                    }
                } elseif (is_string($attribute_value) && !empty($meta_attr['groupSelector'])) {
                    foreach ($breakpoints as $breakpoint) {
                        $device_slug = $breakpoint['slug'];
                        if (!empty($attribute_value)) {
                            $apply_css($device_slug, $attribute_value);
                        }
                    }
                } else {
                    $apply_css('Desktop', $attribute_value);
                }
            }
        }

        // Generate final CSS and append
        $final_css = Utilities::generate_css_string($css_rules, $breakpoints);
        $cached_css_data = [
            'blockName' => $block_data['blockName'],
            'blockClass' => $block_class,
            'css' => $final_css
        ];

        $merged_cached_data = $this->get_cached_css_data($cache_key);
        $merged_cached_data[] = $cached_css_data;
        set_transient($cache_key, $merged_cached_data, 60 * 60 * 24); // Cache for 24 hours
        $this->block_count += 1;
        $this->collected_block_css .= $final_css;
        return $block_data;
    }

    public function enqueue_block_styles()
    {
        if (!empty($this->collected_block_css)) {
            wp_register_style('blockish-block-styles', false);
            wp_enqueue_style('blockish-block-styles');
            wp_add_inline_style('blockish-block-styles', $this->collected_block_css);
        }
    }
}
