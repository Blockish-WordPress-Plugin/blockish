<?php
namespace BoilerplateBlocks\Config;

defined('ABSPATH') || exit;

abstract class ConfigList {

    /**
     * Stores the list of items.
     *
     * @var array
     */
    protected $list = array();

    /**
     * Stores the active list of items.
     *
     * @var array
     */
    private $active_list = array();

    /**
     * The type of configuration (should be defined in child classes).
     *
     * @var string
     */
    protected $type;

    /**
     * ConfigList constructor.
     * Calls the methods to set the full and active lists.
     */
    public function __construct() {
        $this->set_list();
        $this->set_active_list();
        $this->sync_list_with_options();
    }

    /**
     * Retrieve a list based on the provided data type.
     *
     * @param string $data  The type of list to retrieve ('list' or 'active').
     * @param string|null $module  The specific module to retrieve from the list.
     * @return array|false  The requested list or module data, or false if not found.
     */
    public function get_list( $data = 'list', $module = null ) {
        if ( $module !== null ) {
            return $this->{$data . '_list'}[$module] ?? false;
        }

        return $this->{$data . '_list'} ?? array();  // Ensure returning an array even if empty
    }

    /**
     * Checks if a particular item is active.
     *
     * @param string $item  The item key to check.
     * @return bool  True if active, false otherwise.
     */
    public function is_active( $item ) {
        $item = $this->active_list[$item] ?? array();

        return !empty( $item['package'] ) && in_array( $item['package'], array( 'free', 'pro' ), true );
    }

    /**
     * Sets the active list based on the database configuration and predefined lists.
     *
     * @return void
     */
    private function set_active_list() {
        // Retrieve the stored configuration from the database.
        $database_list = get_option( 'boilerplate_blocks_' . $this->type . '_list', array() );

        foreach ( $this->list as $key => $item ) {
            // Skip inactive items.
            if ( isset( $database_list[$key]['status'] ) && $database_list[$key]['status'] === 'inactive' ) {
                continue;
            }

            // Skip items with a 'pro-disabled' package.
            if ( isset( $item['package'] ) && $item['package'] === 'pro-disabled' ) {
                continue;
            }

            // Add to the active list.
            $this->active_list[$key] = $item;
        }
    }

    /**
     * Sync the current list with the option in the WordPress database.
     * If there are new entries, they will be added; if existing items are changed, they will be updated.
     *
     * @return void
     */
    private function sync_list_with_options() {
        $saved_list = get_option( 'boilerplate_blocks_' . $this->type . '_list', array() );
        $updated_list = $this->list;

        // Iterate through the list and sync it with the saved option.
        foreach ( $this->list as $key => $item ) {
            if ( isset( $saved_list[$key] ) ) {
                // If the saved list exists, check for differences and update.
                if ( $saved_list[$key] !== $item ) {
                    $saved_list[$key] = $item;
                }
            } else {
                // If it's a new item, add it to the saved list.
                $saved_list[$key] = $item;
            }
        }

        // Save the updated list back to the options table.
        update_option( 'boilerplate_blocks_' . $this->type . '_list', $saved_list );
    }

    /**
     * Save the current list into the WordPress options table.
     * This method will save the full list to the options table based on the type.
     *
     * @return void
     */
    public function save_list_to_options() {
        update_option( 'boilerplate_blocks_' . $this->type . '_list', $this->list );
    }

    /**
     * Load the list from WordPress options.
     * This method will load the list from the options table and update the internal list.
     *
     * @return void
     */
    public function load_list_from_options() {
        $this->list = get_option( 'boilerplate_blocks_' . $this->type . '_list', array() );
        $this->set_active_list(); // Update the active list after loading.
    }

    /**
     * Sets the list of items (must be defined in child classes).
     * 
     * @return void
     */
    abstract protected function set_list();
}
