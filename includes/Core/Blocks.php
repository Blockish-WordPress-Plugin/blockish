<?php

namespace BoilerplateBlocks\Core;

use BoilerplateBlocks\Config\BlocksList;

defined('ABSPATH') || exit;

class Blocks
{
    use \BoilerplateBlocks\Traits\SingletonTrait;

    public $block_class = '';
    private $collected_block_css = ''; // Store CSS for all blocks

    private function __construct()
    {
        add_action('init', [$this, 'register_blocks']);
        add_filter('block_type_metadata', [$this, 'setup_block_metadata'], 10);
        add_filter('render_block_data', [$this, 'collect_block_css'], 10);
        add_filter('render_block', [$this, 'add_unique_class_to_block'], 10, 2);
        add_action('wp_enqueue_scripts', [$this, 'enqueue_block_styles']);
    }

    public function register_blocks()
    {
        $active_blocks = BlocksList::get_instance()->get_list('active');

        if (empty($active_blocks)) {
            return;
        }

        foreach ($active_blocks as $slug => $block) {
            $path = BOILERPLATE_BLOCKS_BLOCKS_DIR . $slug;

            if (is_readable($path)) {
                register_block_type($path);
            }
        }
    }

    public function get_global_attributes()
    {
        \BoilerplateBlocks\Core\Utilities::get_filesystem();

        global $wp_filesystem;

        $global_metadata_path = BOILERPLATE_BLOCKS_PLUGIN_DIR . '/build/global/block.json';

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
        if (!isset($metadata['name']) || !str_contains($metadata['name'], 'boilerplate-blocks')) {
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
        return get_option('boilerplate_device_list', [
            'Desktop' => 'base',
            'Tablet' => '1024px',
            'Mobile' => '767px',
        ]);
    }

    public function collect_block_css($block_data)
    {
        if (!empty($block_data['blockName']) && str_contains($block_data['blockName'], 'boilerplate-blocks')) {
            $this->block_class = 'bb-' . \BoilerplateBlocks\Core\Utilities::generate_uniqueId(6);
            $name = str_replace('boilerplate-blocks/', '', $block_data['blockName']);
            $metadata = \BoilerplateBlocks\Core\Utilities::get_block_metadata($name);
            $meta_attributes = isset($metadata['attributes']) ? $metadata['attributes'] : [];
            $attributes = $block_data['attrs'];
            $breakpoints = $this->get_device_list();

            $css_rules = array_fill_keys(array_keys($breakpoints), []);

            foreach ($attributes as $attribute_key => $attribute_value) {
                $meta_attribute = $meta_attributes[$attribute_key] ?? [];
                if (!empty($meta_attribute['selectors'])) {
                    foreach ($meta_attribute['selectors'] as $selector => $css) {
                        $selector = str_replace('{{WRAPPER}}', $this->block_class, $selector);
                        if (!is_array($attribute_value)) {
                            // Single value attributes (non-array) - add to Desktop
                            $css_rules['Desktop'][$selector] = (isset($css_rules['Desktop'][$selector]) ? $css_rules['Desktop'][$selector] : '') . Utilities::replace_css_placeholders($css, $attribute_value);
                        } elseif (empty(array_intersect(array_keys($attribute_value), array_keys($breakpoints)))) {
                            // Add to Desktop if attribute keys don't match breakpoint keys
                            $css_rules['Desktop'][$selector] = (isset($css_rules['Desktop'][$selector]) ? $css_rules['Desktop'][$selector] : '') . Utilities::replace_css_placeholders($css, $attribute_value);
                        } else {
                            // Breakpoint-specific values
                            foreach ($breakpoints as $breakpoint_key => $breakpoint) {
                                if (isset($attribute_value[$breakpoint_key])) {
                                    $css_rules[$breakpoint_key][$selector] = (isset($css_rules[$breakpoint_key][$selector]) ? $css_rules[$breakpoint_key][$selector] : '') . Utilities::replace_css_placeholders($css, $attribute_value[$breakpoint_key]);
                                }
                            }
                        }
                    }
                }
            }
            
            $final_css = Utilities::generate_css_string($css_rules, $breakpoints);
            $this->collected_block_css .= $final_css;
        }

        return $block_data; // Return the block data unchanged (except for the blockClass)
    }

    public function add_unique_class_to_block($block_content, $block)
    {
        if (!empty($block['blockName']) && str_contains($block['blockName'], 'boilerplate-blocks') && !empty($this->block_class)) {
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
            wp_register_style('boilerplate-block-styles', false);
            wp_enqueue_style('boilerplate-block-styles');
            wp_add_inline_style('boilerplate-block-styles', $this->collected_block_css);
        }
    }
}
