<?php
defined( 'ABSPATH' ) || exit;

use Blockish\Core\Utilities;

$label        = $attributes['label'] ?? '';
$url          = $attributes['url'] ?? '#';
$open_new_tab = ! empty( $attributes['openInNewTab'] );
$has_submenu  = ! empty( trim( $content ?? '' ) );
$link_id      = absint( $attributes['linkId'] ?? 0 );

$icon          = $attributes['icon'] ?? array();
$icon_position = $attributes['iconPosition'] ?? 'left';
$icon_svg      = Utilities::render_icon( $icon );
$icon_markup   = $icon_svg
	? '<span class="blockish-navmenu-item-icon" aria-hidden="true">' . $icon_svg . '</span>'
	: '';

$rel_parts = array_filter( [
	trim( $attributes['rel'] ?? '' ),
	$open_new_tab ? 'noopener noreferrer' : '',
] );
$rel = implode( ' ', $rel_parts );

$link_class = 'blockish-navmenu-item-link';
if ( $icon_markup ) {
	$link_class .= ' has-icon';
	if ( 'right' === $icon_position ) {
		$link_class .= ' icon-position-right';
	}
}

$wrapper_attrs = get_block_wrapper_attributes( array_merge(
	[ 'class' => 'blockish-block-navmenu-item' ],
	$link_id ? [ 'data-id' => $link_id ] : []
) );

$submenu_arrow = '<svg class="blockish-navmenu-submenu-arrow" width="10" height="10" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M0 9.6c0-0.205 0.078-0.409 0.234-0.566 0.312-0.312 0.819-0.312 1.131 0l13.834 13.834 13.834-13.834c0.312-0.312 0.819-0.312 1.131 0s0.312 0.819 0 1.131l-14.4 14.4c-0.312 0.312-0.819 0.312-1.131 0l-14.4-14.4c-0.156-0.156-0.234-0.361-0.234-0.566z"></path></svg>';
?>
<div <?php echo $wrapper_attrs; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Wrapper attributes generated safely by core. ?>>
	<a
		class="<?php echo esc_attr( $link_class ); ?>"
		href="<?php echo esc_url( $url ); ?>"
		<?php if ( $open_new_tab ) : ?>
			target="_blank"
		<?php endif; ?>
		<?php if ( $rel ) : ?>
			rel="<?php echo esc_attr( $rel ); ?>"
		<?php endif; ?>
	>
		<?php if ( 'right' !== $icon_position ) {
			echo $icon_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized in render_icon
		} ?>
		<span><?php echo wp_kses_post( $label ); ?></span>
		<?php if ( 'right' === $icon_position ) {
			echo $icon_markup; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- sanitized in render_icon
		} ?>
	</a>
	<?php if ( $has_submenu ) : ?>
		<?php
		// A real, focusable <button> instead of a click handler on the
		// decorative arrow — that arrow used to be the *only* way to open a
		// submenu and was aria-hidden + unfocusable, locking keyboard users
		// out entirely. Has to be a sibling of the <a>, not nested inside it
		// (a <button> inside an <a> is invalid HTML and would be unreachable
		// via Tab anyway).
		?>
		<button
			type="button"
			class="blockish-navmenu-submenu-toggle"
			aria-expanded="false"
			aria-label="<?php echo esc_attr( sprintf(
				/* translators: %s: menu item label */
				__( 'Show submenu for %s', 'blockish' ),
				wp_strip_all_tags( $label )
			) ); ?>"
		>
			<?php echo $submenu_arrow; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Contains SVG. ?>
		</button>
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- Inner blocks content. ?>
	<?php endif; ?>
</div>
