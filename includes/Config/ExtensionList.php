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
        $this->remove_stale_extensions();
    }

    /**
     * Sets the list of extensions.
     * This method defines the specific extension configuration items.
     */
    protected function set_list() {
        $this->list = array(
            'class-manager' => array(
                'name'        => 'CSS Class Manager',
                'description' => __( 'Create reusable global CSS classes and apply them to any Blockish block.', 'blockish' ),
                'package' => 'free',
                'category'    => 'general',
                'status'      => 'active',
            ),
            'mcp-ai' => array(
                'name'        => 'AI / MCP Access',
                'description' => __( 'Exposes Blockish abilities (posts, blocks, CSS classes) to AI tools over the Model Context Protocol for this entire site. Enable only if you trust the AI client connecting to this site — it can create and edit content and CSS classes.', 'blockish' ),
                'package'     => 'free',
                'category'    => 'general',
                'status'      => 'active',
            ),
        );

        $this->list = apply_filters( 'blockish/extensions/list', $this->list );
    }

    /**
     * Remove extensions that are no longer defined from saved option payload.
     *
     * @return void
     */
    private function remove_stale_extensions() {
        $saved_list = get_option( 'blockish_' . $this->type . '_list', array() );
        if ( ! is_array( $saved_list ) ) {
            return;
        }

        $valid_keys = array_keys( $this->list );
        $cleaned    = array_intersect_key( $saved_list, array_flip( $valid_keys ) );

        // Ensure required defaults exist after cleanup.
        foreach ( $this->list as $key => $item ) {
            if ( ! isset( $cleaned[ $key ] ) ) {
                $cleaned[ $key ] = $item;
            }
        }

        update_option( 'blockish_' . $this->type . '_list', $cleaned );
    }
}
