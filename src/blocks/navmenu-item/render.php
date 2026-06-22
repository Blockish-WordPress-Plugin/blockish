<?php
defined( 'ABSPATH' ) || exit;

$label        = $attributes['label'] ?? '';
$url          = $attributes['url'] ?? '#';
$open_new_tab = ! empty( $attributes['openInNewTab'] );
$has_submenu  = ! empty( trim( $content ?? '' ) );
$link_id      = absint( $attributes['linkId'] ?? 0 );

$rel_parts = array_filter( [
	trim( $attributes['rel'] ?? '' ),
	$open_new_tab ? 'noopener noreferrer' : '',
] );
$rel = implode( ' ', $rel_parts );

$wrapper_attrs = get_block_wrapper_attributes( array_merge(
	[ 'class' => 'blockish-block-navmenu-item' ],
	$link_id ? [ 'data-id' => $link_id ] : []
) );

$submenu_indicator = '<svg class="blockish-navmenu-submenu-arrow" width="10" height="10" viewBox="0 0 32 32" fill="currentColor" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path d="M0 9.6c0-0.205 0.078-0.409 0.234-0.566 0.312-0.312 0.819-0.312 1.131 0l13.834 13.834 13.834-13.834c0.312-0.312 0.819-0.312 1.131 0s0.312 0.819 0 1.131l-14.4 14.4c-0.312 0.312-0.819 0.312-1.131 0l-14.4-14.4c-0.156-0.156-0.234-0.361-0.234-0.566z"></path></svg>';
?>
<div <?php echo $wrapper_attrs; ?>>
	<a
		class="blockish-navmenu-item-link"
		href="<?php echo esc_url( $url ); ?>"
		<?php if ( $open_new_tab ) : ?>
			target="_blank"
		<?php endif; ?>
		<?php if ( $rel ) : ?>
			rel="<?php echo esc_attr( $rel ); ?>"
		<?php endif; ?>
		<?php if ( $has_submenu ) : ?>
			aria-haspopup="true"
			aria-expanded="false"
		<?php endif; ?>
	>
		<span><?php echo wp_kses_post( $label ); ?></span>
		<?php if ( $has_submenu ) : ?>
			<?php echo $submenu_indicator; ?>
		<?php endif; ?>
	</a>
	<?php if ( $has_submenu ) : ?>
		<?php echo $content; ?>
	<?php endif; ?>
</div>
