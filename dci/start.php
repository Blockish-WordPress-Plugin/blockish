<?php
/**
 * DCI SDK Loader
 * SDK Version 1.2.2
 *
 * Highest-version-wins strategy (in-memory only, no DB calls at load time):
 * Every plugin's start.php updates $GLOBALS['_dci_sdk_path'] if its version
 * is newer. dci_dynamic_init() is defined once by the first plugin loaded,
 * but always reads the winning path from $GLOBALS — which is fully resolved
 * before any WordPress hook fires.
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

$_dci_sdk_this_version = '1.2.2';

if (
	! isset( $GLOBALS['_dci_sdk_version'] ) ||
	version_compare( $_dci_sdk_this_version, $GLOBALS['_dci_sdk_version'], '>' )
) {
	$GLOBALS['_dci_sdk_version'] = $_dci_sdk_this_version;
	$GLOBALS['_dci_sdk_path']    = __DIR__;
}

if ( ! function_exists( 'dci_dynamic_init' ) ) {
	function dci_dynamic_init( $params ) {

		if ( ! is_admin() ) {
			return;
		}

		// Always use the highest-version SDK path registered so far.
		$sdk_path = $GLOBALS['_dci_sdk_path'];

		// Override sdk_version in params with the actual winning SDK version.
		// This ensures the server always sees the real SDK version, regardless
		// of what individual plugins pass — no need to maintain two version numbers.
		$params['sdk_version'] = $GLOBALS['_dci_sdk_version'];

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended
		$current_page = isset( $_GET['page'] ) ? sanitize_text_field( wp_unslash( $_GET['page'] ) ) : false;
		$menu_slug    = isset( $params['menu']['slug'] ) ? $params['menu']['slug'] : false;
		$text_domain  = isset( $params['text_domain'] ) && ! empty( $params['text_domain'] ) ? $params['text_domain'] : $params['slug'];

		$params['current_page'] = $current_page;
		$params['menu_slug']    = $menu_slug;
		$params['text_domain']  = $text_domain;

		require_once $sdk_path . '/insights.php';

		if ( function_exists( 'dci_sdk_insights' ) ) {
			dci_sdk_insights( $params );
		}
	}
}
