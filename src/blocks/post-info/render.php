<?php
/**
 * Post Info — server render.
 *
 * @var array    $attributes Block attributes.
 * @var WP_Block $block      Block instance.
 */

defined( 'ABSPATH' ) || exit;

use Blockish\Core\Utilities;

$blockish_post_info_post_id = isset( $block->context['postId'] )
	? (int) $block->context['postId']
	: get_the_ID();

if ( ! $blockish_post_info_post_id ) {
	return;
}

$blockish_post_info_post = get_post( $blockish_post_info_post_id );

if ( ! $blockish_post_info_post ) {
	return;
}

$blockish_post_info_items = isset( $attributes['items'] ) && is_array( $attributes['items'] )
	? $attributes['items']
	: array();

if ( empty( $blockish_post_info_items ) ) {
	return;
}

$blockish_post_info_layout = isset( $attributes['layout']['value'] )
	? $attributes['layout']['value']
	: 'row';
$blockish_post_info_separator = isset( $attributes['separator']['value'] )
	? $attributes['separator']['value']
	: 'dot';

$blockish_post_info_default_icons = array(
	'author'   => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
	),
	'date'     => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z',
	),
	'modified' => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zM9 14H7v-2h2v2zm4 0h-2v-2h2v2zm4 0h-2v-2h2v2z',
	),
	'time'     => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z',
	),
	'comments' => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M21.99 4c0-1.1-.89-2-1.99-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4-.01-18zM18 14H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z',
	),
	'terms'    => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z',
	),
	'reading-time' => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM6 4h5v8l-2.5-1.5L6 12V4zm0 16V14.5l5.5-3.5L17 14.5V20H6z',
	),
	'word-count' => array(
		'viewBox' => array( 0, 0, 24, 24 ),
		'path'    => 'M2.5 4v3h5v12h3V7h5V4H2.5zM21.5 9h-9v3h3v7h3v-7h3V9z',
	),
);

$blockish_post_info_attr_value = static function ( $value, $fallback = '' ) {
	if ( is_array( $value ) && isset( $value['value'] ) ) {
		return $value['value'];
	}
	return '' !== $value && null !== $value ? $value : $fallback;
};

$blockish_post_info_render_icon = static function ( $item, $type ) use ( $blockish_post_info_default_icons, $blockish_post_info_attr_value ) {
	$icon_style = $blockish_post_info_attr_value( $item['icon'] ?? 'default', 'default' );

	if ( 'none' === $icon_style ) {
		return '';
	}

	if ( ! empty( $item['showAvatar'] ) && 'author' === $type ) {
		return '';
	}

	if ( 'custom' === $icon_style && ! empty( $item['customIcon'] ) ) {
		return Utilities::render_icon( $item['customIcon'], 'blockish-icon' );
	}

	if ( empty( $blockish_post_info_default_icons[ $type ] ) ) {
		return '';
	}

	return Utilities::render_icon( $blockish_post_info_default_icons[ $type ], 'blockish-icon' );
};

$blockish_post_info_wrap_item = static function ( $type, $inner, $url = '', $is_link = false ) {
	$class = 'blockish-post-info__item is-type-' . sanitize_html_class( $type );

	if ( $is_link && $url ) {
		return sprintf(
			'<a class="%1$s" href="%2$s">%3$s</a>',
			esc_attr( $class ),
			esc_url( $url ),
			$inner
		);
	}

	return sprintf( '<span class="%1$s">%2$s</span>', esc_attr( $class ), $inner );
};

$blockish_post_info_entries = array();
$author_id                  = (int) $blockish_post_info_post->post_author;
$author_name                = get_the_author_meta( 'display_name', $author_id );
$author_url                 = get_author_posts_url( $author_id );
$site_date_format           = get_option( 'date_format' );
$site_time_format           = get_option( 'time_format' );

$blockish_post_info_count_words = static function ( $content ) {
	$text = wp_strip_all_tags( strip_shortcodes( (string) $content ) );
	$text = preg_replace( '/\s+/u', ' ', trim( $text ) );

	if ( '' === $text ) {
		return 0;
	}

	$parts = preg_split( '/\s+/u', $text, -1, PREG_SPLIT_NO_EMPTY );

	return is_array( $parts ) ? count( $parts ) : 0;
};

foreach ( $blockish_post_info_items as $item ) {
	$type        = sanitize_key( $blockish_post_info_attr_value( $item['type'] ?? 'date', 'date' ) );
	$before_text = isset( $item['beforeText'] ) ? $item['beforeText'] : '';
	$is_link     = ! empty( $item['link'] );
	$icon_html   = $blockish_post_info_render_icon( $item, $type );
	$icon_markup = $icon_html
		? '<span class="blockish-post-info__icon">' . $icon_html . '</span>'
		: '';

	switch ( $type ) {
		case 'author':
			$avatar = '';
			if ( ! empty( $item['showAvatar'] ) ) {
				$avatar_size = isset( $item['avatarSize'] ) ? (int) $item['avatarSize'] : 16;
				$avatar      = get_avatar(
					$author_id,
					$avatar_size,
					'',
					'',
					array(
						'class' => 'blockish-post-info__avatar',
					)
				);
			}
			$inner = $avatar . $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $author_name ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item(
				$type,
				$inner,
				$author_url,
				$is_link
			);
			break;

		case 'date':
		case 'modified':
			$format_value = $blockish_post_info_attr_value( $item['dateFormat'] ?? 'default', 'default' );
			$format       = ( 'default' === $format_value ) ? $site_date_format : $format_value;
			$label        = ( 'modified' === $type )
				? get_the_modified_date( $format, $blockish_post_info_post )
				: get_the_date( $format, $blockish_post_info_post );
			$url          = ( 'date' === $type )
				? get_day_link(
					get_post_time( 'Y', false, $blockish_post_info_post ),
					get_post_time( 'm', false, $blockish_post_info_post ),
					get_post_time( 'd', false, $blockish_post_info_post )
				)
				: get_permalink( $blockish_post_info_post_id );
			$inner        = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $label ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner, $url, $is_link );
			break;

		case 'time':
			$format_value = $blockish_post_info_attr_value( $item['timeFormat'] ?? 'default', 'default' );
			$format       = ( 'default' === $format_value ) ? $site_time_format : $format_value;
			$label        = get_the_time( $format, $blockish_post_info_post );
			$inner        = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $label ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner );
			break;

		case 'comments':
			$count = (int) get_comments_number( $blockish_post_info_post_id );
			$label = sprintf(
				/* translators: %d: number of comments */
				_n( '%d Comment', '%d Comments', $count, 'blockish' ),
				$count
			);
			$url   = get_comments_link( $blockish_post_info_post_id );
			$inner = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $label ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner, $url, $is_link );
			break;

		case 'terms':
			$taxonomy  = sanitize_key( $blockish_post_info_attr_value( $item['taxonomy'] ?? 'category', 'category' ) );
			$count     = isset( $item['termsCount'] ) ? max( 1, (int) $item['termsCount'] ) : 3;
			$separator = isset( $item['termsSeparator'] ) ? $item['termsSeparator'] : ', ';
			$terms     = get_the_terms( $blockish_post_info_post_id, $taxonomy );

			if ( empty( $terms ) || is_wp_error( $terms ) ) {
				break;
			}

			$terms     = array_slice( $terms, 0, $count );
			$term_html = array();

			foreach ( $terms as $term ) {
				$term_name = esc_html( $term->name );
				if ( $is_link ) {
					$term_html[] = sprintf(
						'<a href="%1$s">%2$s</a>',
						esc_url( get_term_link( $term ) ),
						$term_name
					);
				} else {
					$term_html[] = $term_name;
				}
			}

			$inner = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text )
				. implode( esc_html( $separator ), $term_html )
				. '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner );
			break;

		case 'reading-time':
			$word_count = $blockish_post_info_count_words( $blockish_post_info_post->post_content );
			$wpm        = isset( $item['wordsPerMinute'] ) ? max( 1, (int) $item['wordsPerMinute'] ) : 200;
			$minutes    = ( $word_count < 1 ) ? 0 : max( 1, (int) ceil( $word_count / $wpm ) );
			$label      = sprintf(
				/* translators: %d: estimated reading time in minutes */
				_n( '%d min read', '%d min read', $minutes, 'blockish' ),
				$minutes
			);
			$inner = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $label ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner );
			break;

		case 'word-count':
			$word_count = $blockish_post_info_count_words( $blockish_post_info_post->post_content );
			$label      = sprintf(
				/* translators: %d: number of words */
				_n( '%d word', '%d words', $word_count, 'blockish' ),
				number_format_i18n( $word_count )
			);
			$inner = $icon_markup . '<span class="blockish-post-info__text">'
				. esc_html( $before_text ) . esc_html( $label ) . '</span>';
			$blockish_post_info_entries[] = $blockish_post_info_wrap_item( $type, $inner );
			break;
	}
}

if ( empty( $blockish_post_info_entries ) ) {
	return;
}

$separator_chars = array(
	'dot'  => '·',
	'pipe' => '|',
);
$char            = isset( $separator_chars[ $blockish_post_info_separator ] )
	? $separator_chars[ $blockish_post_info_separator ]
	: '';

$list_items = '';
$total      = count( $blockish_post_info_entries );

foreach ( $blockish_post_info_entries as $index => $entry ) {
	$list_items .= '<li class="blockish-post-info__entry">' . $entry;

	if ( $char && $index < $total - 1 ) {
		$list_items .= '<span class="blockish-post-info__separator" aria-hidden="true">'
			. esc_html( $char )
			. '</span>';
	}

	$list_items .= '</li>';
}

$wrapper_class = sprintf(
	'blockish-post-info is-layout-%1$s is-separator-%2$s',
	sanitize_html_class( $blockish_post_info_layout ),
	sanitize_html_class( $blockish_post_info_separator )
);

printf(
	'<ul %1$s>%2$s</ul>',
	get_block_wrapper_attributes( array( 'class' => $wrapper_class ) ), // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
	$list_items // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
);
