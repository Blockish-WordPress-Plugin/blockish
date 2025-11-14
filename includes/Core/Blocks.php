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
        if (!isset($metadata['name']) || !str_contains($metadata['name'], 'blockish')) {
            return $metadata;
        }

        $global_metadata = Utilities::get_global_metadata();

        if (!empty($global_metadata['attributes'])) {
            $metadata['attributes'] = array_merge($metadata['attributes'], $global_metadata['attributes']);
        }
        
        if (!empty($global_metadata['usesContext'])) {
            if (!isset($metadata['usesContext'])) {
                $metadata['usesContext'] = [];
            }
            $metadata['usesContext'] = array_unique(array_merge($metadata['usesContext'], $global_metadata['usesContext']));
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
