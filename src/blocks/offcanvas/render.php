<?php
defined( 'ABSPATH' ) || exit;

use Blockish\Core\Utilities;

$animation    = $attributes['offcanvasAnimation'] ?? 'slide';
$side         = $attributes['offcanvasSide'] ?? 'left';
$hamb_align   = $attributes['hamburgerAlign'] ?? 'left';
$header_type  = $attributes['headerType'] ?? 'siteTitle';
$header_text  = $attributes['headerText'] ?? '';
$header_image = $attributes['headerImage'] ?? array();

// A picked icon replaces the default three-bar hamburger.
$hamburger_icon_svg = Utilities::render_icon( $attributes['hamburgerIcon'] ?? array() );
$hamburger_inner    = $hamburger_icon_svg
	? $hamburger_icon_svg
	: '<span></span><span></span><span></span>';
$hamburger_class    = 'blockish-offcanvas-hamburger' . ( $hamburger_icon_svg ? ' has-icon' : '' );

// Build the header branding markup. Site title/logo stay live (read at render
// time), custom image/text come from the block's own attributes.
$branding = '';
switch ( $header_type ) {
	case 'siteTitle':
		$branding = '<span class="blockish-offcanvas-site-title">' . esc_html( get_bloginfo( 'name' ) ) . '</span>';
		break;
	case 'siteLogo':
		$logo_id = get_theme_mod( 'custom_logo' );
		if ( $logo_id ) {
			$branding = wp_get_attachment_image( $logo_id, 'full', false, array( 'class' => 'blockish-offcanvas-logo' ) );
		}
		break;
	case 'customImage':
		if ( ! empty( $header_image['url'] ) ) {
			$branding = sprintf(
				'<img src="%s" alt="%s" class="blockish-offcanvas-logo" />',
				esc_url( $header_image['url'] ),
				esc_attr( $header_image['alt'] ?? '' )
			);
		}
		break;
	case 'customText':
		if ( '' !== $header_text ) {
			$branding = '<span class="blockish-offcanvas-site-title">' . esc_html( $header_text ) . '</span>';
		}
		break;
}

$wrapper_attrs = get_block_wrapper_attributes( array(
	'class' => implode( ' ', array(
		'blockish-offcanvas',
		'offcanvas-animation-' . sanitize_html_class( $animation ),
		'offcanvas-side-' . sanitize_html_class( $side ),
		'hamburger-align-' . sanitize_html_class( $hamb_align ),
	) ),
) );
?>
<div <?php echo $wrapper_attrs; ?>>
	<button type="button" class="<?php echo esc_attr( $hamburger_class ); ?>" aria-label="<?php esc_attr_e( 'Toggle menu', 'blockish' ); ?>" aria-expanded="false">
		<?php echo $hamburger_inner; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized in render_icon ?>
	</button>
	<div class="blockish-offcanvas-overlay" aria-hidden="true"></div>
	<div class="blockish-offcanvas-panel">
		<div class="blockish-offcanvas-header">
			<div class="blockish-offcanvas-branding"><?php echo $branding; ?></div>
			<button type="button" class="blockish-offcanvas-close" aria-label="<?php esc_attr_e( 'Close menu', 'blockish' ); ?>">&times;</button>
		</div>
		<nav class="blockish-offcanvas-nav" aria-label="<?php esc_attr_e( 'Mobile navigation', 'blockish' ); ?>">
			<?php echo $content; ?>
		</nav>
	</div>
</div>
