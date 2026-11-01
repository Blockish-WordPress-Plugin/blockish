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
     * Theme Builder is classic-theme only.
     *
     * @return bool
     */
    private function is_theme_builder_allowed() {
        return function_exists( 'wp_is_block_theme' ) && ! wp_is_block_theme();
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
            'visibility' => array(
                'name'        => __( 'Visibility', 'blockish' ),
                'description' => __( 'Hide blocks on Desktop, Tablet, or Mobile.', 'blockish' ),
                'package'     => 'free',
                'category'    => 'general',
                'status'      => 'active',
            ),
            'interactions' => array(
                'name'        => __( 'Interactions', 'blockish' ),
                'description' => __( 'Add entrance animations, click actions, and cross-block signals to Blockish blocks.', 'blockish' ),
                'package'     => 'free',
                'category'    => 'general',
                'status'      => 'active',
            ),
            'theme-builder' => array(
                'name'        => __( 'Theme Builder', 'blockish' ),
                'description' => __( 'Build site templates and template parts for classic themes — header, footer, front-page, page, single, archive, search, 404, and more — with Blockish blocks. Block themes use the Site Editor instead.', 'blockish' ),
                'package'     => 'free',
                'category'    => 'general',
                'status'      => 'inactive',
            ),
            'dynamic-data' => array(
                'name'        => __( 'Dynamic Data', 'blockish' ),
                'description' => __( 'Adds dynamic data binding capabilities to blocks.', 'blockish' ),
                'package'     => 'pro',
                'addon'       => 'blockish-pro',
                'addon_name'  => 'Pro',
                'category'    => 'general',
                'status'      => 'active',
            ),
            'display-conditions' => array(
                'name'        => __( 'Display Conditions', 'blockish' ),
                'description' => __( 'Conditionally show or hide blocks based on specific rules.', 'blockish' ),
                'package'     => 'pro',
                'addon'       => 'blockish-pro',
                'addon_name'  => 'Pro',
                'category'    => 'general',
                'status'      => 'active',
            ),
        );

        $this->list = apply_filters( 'blockish/extensions/list', $this->list );
    }

    /**
     * @param string      $data   list|active
     * @param string|null $module Extension slug.
     * @return array|false
     */
    public function get_list( $data = 'list', $module = null ) {
        $result = parent::get_list( $data, $module );

        if ( 'active' !== $data || $this->is_theme_builder_allowed() ) {
            return $result;
        }

        if ( null !== $module ) {
            return ( 'theme-builder' === $module ) ? false : $result;
        }

        if ( is_array( $result ) ) {
            unset( $result['theme-builder'] );
        }

        return $result;
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
