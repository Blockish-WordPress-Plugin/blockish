<?php
namespace Blockish\Traits;

trait SingletonTrait {

    // Holds the instance of the class
    private static $instance;

    /**
     * Get the instance of the class.
     * If no instance exists, create one.
     *
     * @return static The instance of the class.
     */
    public static function get_instance() {
        if (null === static::$instance) {
            static::$instance = new static();
        }
        return static::$instance;
    }

    // Prevent direct object creation
    protected function __construct() {}

    // Prevent cloning
    private function __clone() {}

    // Ensure wakeup method is public for deserialization
    public function __wakeup() {}
}
