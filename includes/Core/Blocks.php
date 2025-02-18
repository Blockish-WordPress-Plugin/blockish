<?php

namespace Blockish\Core;

use Blockish\Config\BlocksList;

defined('ABSPATH') || exit;

class Blocks
{
    use \Blockish\Traits\SingletonTrait;

    public $block_class = '';
    private $collected_block_css = ''; // Store CSS for all blocks

    private function __construct()
    {
        add_action('init', [$this, 'register_blocks']);
        add_filter('block_type_metadata', [$this, 'setup_block_metadata'], 10);
        add_filter('render_block_data', [$this, 'collect_block_css'], 10);
        add_filter('render_block', [$this, 'add_unique_class_to_block'], 10, 2);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_block_styles']);
        add_filter('block_categories_all', [$this, 'add_block_category'], 10, 2);
    }

    public function register_blocks()
    {
        $active_blocks = BlocksList::get_instance()->get_list('active');

        if (empty($active_blocks)) {
            return;
        }

        foreach ($active_blocks as $slug => $block) {
            $path = BLOCKISH_BLOCKS_DIR . $slug;

            if (is_readable($path)) {
                register_block_type_from_metadata($path);
            }
        }
    }

    public function get_global_attributes()
    {
        \Blockish\Core\Utilities::get_filesystem();

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

    public function setup_block_metadata($metadata)
    {
        if (!isset($metadata['name']) || !str_contains($metadata['name'], 'blockish')) {
            return $metadata;
        }

        $global_attributes = $this->get_global_attributes();

        if (!empty($global_attributes)) {
            $metadata['attributes'] = array_merge($metadata['attributes'], $global_attributes);
        }

        return $metadata;
    }

    public function get_device_list()
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

    public function is_resposive_value($attribute, $breakpoints)
    {
        return is_array($attribute) && array_intersect_key($attribute, array_flip(array_column($breakpoints, 'slug')));
    }

    public function collect_block_css($block_data)
    {
        if (empty($block_data['blockName']) || !str_contains($block_data['blockName'], 'blockish')) {
            return $block_data;
        }

        $this->block_class = 'bb-' . \Blockish\Core\Utilities::generate_uniqueId(6);
        $name = str_replace('blockish/', '', $block_data['blockName']);
        $metadata = \Blockish\Core\Utilities::get_block_metadata($name);
        $block_meta_attributes = $metadata['attributes'] ?? [];
        $meta_attributes = array_merge($block_meta_attributes, $this->get_global_attributes());
        $default_attributes = $this->get_block_default_attributes($meta_attributes);
        $attributes = wp_parse_args($block_data['attrs'], $default_attributes);
        $breakpoints = $this->get_device_list();
        $css_rules = array_fill_keys(array_column($breakpoints, 'slug'), []);

        foreach ($meta_attributes as $meta_key => $meta_attr) {
            if ((empty($meta_attr['selectors']) && empty($meta_attr['groupSelector'])) || empty($attributes[$meta_key])) {
                continue;
            }

            $attribute_value = $attributes[$meta_key];

            // Function to apply CSS to the rules
            $apply_css = function ($device_slug, $value) use ($meta_attr, &$css_rules) {
                if (!empty($meta_attr['selectors'])) {
                    foreach ($meta_attr['selectors'] as $selector => $rule) {
                        $final_rule = Utilities::replace_css_placeholders($rule, $value);
                        $selector = str_replace('{{WRAPPER}}', $this->block_class, $selector);
                        $css_rules[$device_slug][$selector] = isset($css_rules[$device_slug][$selector])
                            ? $css_rules[$device_slug][$selector] . $final_rule
                            : $final_rule;
                    }
                }

                if (!empty($meta_attr['groupSelector']['type'])) {
                    $type = $meta_attr['groupSelector']['type'];
                    $selector = str_replace('{{WRAPPER}}', $this->block_class, $meta_attr['groupSelector']['selector']);

                    switch ($type) {
                        case 'BlockishBackground':
                            $styles = Utilities::generate_background_control_styles($value, $device_slug);
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
                        $this->is_resposive_value($attribute_value, $breakpoints)
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
                            $this->is_resposive_value($condition_value, $this->get_device_list())
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
        $this->collected_block_css .= $final_css;

        return $block_data;
    }





    public function add_unique_class_to_block($block_content, $block)
    {
        if (!empty($block['blockName']) && str_contains($block['blockName'], 'blockish') && !empty($this->block_class)) {
            $block_content = new \WP_HTML_Tag_Processor($block_content);
            $block_content->next_tag();
            $block_content->add_class($this->block_class);
            return $block_content->get_updated_html();
        }

        return $block_content;
    }

    public function enqueue_block_styles()
    {
        if (!empty($this->collected_block_css)) {
            wp_register_style('blockish-block-styles', false);
            wp_enqueue_style('blockish-block-styles');
            wp_add_inline_style('blockish-block-styles', $this->collected_block_css);
        }
    }

    public function add_block_category($categories, $post)
    {
        return array_merge(
            [
                [
                    'slug' => 'blockish-framework',
                    'title' => __('Blockish Framework', 'blockish'),
                ],
            ],
            $categories,
        );
    }
}
