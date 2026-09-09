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
        // Bootstrap first so block-theme deactivation runs before ExtensionList reads options.
        \Blockish\Extensions\ThemeBuilder::get_instance();
        \Blockish\Extensions\ClassManager::get_instance();
        \Blockish\Extensions\Interaction::get_instance();
        \Blockish\Extensions\Visibility::get_instance();
        \Blockish\Extensions\AiPreview::boot();
    }
}
