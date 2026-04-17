<?php

namespace Blockish\Core;

use Blockish\Config\BlocksList;

defined('ABSPATH') || exit;

class Blocks
{
    use \Blockish\Traits\SingletonTrait;

    private function __construct()
    {
        add_action('init', [$this, 'register_blocks']);
        add_filter('block_type_metadata', [$this, 'setup_block_metadata'], 10);
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

    public function setup_block_metadata($metadata)
    {
        if (!isset($metadata['name']) || !is_string($metadata['name'])) {
            return $metadata;
        }

        if (str_contains($metadata['name'], 'blockish')) {
            $global_metadata = Utilities::get_global_metadata();
            $metadata = $this->merge_metadata_attributes($metadata, $global_metadata['attributes'] ?? []);
            $metadata = $this->merge_metadata_uses_context($metadata, $global_metadata['usesContext'] ?? []);
        }

        $extensions_metadata = Extensions::get_instance()->get_applicable_metadata_for_block($metadata['name']);
        $metadata = $this->merge_metadata_attributes($metadata, $extensions_metadata['attributes'] ?? []);
        $metadata = $this->merge_metadata_uses_context($metadata, $extensions_metadata['usesContext'] ?? []);
        $metadata = $this->merge_metadata_provides_context($metadata, $extensions_metadata['providesContext'] ?? []);

        return $metadata;
    }

    /**
     * Merge attributes into block metadata.
     *
     * @param array $metadata
     * @param array $attributes
     * @return array
     */
    private function merge_metadata_attributes($metadata, $attributes)
    {
        if (empty($attributes) || !is_array($attributes)) {
            return $metadata;
        }

        if (!isset($metadata['attributes']) || !is_array($metadata['attributes'])) {
            $metadata['attributes'] = [];
        }

        $metadata['attributes'] = array_merge($metadata['attributes'], $attributes);

        return $metadata;
    }

    /**
     * Merge usesContext into block metadata.
     *
     * @param array $metadata
     * @param array $uses_context
     * @return array
     */
    private function merge_metadata_uses_context($metadata, $uses_context)
    {
        if (empty($uses_context) || !is_array($uses_context)) {
            return $metadata;
        }

        if (!isset($metadata['usesContext']) || !is_array($metadata['usesContext'])) {
            $metadata['usesContext'] = [];
        }

        $metadata['usesContext'] = array_unique(array_merge($metadata['usesContext'], $uses_context));

        return $metadata;
    }

    /**
     * Merge providesContext into block metadata.
     *
     * @param array $metadata
     * @param array $provides_context
     * @return array
     */
    private function merge_metadata_provides_context($metadata, $provides_context)
    {
        if (empty($provides_context) || !is_array($provides_context)) {
            return $metadata;
        }

        if (!isset($metadata['providesContext']) || !is_array($metadata['providesContext'])) {
            $metadata['providesContext'] = [];
        }

        $metadata['providesContext'] = array_merge($metadata['providesContext'], $provides_context);

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
