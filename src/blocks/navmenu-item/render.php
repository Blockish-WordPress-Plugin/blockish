<?php
defined( 'ABSPATH' ) || exit;

$label          = $attributes['label'] ?? '';
$url            = $attributes['url'] ?? '#';
$open_new_tab   = ! empty( $attributes['openInNewTab'] );

$wrapper_attrs = get_block_wrapper_attributes( [
	'class' => 'blockish-block-navmenu-item',
] );
?>
<a <?php echo $wrapper_attrs; ?>
	href="<?php echo esc_url( $url ); ?>"
	<?php if ( $open_new_tab ) : ?>
		target="_blank"
		rel="noopener noreferrer"
	<?php endif; ?>
>
	<span><?php echo wp_kses_post( $label ); ?></span>
</a>
