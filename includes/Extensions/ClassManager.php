<?php

namespace Blockish\Extensions;

use Blockish\Config\ExtensionList;
use Blockish\Core\Utilities;
use Blockish\Core\PostPrime;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class ClassManager {
	use \Blockish\Traits\SingletonTrait;

	private const CSS_META_KEY = 'blockishClassManagerStyles';
	private const CSS_FAILED_KEY = 'blockish_class_manager_css_file_failed';
	private const CSS_INDEX_KEY = 'blockish_class_manager_css_index';
	private const CSS_REV_KEY = 'blockish_class_manager_css_rev';
	private const CSS_DIR = 'blockish';
	private const CSS_FILE_PREFIX = 'class-manager-';
	/** Unused hashed files older than this are pruned from uploads. */
	private const CSS_ORPHAN_TTL = WEEK_IN_SECONDS;
	private $used_post_ids = array();
	private $styles_enqueued = false;
	private $loaded_classes = array();
	private $all_classes_loaded = false;

	private function __construct() {
		add_action( 'init', array( $this, 'register_post_type' ) );
		add_action( 'init', array( $this, 'register_runtime_hooks' ), 20 );
		add_action( 'before_delete_post', array( $this, 'delete_child_classes_on_parent_delete' ) );
		add_action( 'rest_api_init', array( $this, 'register_editor_css_route' ) );
	}

	public function register_runtime_hooks() {
		if ( ! $this->is_extension_enabled() ) {
			return;
		}

		PostPrime::register_hooks();

		add_filter( 'render_block', array( $this, 'render_block' ), 10, 2 );
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_used_class_styles' ), 9 );
		if ( ! wp_is_block_theme() ) {
			add_action( 'wp_footer', array( $this, 'print_used_class_styles' ) );
		}
		add_filter( 'block_editor_settings_all', array( $this, 'add_editor_class_styles' ) );

		add_action( 'save_post_blockish-classes', array( $this, 'invalidate_css_files' ) );
		add_action( 'deleted_post', array( $this, 'invalidate_css_files_on_delete' ), 10, 2 );
		foreach ( array( 'added_post_meta', 'updated_post_meta', 'deleted_post_meta' ) as $meta_hook ) {
			add_action( $meta_hook, array( $this, 'invalidate_css_files_on_meta_change' ), 10, 3 );
		}
	}

	/**
	 * Seeds the editor canvas with compiled class CSS on load.
	 *
	 * render-style.js injects the same entry (keyed by __unstableType) only after
	 * it recomputes styles — until then the canvas is unstyled. This baseline is
	 * replaced in place once the JS pass runs.
	 *
	 * The entry must not be flagged isGlobalStyles: the site editor canvas and the
	 * global styles renderer both drop those entries and substitute their own.
	 */
	public function add_editor_class_styles( $settings ) {
		$css = $this->get_all_class_styles();
		if ( '' === $css ) {
			return $settings;
		}

		if ( empty( $settings['styles'] ) || ! is_array( $settings['styles'] ) ) {
			$settings['styles'] = array();
		}

		$settings['styles'][] = array(
			'__unstableType' => 'blockish-classes-styles',
			'css'            => $css,
		);

		return $settings;
	}

	private function get_all_class_styles() {
		$this->ensure_classes_loaded();

		$css = '';
		foreach ( $this->loaded_classes as $class_post ) {
			if ( ! $class_post instanceof \WP_Post ) {
				continue;
			}
			$meta_css = trim( (string) get_post_meta( $class_post->ID, self::CSS_META_KEY, true ) );
			if ( '' !== $meta_css ) {
				$css .= $meta_css;
			}
		}

		return $css;
	}

	/**
	 * Load every published Class Manager post once per request.
	 *
	 * render_block used to query by ID as blocks appeared; one bulk fetch is
	 * cheaper and also primes post meta so CSS lookups do not N+1.
	 */
	private function ensure_classes_loaded() {
		if ( $this->all_classes_loaded ) {
			return;
		}

		$this->all_classes_loaded = true;

		$posts = get_posts(
			array(
				'post_type'              => 'blockish-classes',
				'post_status'            => 'publish',
				'posts_per_page'         => -1,
				'orderby'                => 'ID',
				'order'                  => 'ASC',
				'no_found_rows'          => true,
				'update_post_meta_cache' => true,
				'update_post_term_cache' => false,
				'suppress_filters'       => false,
			)
		);

		foreach ( $posts as $post ) {
			if ( $post instanceof \WP_Post ) {
				$this->loaded_classes[ (int) $post->ID ] = $post;
			}
		}
	}

	private function is_extension_enabled() {
		$active_extensions = ExtensionList::get_instance()->get_list( 'active' );
		return ! empty( $active_extensions['class-manager'] );
	}

	public function enqueue_used_class_styles() {
		if ( $this->styles_enqueued ) {
			return;
		}

		$this->collect_used_post_ids_for_request();
		if ( empty( $this->used_post_ids ) ) {
			return;
		}

		$this->enqueue_styles_for_used_classes( false );
	}

	public function register_post_type() {
		register_post_type(
			'blockish-classes',
			array(
				'label'                 => __( 'Class Manager', 'blockish' ),
				'public'                => true,
				'show_ui'               => false,
				'show_in_menu'          => false,
				'show_in_admin_bar'     => false,
				'show_in_nav_menus'     => false,
				'exclude_from_search'   => true,
				'publicly_queryable'    => false,
				'hierarchical'          => true,
				'show_in_rest'          => true,
				'rest_base'             => 'blockish-classes',
				'rest_controller_class' => 'WP_REST_Posts_Controller',
				'supports'              => array( 'title', 'editor', 'page-attributes', 'custom-fields' ),
				'capability_type'       => 'post',
				'map_meta_cap'          => true,
				'rewrite'               => false,
				'query_var'             => false,
			)
		);

		register_post_meta(
			'blockish-classes',
			self::CSS_META_KEY,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'show_in_rest'      => true,
				'sanitize_callback' => 'wp_strip_all_tags',
			)
		);

		ClassPrevious::register_meta();
	}

	public function render_block( $block_content, $block ) {
		if ( empty( $block['blockName'] ) || ! $this->is_supported_block_name( $block['blockName'] ) ) {
			return $block_content;
		}

		$class_items       = $block['attrs']['classManager'] ?? array();
		$subselector_items = $block['attrs']['classManagerSubselector'] ?? array();

		if ( ! is_array( $class_items ) ) {
			$class_items = array();
		}

		if ( ! is_array( $subselector_items ) ) {
			$subselector_items = array();
		}

		if ( empty( $class_items ) ) {
			return $block_content;
		}

		$tag_processor = new \WP_HTML_Tag_Processor( $block_content );
		if ( ! $tag_processor->next_tag() ) {
			return $block_content;
		}

		$requested_ids = array();
		foreach ( $class_items as $class_item ) {
			if ( ! is_array( $class_item ) ) {
				continue;
			}
			$class_id = absint( $class_item['id'] ?? 0 );
			if ( $class_id > 0 ) {
				$requested_ids[] = $class_id;
			}
		}
		foreach ( $subselector_items as $selector_item ) {
			if ( ! is_array( $selector_item ) ) {
				continue;
			}
			$selector_id = absint( $selector_item['id'] ?? 0 );
			$parent_id   = absint( $selector_item['parent'] ?? 0 );
			if ( $selector_id > 0 ) {
				$requested_ids[] = $selector_id;
			}
			if ( $parent_id > 0 ) {
				$requested_ids[] = $parent_id;
			}
		}

		$requested_ids = array_values( array_filter( array_unique( array_map( 'absint', $requested_ids ) ) ) );
		if ( empty( $requested_ids ) ) {
			return $block_content;
		}

		$this->ensure_classes_loaded();

		$existing_by_id = array();
		foreach ( $requested_ids as $req_id ) {
			if ( ! empty( $this->loaded_classes[ $req_id ] ) ) {
				$existing_by_id[ $req_id ] = $this->loaded_classes[ $req_id ];
			}
		}

		if ( empty( $existing_by_id ) ) {
			return $block_content;
		}

		$selected_parent_ids = array();

		foreach ( $class_items as $class_item ) {
			if ( ! is_array( $class_item ) ) {
				continue;
			}

			$class_id = absint( $class_item['id'] ?? 0 );
			if ( $class_id <= 0 || empty( $existing_by_id[ $class_id ] ) ) {
				continue;
			}

			$slug = $this->normalize_class_slug( $existing_by_id[ $class_id ]->post_title );
			if ( '' === $slug ) {
				continue;
			}

			$tag_processor->add_class( $slug );
			$this->used_post_ids[ $class_id ] = true;
			$selected_parent_ids[ $class_id ] = true;
		}

		if ( ! empty( $subselector_items ) && ! empty( $selected_parent_ids ) ) {
			foreach ( $subselector_items as $selector_item ) {
				if ( ! is_array( $selector_item ) ) {
					continue;
				}

				$selector_id = absint( $selector_item['id'] ?? 0 );
				$parent_id   = absint( $selector_item['parent'] ?? 0 );
				if (
					$selector_id <= 0 ||
					$parent_id <= 0 ||
					empty( $selected_parent_ids[ $parent_id ] ) ||
					empty( $existing_by_id[ $selector_id ] ) ||
					empty( $existing_by_id[ $parent_id ] )
				) {
					continue;
				}

				$tag_processor->add_class( 'blockish-cm-' . $selector_id );
				$this->used_post_ids[ $selector_id ] = true;
				$this->used_post_ids[ $parent_id ]   = true;
			}
		}

		return $tag_processor->get_updated_html();
	}

	public function print_used_class_styles() {
		if ( $this->styles_enqueued ) {
			return;
		}

		if ( empty( $this->used_post_ids ) ) {
			return;
		}

		$this->enqueue_styles_for_used_classes( true );
	}

	/**
	 * Collect class IDs for the current request: post content, synced patterns,
	 * and shared template parts (so header/footer classes are not missed).
	 */
	private function collect_used_post_ids_for_request() {
		$seen_content_ids = array();

		$post_id = get_queried_object_id();
		if ( $post_id ) {
			$post = get_post( $post_id );
			if ( $post && is_string( $post->post_content ) && '' !== $post->post_content ) {
				$blocks = parse_blocks( $post->post_content );
				PostPrime::prime_pattern_refs_from_blocks( $blocks );
				$seen_content_ids[ (int) $post_id ] = true;
				$this->collect_used_post_ids_from_blocks( $blocks, $seen_content_ids );
			}
		}

		if ( wp_is_block_theme() ) {
			$this->collect_used_post_ids_from_template_parts( $seen_content_ids );
		}
	}

	private function collect_used_post_ids_from_template_parts( &$seen_content_ids ) {
		$parts = get_posts(
			array(
				'post_type'              => 'wp_template_part',
				'post_status'            => array( 'publish', 'private' ),
				'posts_per_page'         => -1,
				'no_found_rows'          => true,
				'update_post_meta_cache' => false,
				'update_post_term_cache' => false,
			)
		);

		foreach ( $parts as $part ) {
			if ( ! $part instanceof \WP_Post || ! is_string( $part->post_content ) || '' === $part->post_content ) {
				continue;
			}
			if ( ! empty( $seen_content_ids[ (int) $part->ID ] ) ) {
				continue;
			}
			$seen_content_ids[ (int) $part->ID ] = true;
			$blocks = parse_blocks( $part->post_content );
			PostPrime::prime_pattern_refs_from_blocks( $blocks );
			$this->collect_used_post_ids_from_blocks( $blocks, $seen_content_ids );
		}
	}

	private function collect_used_post_ids_from_blocks( $blocks, &$seen_content_ids = null ) {
		if ( ! is_array( $blocks ) ) {
			return;
		}

		if ( null === $seen_content_ids ) {
			$seen_content_ids = array();
		}

		foreach ( $blocks as $block ) {
			if ( ! is_array( $block ) ) {
				continue;
			}

			$attrs             = $block['attrs'] ?? array();
			$class_items       = $attrs['classManager'] ?? array();
			$subselector_items = $attrs['classManagerSubselector'] ?? array();

			if ( is_array( $class_items ) ) {
				foreach ( $class_items as $class_item ) {
					if ( ! is_array( $class_item ) ) {
						continue;
					}
					$class_id = absint( $class_item['id'] ?? 0 );
					if ( $class_id > 0 ) {
						$this->used_post_ids[ $class_id ] = true;
					}
				}
			}

			if ( is_array( $subselector_items ) ) {
				foreach ( $subselector_items as $selector_item ) {
					if ( ! is_array( $selector_item ) ) {
						continue;
					}
					$selector_id = absint( $selector_item['id'] ?? 0 );
					$parent_id   = absint( $selector_item['parent'] ?? 0 );
					if ( $selector_id > 0 ) {
						$this->used_post_ids[ $selector_id ] = true;
					}
					if ( $parent_id > 0 ) {
						$this->used_post_ids[ $parent_id ] = true;
					}
				}
			}

			if ( 'core/block' === ( $block['blockName'] ?? '' ) ) {
				$ref = absint( $attrs['ref'] ?? 0 );
				if ( $ref > 0 && empty( $seen_content_ids[ $ref ] ) ) {
					$seen_content_ids[ $ref ] = true;
					$pattern                  = PostPrime::get_post( $ref );
					if ( $pattern && is_string( $pattern->post_content ) && '' !== $pattern->post_content ) {
						$this->collect_used_post_ids_from_blocks( parse_blocks( $pattern->post_content ), $seen_content_ids );
					}
				}
			}

			$inner_blocks = $block['innerBlocks'] ?? array();
			if ( ! empty( $inner_blocks ) ) {
				$this->collect_used_post_ids_from_blocks( $inner_blocks, $seen_content_ids );
			}
		}
	}

	/**
	 * Serve used-class CSS as a content-hashed stylesheet, falling back to inline.
	 *
	 * Each page only gets the classes it uses. Identical CSS across pages shares
	 * the same hashed file; any change produces a new hash / file.
	 *
	 * @param bool $print_now Print the tag immediately (footer fallback path).
	 */
	private function enqueue_styles_for_used_classes( $print_now = false ) {
		$css = $this->get_styles_for_classes();
		if ( '' === $css ) {
			return;
		}

		$file = $this->get_or_create_css_file( $css );
		if ( null === $file ) {
			$this->enqueue_inline_styles( $css, $print_now );
			return;
		}

		$this->enqueue_css_file( $file, $print_now );
	}

	/**
	 * @param array{url: string, version: string} $file
	 * @param bool                                $print_now Print the tag immediately.
	 */
	private function enqueue_css_file( $file, $print_now = false ) {
		$handle = 'blockish-class-manager';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, $file['url'], array(), $file['version'] );
		}
		wp_enqueue_style( $handle );
		if ( $print_now ) {
			wp_print_styles( array( $handle ) );
		}
		$this->styles_enqueued = true;
	}

	/**
	 * @param string $css Compiled CSS for the classes used on this request.
	 * @return array{url: string, version: string}|null
	 */
	private function get_or_create_css_file( $css ) {
		$version  = md5( $css );
		$filename = self::CSS_FILE_PREFIX . $version . '.css';
		$upload   = wp_get_upload_dir();
		$dir      = $upload['basedir'] . '/' . self::CSS_DIR;
		$path     = $dir . '/' . $filename;

		if ( file_exists( $path ) ) {
			$this->touch_css_hash( $version );
			// We DO NOT run prune_orphan_css_files here because scanning the filesystem (glob) 
			// on every single page load is terrible for performance.
			return array(
				'url'     => $upload['baseurl'] . '/' . self::CSS_DIR . '/' . $filename,
				'version' => $version,
			);
		}

		if ( get_transient( self::CSS_FAILED_KEY ) ) {
			return null;
		}

		if ( ! wp_mkdir_p( $dir ) || ! $this->write_css_file( $path, $css ) ) {
			set_transient( self::CSS_FAILED_KEY, 1, HOUR_IN_SECONDS );
			return null;
		}

		$this->touch_css_hash( $version );
		$this->prune_orphan_css_files( $version );

		return array(
			'url'     => $upload['baseurl'] . '/' . self::CSS_DIR . '/' . $filename,
			'version' => $version,
		);
	}

	private function write_css_file( $path, $css ) {
		global $wp_filesystem;

		Utilities::get_filesystem();
		if ( ! $wp_filesystem instanceof \WP_Filesystem_Base ) {
			return false;
		}

		$chmod = defined( 'FS_CHMOD_FILE' ) ? FS_CHMOD_FILE : false;

		return (bool) $wp_filesystem->put_contents( $path, $css, $chmod );
	}

	public function invalidate_css_files() {
		delete_transient( self::CSS_FAILED_KEY );
		$this->delete_all_css_files();
		delete_option( self::CSS_INDEX_KEY );
		// Drop the previous single-file option if an older version left it behind.
		delete_option( 'blockish_class_manager_css_file' );
		$this->bump_css_revision();
	}

	/**
	 * Editor JS uses this stamp to skip refetching compiled class CSS.
	 */
	public function bump_css_revision() {
		$rev = (int) get_option( self::CSS_REV_KEY, 0 );
		update_option( self::CSS_REV_KEY, $rev + 1, false );
	}

	public function get_css_revision() {
		return (int) get_option( self::CSS_REV_KEY, 0 );
	}

	/**
	 * Compiled class CSS for the block editor (meta concatenation).
	 *
	 * @param int $since Last revision the client already applied.
	 * @return array{last_changed: int, unchanged: bool, css: string}
	 */
	public function get_editor_css_bundle( $since = 0 ) {
		$last = $this->get_css_revision();
		$since = absint( $since );

		if ( $since > 0 && $since === $last ) {
			return array(
				'last_changed' => $last,
				'unchanged'    => true,
				'css'          => '',
			);
		}

		return array(
			'last_changed' => $last,
			'unchanged'    => false,
			'css'          => $this->get_all_class_styles(),
		);
	}

	public function register_editor_css_route() {
		register_rest_route(
			'blockish/v1',
			'/class-manager-css',
			array(
				'methods'             => 'GET',
				'callback'            => array( $this, 'get_editor_css_rest' ),
				'permission_callback' => function () {
					return current_user_can( 'edit_posts' );
				},
				'args'                => array(
					'since' => array(
						'type'    => 'integer',
						'minimum' => 0,
						'default' => 0,
					),
				),
			)
		);
	}

	public function get_editor_css_rest( \WP_REST_Request $request ) {
		return rest_ensure_response(
			$this->get_editor_css_bundle( (int) $request->get_param( 'since' ) )
		);
	}

	/**
	 * Wipe every cached Class Manager CSS file so the next frontend hit rebuilds.
	 *
	 * @return array{deleted: int}
	 */
	public function regenerate_css_cache() {
		$deleted = $this->count_css_files();
		$this->invalidate_css_files();

		return array(
			'deleted' => $deleted,
		);
	}

	public function invalidate_css_files_on_delete( $post_id, $post = null ) {
		$post_type = $post instanceof \WP_Post ? $post->post_type : get_post_type( $post_id );
		if ( 'blockish-classes' === $post_type ) {
			$this->invalidate_css_files();
		}
	}

	public function invalidate_css_files_on_meta_change( $meta_id, $post_id, $meta_key ) {
		if ( self::CSS_META_KEY === $meta_key ) {
			$this->invalidate_css_files();
		}
	}

	private function touch_css_hash( $hash ) {
		$index = get_option( self::CSS_INDEX_KEY, array() );
		if ( ! is_array( $index ) ) {
			$index = array();
		}

		$last_touched = isset( $index[ (string) $hash ] ) ? (int) $index[ (string) $hash ] : 0;
		
		// Only update the database once every 12 hours to prevent constant UPDATE queries on the frontend.
		if ( time() - $last_touched > 12 * HOUR_IN_SECONDS ) {
			$index[ (string) $hash ] = time();
			update_option( self::CSS_INDEX_KEY, $index, false );
		}
	}

	/**
	 * Drop hashed files that have not been used recently (page mix changed, old hash left behind).
	 *
	 * @param string $keep_hash Hash for the current request — never deleted here.
	 */
	private function prune_orphan_css_files( $keep_hash = '' ) {
		$upload = wp_get_upload_dir();
		$files  = glob( $upload['basedir'] . '/' . self::CSS_DIR . '/' . self::CSS_FILE_PREFIX . '*.css' );
		if ( empty( $files ) ) {
			return;
		}

		$index = get_option( self::CSS_INDEX_KEY, array() );
		if ( ! is_array( $index ) ) {
			$index = array();
		}

		$now     = time();
		$changed = false;

		foreach ( $files as $file ) {
			if ( ! preg_match( '/^' . preg_quote( self::CSS_FILE_PREFIX, '/' ) . '([a-f0-9]+)\.css$/', basename( $file ), $matches ) ) {
				continue;
			}

			$hash = $matches[1];
			if ( '' !== $keep_hash && $hash === $keep_hash ) {
				continue;
			}

			$last_used = isset( $index[ $hash ] ) ? (int) $index[ $hash ] : 0;
			if ( $last_used <= 0 ) {
				$mtime = (int) filemtime( $file );
				if ( $mtime > 0 && ( $now - $mtime ) <= self::CSS_ORPHAN_TTL ) {
					continue;
				}
			} elseif ( ( $now - $last_used ) <= self::CSS_ORPHAN_TTL ) {
				continue;
			}

			wp_delete_file( $file );
			if ( isset( $index[ $hash ] ) ) {
				unset( $index[ $hash ] );
				$changed = true;
			}
		}

		foreach ( array_keys( $index ) as $hash ) {
			$path = $upload['basedir'] . '/' . self::CSS_DIR . '/' . self::CSS_FILE_PREFIX . $hash . '.css';
			if ( ! file_exists( $path ) ) {
				unset( $index[ $hash ] );
				$changed = true;
			}
		}

		if ( $changed ) {
			update_option( self::CSS_INDEX_KEY, $index, false );
		}
	}

	private function count_css_files() {
		$upload = wp_get_upload_dir();
		$files  = glob( $upload['basedir'] . '/' . self::CSS_DIR . '/' . self::CSS_FILE_PREFIX . '*.css' );

		return empty( $files ) ? 0 : count( $files );
	}

	private function delete_all_css_files() {
		$upload = wp_get_upload_dir();
		$files  = glob( $upload['basedir'] . '/' . self::CSS_DIR . '/' . self::CSS_FILE_PREFIX . '*.css' );
		if ( empty( $files ) ) {
			return;
		}

		foreach ( $files as $file ) {
			wp_delete_file( $file );
		}
	}

	private function enqueue_inline_styles( $styles, $print_now = false ) {
		if ( '' === $styles ) {
			return;
		}

		$handle = 'blockish-class-manager-inline';
		if ( ! wp_style_is( $handle, 'registered' ) ) {
			wp_register_style( $handle, false, array(), BLOCKISH_VERSION );
		}
		wp_enqueue_style( $handle );
		wp_add_inline_style( $handle, $styles );
		if ( $print_now ) {
			wp_print_styles( array( $handle ) );
		}
		$this->styles_enqueued = true;
	}

	private function get_styles_for_classes() {
		$post_ids = array_values( array_filter( array_map( 'absint', array_keys( $this->used_post_ids ) ) ) );
		if ( empty( $post_ids ) ) {
			return '';
		}

		$this->ensure_classes_loaded();
		sort( $post_ids, SORT_NUMERIC );

		$css = '';
		foreach ( $post_ids as $post_id ) {
			$meta_css = trim( (string) get_post_meta( $post_id, self::CSS_META_KEY, true ) );
			if ( '' === $meta_css ) {
				continue;
			}
			$css .= $meta_css;
		}

		return $css;
	}

	public function delete_child_classes_on_parent_delete( $post_id ) {
		if ( 'blockish-classes' !== get_post_type( $post_id ) ) {
			return;
		}

		$children = get_posts(
			array(
				'post_type'   => 'blockish-classes',
				'post_parent' => $post_id,
				'numberposts' => -1,
				'fields'      => 'ids',
			)
		);

		if ( empty( $children ) ) {
			return;
		}

		foreach ( $children as $child_id ) {
			wp_delete_post( (int) $child_id, true );
		}
	}

	/**
	 * @param string $block_name
	 * @return bool
	 */
	private function is_supported_block_name( $block_name ) {
		if ( ! is_string( $block_name ) || '' === $block_name ) {
			return false;
		}

		return str_starts_with( $block_name, 'blockish' );
	}

	private function normalize_class_slug( $value ) {
		$value = strtolower( trim( (string) $value ) );
		$value = str_replace( ' ', '-', $value );
		$value = preg_replace( '/[^a-z0-9_-]/', '', $value );

		if ( ! is_string( $value ) ) {
			return '';
		}

		if ( ! preg_match( '/^[a-z_][a-z0-9_-]*$/', $value ) ) {
			return '';
		}

		return $value;
	}
}
