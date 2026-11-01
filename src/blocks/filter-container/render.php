<?php
// phpcs:disable WordPress.NamingConventions.PrefixAllGlobals.NonPrefixedVariableFound

defined( 'ABSPATH' ) || exit;

$show_search        = $attributes['showSearch'] ?? true;
$search_placeholder = $attributes['searchPlaceholder'] ?? __( 'Search…', 'blockish' );
$show_filters       = $attributes['showFilters'] ?? true;
$all_label          = $attributes['allLabel'] ?? __( 'All', 'blockish' );
$filter_mode        = $attributes['filterMode'] ?? 'single';
$search_in_text     = ! empty( $attributes['searchInText'] );
$empty_message      = $attributes['emptyMessage'] ?? __( 'No results found.', 'blockish' );
$items_layout       = ( isset( $attributes['itemsLayout'] ) && 'stack' === $attributes['itemsLayout'] ) ? 'stack' : 'grid';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class'            => 'blockish-filter-container',
		'data-filter-mode' => 'multiple' === $filter_mode ? 'multiple' : 'single',
		'data-search-text' => $search_in_text ? 'true' : 'false',
	)
);
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php if ( $show_search || $show_filters ) : ?>
		<div class="blockish-filter-controls">
			<?php if ( $show_filters ) : ?>
				<div
					class="blockish-filter-buttons"
					role="group"
					aria-label="<?php echo esc_attr( $all_label ); ?>"
					data-all-label="<?php echo esc_attr( $all_label ); ?>"
				></div>
			<?php endif; ?>
			<?php if ( $show_search ) : ?>
				<div class="blockish-filter-search-box">
					<svg
						class="blockish-filter-search-icon"
						width="16"
						height="16"
						viewBox="0 0 16 16"
						fill="none"
						stroke="currentColor"
						stroke-width="1.6"
						aria-hidden="true"
					>
						<circle cx="7" cy="7" r="5"></circle>
						<path d="M11 11l3.5 3.5"></path>
					</svg>
					<input
						type="search"
						class="blockish-filter-search"
						placeholder="<?php echo esc_attr( $search_placeholder ); ?>"
						aria-label="<?php echo esc_attr( $search_placeholder ); ?>"
					/>
				</div>
			<?php endif; ?>
		</div>
	<?php endif; ?>
	<div class="blockish-filter-items is-layout-<?php echo esc_attr( $items_layout ); ?>">
		<?php echo $content; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	</div>
	<p class="blockish-filter-empty" hidden>
		<?php echo esc_html( $empty_message ); ?>
	</p>
	<p class="blockish-filter-status" aria-live="polite"></p>
</div>

