<?php
namespace Blockish\Core;

use Blockish\Traits\SingletonTrait;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Synced Mega Menu library CPT (embedded into navmenu-megamenu blocks).
 */
class MegamenuPostType {
	use SingletonTrait;

	const POST_TYPE = 'blockish_megamenu';

	protected function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_filter( 'wp_insert_post_data', array( $this, 'force_publish_status' ), 10, 2 );
		add_filter( 'pre_trash_post', array( $this, 'force_delete_instead_of_trash' ), 10, 2 );
	}

	/**
	 * Register the mega menu post type.
	 */
	public function register_post_type() {
		$labels = array(
			'name'               => _x( 'Mega Menus', 'Post Type General Name', 'blockish' ),
			'singular_name'      => _x( 'Mega Menu', 'Post Type Singular Name', 'blockish' ),
			'menu_name'          => __( 'Mega Menus', 'blockish' ),
			'name_admin_bar'     => __( 'Mega Menu', 'blockish' ),
			'all_items'          => __( 'All Mega Menus', 'blockish' ),
			'add_new_item'       => __( 'Add New Mega Menu', 'blockish' ),
			'add_new'            => __( 'Add New', 'blockish' ),
			'new_item'           => __( 'New Mega Menu', 'blockish' ),
			'edit_item'          => __( 'Edit Mega Menu', 'blockish' ),
			'update_item'        => __( 'Update Mega Menu', 'blockish' ),
			'view_item'          => __( 'View Mega Menu', 'blockish' ),
			'search_items'       => __( 'Search Mega Menus', 'blockish' ),
			'not_found'          => __( 'No mega menus found', 'blockish' ),
			'not_found_in_trash' => __( 'No mega menus found in Trash', 'blockish' ),
		);

		register_post_type(
			self::POST_TYPE,
			array(
				'label'               => __( 'Mega Menu', 'blockish' ),
				'labels'              => $labels,
				'supports'            => array( 'title', 'editor', 'revisions' ),
				'hierarchical'        => false,
				'public'              => false,
				'show_ui'             => true,
				'show_in_menu'        => false,
				'show_in_admin_bar'   => false,
				'show_in_nav_menus'   => false,
				'can_export'          => true,
				'has_archive'         => false,
				'exclude_from_search' => true,
				'publicly_queryable'  => false,
				'show_in_rest'        => true,
				'rest_base'           => self::POST_TYPE,
				'delete_with_user'    => false,
			)
		);
	}

	/**
	 * Keep mega menus publish-only (like forms / theme builder).
	 *
	 * @param array $data    Sanitized post data.
	 * @param array $postarr Raw post data.
	 * @return array
	 */
	public function force_publish_status( $data, $postarr ) {
		if ( empty( $data['post_type'] ) || self::POST_TYPE !== $data['post_type'] ) {
			return $data;
		}

		$status = isset( $data['post_status'] ) ? $data['post_status'] : '';

		if ( in_array( $status, array( 'auto-draft', 'inherit', 'trash' ), true ) ) {
			return $data;
		}

		if ( 'publish' !== $status ) {
			$data['post_status'] = 'publish';
		}

		return $data;
	}

	/**
	 * Skip trash — permanently delete mega menu posts.
	 *
	 * @param bool|null $trash Whether to short-circuit trashing.
	 * @param \WP_Post  $post  Post being trashed.
	 * @return bool|null
	 */
	public function force_delete_instead_of_trash( $trash, $post ) {
		if ( ! $post instanceof \WP_Post || self::POST_TYPE !== $post->post_type ) {
			return $trash;
		}

		wp_delete_post( $post->ID, true );
		return true;
	}
}
