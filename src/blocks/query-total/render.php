<?php
/**
 * Query Total — server render.
 *
 * Uses Dynamicity Query Builder loopContext when present; otherwise the main query
 * (search, archive, blog). Label text comes from editable format templates.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

$blockish_query_total_loop = isset( $block->context['blockish-dynamicity/loopContext'] )
	? $block->context['blockish-dynamicity/loopContext']
	: null;

$blockish_query_total_query = null;
$blockish_query_total_page  = 1;

if (
	is_array( $blockish_query_total_loop )
	&& isset( $blockish_query_total_loop['query'] )
	&& $blockish_query_total_loop['query'] instanceof WP_Query
) {
	$blockish_query_total_query = $blockish_query_total_loop['query'];
	$blockish_query_total_paged = (int) $blockish_query_total_query->get( 'paged' );
	$blockish_query_total_page  = max( 1, $blockish_query_total_paged );
} else {
	global $wp_query;

	if ( ! $wp_query instanceof WP_Query ) {
		return;
	}

	$blockish_query_total_query = $wp_query;
	$blockish_query_total_page  = max( 1, (int) get_query_var( 'paged', 1 ) );
}

$blockish_query_total_max = (int) $blockish_query_total_query->found_posts;
$blockish_query_total_ppp = (int) $blockish_query_total_query->get( 'posts_per_page' );

if ( $blockish_query_total_ppp < 1 ) {
	$blockish_query_total_ppp = (int) get_option( 'posts_per_page', 10 );
}

$blockish_query_total_start = ( 0 === $blockish_query_total_max )
	? 0
	: ( ( $blockish_query_total_page - 1 ) * $blockish_query_total_ppp + 1 );
$blockish_query_total_end   = min(
	$blockish_query_total_start + $blockish_query_total_ppp - 1,
	$blockish_query_total_max
);

$blockish_query_total_display = isset( $attributes['displayType']['value'] )
	? $attributes['displayType']['value']
	: 'total-results';

$blockish_query_total_tokens = array(
	'{count}' => number_format_i18n( $blockish_query_total_max ),
	'{start}' => number_format_i18n( $blockish_query_total_start ),
	'{end}'   => number_format_i18n( $blockish_query_total_end ),
	'{total}' => number_format_i18n( $blockish_query_total_max ),
);

$blockish_query_total_apply_format = static function ( $template, $tokens ) {
	return strtr( (string) $template, $tokens );
};

if ( 'range-display' === $blockish_query_total_display ) {
	if ( $blockish_query_total_start === $blockish_query_total_end ) {
		$blockish_query_total_template = isset( $attributes['rangeFormatSingle'] ) && '' !== $attributes['rangeFormatSingle']
			? $attributes['rangeFormatSingle']
			: 'Displaying {start} of {total}';
	} else {
		$blockish_query_total_template = isset( $attributes['rangeFormat'] ) && '' !== $attributes['rangeFormat']
			? $attributes['rangeFormat']
			: 'Displaying {start} – {end} of {total}';
	}
} elseif ( 1 === $blockish_query_total_max ) {
	$blockish_query_total_template = isset( $attributes['totalFormatSingular'] ) && '' !== $attributes['totalFormatSingular']
		? $attributes['totalFormatSingular']
		: '{count} result found';
} else {
	$blockish_query_total_template = isset( $attributes['totalFormat'] ) && '' !== $attributes['totalFormat']
		? $attributes['totalFormat']
		: '{count} results found';
}

$blockish_query_total_output = $blockish_query_total_apply_format(
	$blockish_query_total_template,
	$blockish_query_total_tokens
);

$blockish_query_total_allowed_tags = array( 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span' );
$blockish_query_total_tag          = isset( $attributes['tag']['value'] )
	? $attributes['tag']['value']
	: 'p';

if ( ! in_array( $blockish_query_total_tag, $blockish_query_total_allowed_tags, true ) ) {
	$blockish_query_total_tag = 'p';
}

printf(
	'<%1$s %2$s>%3$s</%1$s>',
	tag_escape( $blockish_query_total_tag ),
	get_block_wrapper_attributes( array( 'class' => 'blockish-query-total' ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	esc_html( $blockish_query_total_output )
);
