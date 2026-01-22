<?php
namespace Blockish\Config;

defined('ABSPATH') || exit;

class BlocksList extends ConfigList {

    // Use the Singleton trait
    use \Blockish\Traits\SingletonTrait;

    /**
     * Define the type of configuration this list is for.
     * This will be used for option keys and list identification.
     */
    protected $type = 'block';

    /**
     * BlocksList constructor.
     */
    public function __construct() {
        // Ensure parent constructor is called
        parent::__construct();
    }

    /**
     * Sets the list of blocks.
     * This method defines the specific block configuration items.
     */
    protected function set_list() {
        $this->list = array(
            'container' => array(
                'name'    => __('Container', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'icon' => array(
                'name'    => __('Icon', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'heading' => array(
                'name'    => __('Heading', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
            'image' => array(
                'name'    => __('Image', 'blockish'),
                'package' => 'free',
                'status'  => 'active',
            ),
        );
    }
}
