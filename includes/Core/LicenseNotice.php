<?php

namespace Blockish\Core;

defined( 'ABSPATH' ) || exit;

/**
 * Admin notice when Forms / Dynamicity are installed but not licensed.
 * Licensing UX points at Blockish → Addons (not Freemius).
 */
class LicenseNotice {

	use \Blockish\Traits\SingletonTrait;

	const DISMISS_META = 'blockish_license_notice_dismissed';

	private function __construct() {
		// Priority 1 → top of the notice stack (above most plugin ads).
		add_action( 'admin_notices', array( $this, 'render_notice' ), 1 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_init', array( $this, 'maybe_dismiss' ) );
	}

	/**
	 * Persist dismiss (user-level, 14 days).
	 *
	 * @return void
	 */
	public function maybe_dismiss() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		if ( empty( $_GET['blockish_dismiss_license_notice'] ) ) {
			return;
		}

		check_admin_referer( 'blockish_dismiss_license_notice' );

		update_user_meta( get_current_user_id(), self::DISMISS_META, time() + ( DAY_IN_SECONDS * 14 ) );

		$redirect = wp_get_referer();
		if ( ! $redirect ) {
			$redirect = admin_url();
		}

		wp_safe_redirect( $redirect );
		exit;
	}

	/**
	 * Lightweight styles for a compact top banner.
	 *
	 * @param string $hook_suffix Current admin page.
	 * @return void
	 */
	public function enqueue_assets( $hook_suffix ) {
		if ( ! $this->should_display_on_screen() ) {
			return;
		}

		$css = '
		/* Sit below Screen Options/Help float so the bar can span full content width. */
		#wpbody-content > .blockish-license-notice.inline {
			clear: both;
			display: flex;
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
			margin: 8px 0 12px;
		}
		.blockish-license-notice.notice {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 16px;
			flex-wrap: wrap;
			width: 100%;
			max-width: 100%;
			box-sizing: border-box;
			margin: 8px 0 12px;
			padding: 12px 16px;
			border: 1px solid #c7d2fe;
			border-left-width: 4px;
			border-left-color: #4f46e5;
			border-radius: 8px;
			background: #eef2ff;
			box-shadow: none;
		}
		.blockish-license-notice .blockish-license-notice__body {
			display: flex;
			align-items: flex-start;
			gap: 12px;
			flex: 1 1 280px;
			min-width: 0;
		}
		.blockish-license-notice .blockish-license-notice__icon {
			flex: 0 0 auto;
			width: 28px;
			height: 28px;
			margin-top: 1px;
			border-radius: 999px;
			background: #4f46e5;
			color: #fff;
			font-size: 14px;
			font-weight: 700;
			line-height: 28px;
			text-align: center;
		}
		.blockish-license-notice .blockish-license-notice__copy {
			margin: 0;
			color: #1e1b4b;
			font-size: 13px;
			line-height: 1.45;
		}
		.blockish-license-notice .blockish-license-notice__copy strong {
			font-weight: 700;
		}
		.blockish-license-notice .blockish-license-notice__actions {
			display: flex;
			align-items: center;
			gap: 8px;
			flex: 0 0 auto;
		}
		.blockish-license-notice .blockish-license-notice__actions .button-primary {
			background: #4f46e5;
			border-color: #4f46e5;
			box-shadow: none;
			text-shadow: none;
		}
		.blockish-license-notice .blockish-license-notice__actions .button-primary:hover,
		.blockish-license-notice .blockish-license-notice__actions .button-primary:focus {
			background: #4338ca;
			border-color: #4338ca;
		}
		.blockish-license-notice .blockish-license-notice__later {
			margin: 0;
			padding: 0 4px;
			border: 0;
			background: transparent;
			color: #4338ca;
			font-size: 13px;
			font-weight: 600;
			text-decoration: none;
			line-height: 30px;
			cursor: pointer;
		}
		.blockish-license-notice .blockish-license-notice__later:hover,
		.blockish-license-notice .blockish-license-notice__later:focus {
			color: #312e81;
			text-decoration: underline;
		}
		';

		wp_register_style( 'blockish-license-notice', false, array(), BLOCKISH_VERSION );
		wp_enqueue_style( 'blockish-license-notice' );
		wp_add_inline_style( 'blockish-license-notice', $css );
	}

	/**
	 * Only show on quiet, relevant screens so it does not interrupt every admin page.
	 *
	 * @return bool
	 */
	private function should_display_on_screen() {
		if ( ! current_user_can( 'manage_options' ) ) {
			return false;
		}

		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen ) {
			return false;
		}

		// Blockish Dashboard strips WP notices — Addons page has its own banner.
		if ( 'toplevel_page_' . Dashboard::PAGE_SLUG === $screen->id ) {
			return false;
		}

		$allowed = array( 'dashboard', 'plugins', 'plugins-network' );
		return in_array( $screen->id, $allowed, true );
	}

	/**
	 * @return void
	 */
	public function render_notice() {
		if ( ! $this->should_display_on_screen() ) {
			return;
		}

		$dismissed_until = (int) get_user_meta( get_current_user_id(), self::DISMISS_META, true );
		if ( $dismissed_until > time() ) {
			return;
		}

		$needs = $this->get_unlicensed_installed_addons();
		if ( empty( $needs ) ) {
			return;
		}

		$names = wp_list_pluck( $needs, 'name' );
		$label = count( $names ) === 1
			? $names[0]
			: implode( ' & ', $names );

		$addons_url  = admin_url( 'admin.php?page=' . Dashboard::PAGE_SLUG . '&route=addons' );
		$dismiss_url = wp_nonce_url(
			add_query_arg( 'blockish_dismiss_license_notice', '1' ),
			'blockish_dismiss_license_notice'
		);

		echo '<div class="notice blockish-license-notice inline">';
		echo '<div class="blockish-license-notice__body">';
		echo '<span class="blockish-license-notice__icon" aria-hidden="true">!</span>';
		echo '<p class="blockish-license-notice__copy">';
		printf(
			/* translators: %s: add-on name(s), already escaped HTML */
			wp_kses(
				__( '%s needs a license on this site — activate to unlock premium features.', 'blockish' ),
				array( 'strong' => array() )
			),
			'<strong>' . esc_html( $label ) . '</strong>'
		);
		echo '</p>';
		echo '</div>';
		echo '<div class="blockish-license-notice__actions">';
		printf(
			'<a class="button button-primary" href="%s">%s</a>',
			esc_url( $addons_url ),
			esc_html__( 'Activate license', 'blockish' )
		);
		printf(
			'<a class="blockish-license-notice__later" href="%s">%s</a>',
			esc_url( $dismiss_url ),
			esc_html__( 'Remind me later', 'blockish' )
		);
		echo '</div>';
		echo '</div>';
	}

	/**
	 * Installed add-ons without an active Freemius license (ignores local bypass).
	 *
	 * @return array<int, array{slug:string,name:string}>
	 */
	public function get_unlicensed_installed_addons() {
		$addons = \Blockish\Config\AddonsList::get_instance()->refresh_list();
		$needs  = array();

		foreach ( $addons as $slug => $addon ) {
			if ( ! empty( $addon['is_bundle'] ) ) {
				continue;
			}
			if ( empty( $addon['is_installed'] ) || empty( $addon['supports_license_key'] ) ) {
				continue;
			}
			$license_active = ! empty( $addon['license']['is_active'] );
			if ( $license_active ) {
				continue;
			}
			$needs[] = array(
				'slug' => $slug,
				'name' => isset( $addon['name'] ) ? (string) $addon['name'] : $slug,
			);
		}

		return $needs;
	}
}
