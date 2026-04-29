<?php

namespace Blockish\Extensions;

defined( 'ABSPATH' ) || exit;

class AiDesignAssistant {
	use \Blockish\Traits\SingletonTrait;

	/**
	 * Constructor.
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
	}

	/**
	 * Register AI Design Assistant post type.
	 *
	 * Public for now. We can tighten capabilities/visibility later and
	 * control it fully through custom REST endpoints.
	 *
	 * @return void
	 */
	public function register_post_type() {
		$labels = array(
			'name'               => __( 'Assistant Chat History', 'blockish' ),
			'singular_name'      => __( 'Assistant Chat History', 'blockish' ),
			'add_new'            => __( 'Add New', 'blockish' ),
			'add_new_item'       => __( 'Add New Assistant Chat History', 'blockish' ),
			'edit_item'          => __( 'Edit Assistant Chat History', 'blockish' ),
			'new_item'           => __( 'New Assistant Chat History', 'blockish' ),
			'view_item'          => __( 'View Assistant Chat History', 'blockish' ),
			'search_items'       => __( 'Search Assistant Chat History', 'blockish' ),
			'not_found'          => __( 'No posts found.', 'blockish' ),
			'not_found_in_trash' => __( 'No posts found in Trash.', 'blockish' ),
			'all_items'          => __( 'Assistant Chat History', 'blockish' ),
			'menu_name'          => __( 'Assistant Chat History', 'blockish' ),
		);

		register_post_type(
			'blockish-ai-history',
			array(
				'labels'                => $labels,
				'public'                => true,
				'publicly_queryable'    => true,
				'show_ui'               => true,
				'show_in_menu'          => true,
				'show_in_admin_bar'     => true,
				'show_in_nav_menus'     => true,
				'exclude_from_search'   => false,
				'has_archive'           => true,
				'hierarchical'          => false,
				'menu_position'         => 25,
				'supports'              => array( 'title', 'editor' ),
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-ai-history',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => array( 'slug' => 'blockish-ai-history' ),
				'query_var'             => true,
			)
		);
	}
}
