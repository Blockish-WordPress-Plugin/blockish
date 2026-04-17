<?php

namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;
use Blockish\Core\Extensions;

defined('ABSPATH') || exit;

class ExtensionsLoader
{
    use \Blockish\Traits\SingletonTrait;

    private function __construct()
    {
        Extensions::get_instance();
        $this->load_active_extensions();
    }

    /**
     * Bootstrap PHP services for active extensions.
     *
     * @return void
     */
    private function load_active_extensions()
    {
        ClassManager::get_instance();
    }
}
