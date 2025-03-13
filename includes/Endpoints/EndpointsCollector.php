<?php

namespace Blockish\Endpoints;

defined('ABSPATH') || exit;

class EndpointsCollector {
    use \Blockish\Traits\SingletonTrait;

    private array $endpoints = [
        FontCollections::class,
    ];

    private function __construct() {
        $this->init_endpoints();
    }

    private function init_endpoints(): void {
        foreach ($this->endpoints as $endpoint) {
            if (class_exists($endpoint)) {
                $endpoint::get_instance();
            }
        }
    }
}