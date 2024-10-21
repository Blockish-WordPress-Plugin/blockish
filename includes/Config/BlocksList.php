<?php
namespace BoilerplateBlocks\Config;

defined('ABSPATH') || exit;

class BlocksList extends ConfigList {

    // Use the Singleton trait
    use \BoilerplateBlocks\Traits\SingletonTrait;

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
            'sample-block' => array(
                'name'    => 'Sample Block',
                'package' => 'free',
                'status'  => 'active',
            ),
        );
    }
}
