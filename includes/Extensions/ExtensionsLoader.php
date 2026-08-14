<?php

namespace Blockish\Extensions;

defined('ABSPATH') || exit;

class ExtensionsLoader
{
    use \Blockish\Traits\SingletonTrait;

    private function __construct()
    {
        \Blockish\Core\Extensions::get_instance();
        $this->load_active_extensions();
    }

    /**
     * Bootstrap PHP services for active extensions.a
     *
     * @return void
     */
    private function load_active_extensions()
    {
        \Blockish\Extensions\ClassManager::get_instance();
        \Blockish\Extensions\Interaction::get_instance();
        \Blockish\Extensions\Visibility::get_instance();
    }
}
