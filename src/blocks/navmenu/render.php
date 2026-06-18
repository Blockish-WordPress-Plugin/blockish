<?php
defined( 'ABSPATH' ) || exit;

$breakpoint_map = [
	'tablet' => 768,
	'mobile' => 480,
];

$menu_breakpoint    = $attributes['menuBreakpoint'] ?? 'tablet';
$breakpoint_custom  = $attributes['menuBreakpointCustom'] ?? 992;
$breakpoint_px      = $menu_breakpoint === 'custom'
	? $breakpoint_custom
	: ( $breakpoint_map[ $menu_breakpoint ] ?? 768 );
$scroll_lock        = isset( $attributes['scrollLockOffcanvas'] ) ? $attributes['scrollLockOffcanvas'] : true;
$animation          = $attributes['menuAnimation'] ?? 'none';
$is_vertical        = ! empty( $attributes['isVertical'] );

$wrapper_attrs = get_block_wrapper_attributes( [
	'class'           => 'blockish-block-navmenu' . ( $is_vertical ? ' is-vertical' : '' ),
	'data-breakpoint' => $breakpoint_px,
	'data-scroll-lock'=> $scroll_lock ? 'true' : 'false',
	'data-animation'  => $animation,
] );
?>
<div <?php echo $wrapper_attrs; ?>>
	<div class="blockish-block-navmenu-wrapper">
		<nav class="blockish-block-navmenu-nav" aria-label="<?php esc_attr_e( 'Navigation', 'blockish' ); ?>">
			<?php echo $content; ?>
		</nav>
		<button type="button" class="blockish-block-navmenu-toggle" aria-label="<?php esc_attr_e( 'Toggle navigation', 'blockish' ); ?>" aria-expanded="false">
			<svg width="22" height="16" viewBox="0 0 22 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
				<rect width="22" height="2" rx="1" fill="currentColor"/>
				<rect y="7" width="22" height="2" rx="1" fill="currentColor"/>
				<rect y="14" width="22" height="2" rx="1" fill="currentColor"/>
			</svg>
		</button>
	</div>
	<div class="blockish-block-navmenu-offcanvas" aria-hidden="true">
		<div class="blockish-block-navmenu-offcanvas-inner">
			<button type="button" class="blockish-block-navmenu-close" aria-label="<?php esc_attr_e( 'Close navigation', 'blockish' ); ?>">
				<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
					<path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
				</svg>
			</button>
			<nav class="blockish-block-navmenu-offcanvas-nav" aria-label="<?php esc_attr_e( 'Mobile navigation', 'blockish' ); ?>"></nav>
		</div>
	</div>
	<div class="blockish-block-navmenu-overlay" aria-hidden="true"></div>
</div>
