<?php
namespace Blockish\Config;

defined('ABSPATH') || exit;

class ExtensionList extends ConfigList {

    // Use the Singleton trait
    use \Blockish\Traits\SingletonTrait;

    /**
     * Define the type of configuration this list is for.
     * This will be used for option keys and list identification.
     */
    protected $type = 'extension';

    /**
     * ExtensionList constructor.
     */
    public function __construct() {
        // Ensure parent constructor is called
        parent::__construct();
    }

    /**
     * Sets the list of extensions.
     * This method defines the specific extension configuration items.
     */
    protected function set_list() {
        $this->list = array(
            'interactions' => array(
                'name'    => 'Interactions',
                'package' => 'free',
                'status'  => 'active',
            ),
        );
    }
}
