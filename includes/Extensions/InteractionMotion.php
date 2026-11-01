<?php

namespace Blockish\Extensions;

defined( 'ABSPATH' ) || exit;

/**
 * Sanitizes interaction motion (action.motion) and preset ids for every
 * interaction library write (MCP manage-interactions, dashboard import).
 *
 * Key lists mirror what the GSAP player reads (Blockish Pro
 * src/extensions/animation/tweens.js + player.js), so nothing the engine can
 * play is stripped.
 */
class InteractionMotion {

	/** Numeric tween keys => [min, max]. */
	const NUMERIC_KEYS = array(
		'x'                => array( -5000, 5000 ),
		'y'                => array( -5000, 5000 ),
		'z'                => array( -5000, 5000 ),
		'scale'            => array( 0, 20 ),
		'scaleX'           => array( 0, 20 ),
		'scaleY'           => array( 0, 20 ),
		'rotation'         => array( -3600, 3600 ),
		'rotationX'        => array( -3600, 3600 ),
		'rotationY'        => array( -3600, 3600 ),
		'rotationZ'        => array( -3600, 3600 ),
		'skewX'            => array( -180, 180 ),
		'skewY'            => array( -180, 180 ),
		'xPercent'         => array( -500, 500 ),
		'yPercent'         => array( -500, 500 ),
		'opacity'          => array( 0, 1 ),
		'autoAlpha'        => array( 0, 1 ),
		'blur'             => array( 0, 200 ),
		'brightness'       => array( 0, 500 ),
		'contrast'         => array( 0, 500 ),
		'grayscale'        => array( 0, 100 ),
		'hueRotate'        => array( -360, 360 ),
		'borderRadius'     => array( 0, 1000 ),
		'borderWidth'      => array( 0, 200 ),
		'letterSpacing'    => array( -50, 200 ),
		'strokeDashoffset' => array( -10000, 10000 ),
	);

	/** String tween keys => max length. */
	const STRING_KEYS = array(
		'transformOrigin' => 60,
		'backgroundColor' => 80,
		'color'           => 80,
		'borderColor'     => 80,
		'clipPath'        => 300,
		'width'           => 40,
		'height'          => 40,
		'boxShadow'       => 200,
		'drawSVG'         => 40,
		'morphSVG'        => 4000,
		'stroke'          => 80,
		'fill'            => 80,
		'text'            => 500,
		'scrambleText'    => 500,
		'motionPath'      => 4000,
	);

	const STAGGER_FROM   = array( 'start', 'center', 'end', 'edges', 'random' );
	const TOGGLE_ACTIONS = array( 'play', 'pause', 'resume', 'reverse', 'restart', 'reset', 'complete', 'none' );

	/**
	 * @param mixed $motion Raw action.motion.
	 * @return array|null Clean motion, or null when it has no tweens.
	 */
	public static function sanitize_motion( $motion ) {
		if ( ! is_array( $motion ) || empty( $motion['tweens'] ) || ! is_array( $motion['tweens'] ) ) {
			return null;
		}

		$tweens = array();
		foreach ( array_slice( $motion['tweens'], 0, 12 ) as $tween ) {
			if ( ! is_array( $tween ) ) {
				continue;
			}
			$clean = array(
				'from'     => self::sanitize_vars( $tween['from'] ?? array() ),
				'to'       => self::sanitize_vars( $tween['to'] ?? array() ),
				'duration' => self::clamp( $tween['duration'] ?? 0.6, 0, 30 ),
				'delay'    => self::clamp( $tween['delay'] ?? 0, 0, 30 ),
				'ease'     => self::sanitize_ease( (string) ( $tween['ease'] ?? 'power1.inOut' ) ),
			);
			// Optional per-step target (selector inside the block).
			if ( isset( $tween['target'] ) && '' !== trim( (string) $tween['target'] ) ) {
				$clean['target'] = substr( sanitize_text_field( (string) $tween['target'] ), 0, 120 );
			}
			if ( array_key_exists( 'position', $tween ) ) {
				$clean['position'] = is_numeric( $tween['position'] )
					? self::clamp( $tween['position'], 0, 60 )
					: sanitize_text_field( (string) $tween['position'] );
			}
			$tweens[] = $clean;
		}
		if ( ! $tweens ) {
			return null;
		}

		$out = array( 'tweens' => $tweens );

		// Targets: self (empty), children, split text, or a CSS selector inside the block.
		if ( isset( $motion['target'] ) && '' !== trim( (string) $motion['target'] ) ) {
			$out['target'] = substr( sanitize_text_field( (string) $motion['target'] ), 0, 120 );
		}
		if ( array_key_exists( 'maskLines', $motion ) ) {
			$out['maskLines'] = (bool) $motion['maskLines'];
		}

		// Stagger: number of seconds, or GSAP object { each, from, ease }.
		$stagger = $motion['stagger'] ?? null;
		if ( is_array( $stagger ) ) {
			$out['stagger'] = self::clamp( $stagger['each'] ?? 0, 0, 5 );
			if ( isset( $stagger['from'] ) && in_array( $stagger['from'], self::STAGGER_FROM, true ) ) {
				$out['staggerFrom'] = $stagger['from'];
			}
		} elseif ( null !== $stagger && '' !== $stagger ) {
			$out['stagger'] = self::clamp( $stagger, 0, 5 );
		}
		if ( isset( $motion['staggerFrom'] ) && in_array( $motion['staggerFrom'], self::STAGGER_FROM, true ) ) {
			$out['staggerFrom'] = $motion['staggerFrom'];
		}
		if ( ! empty( $motion['staggerEase'] ) ) {
			$out['staggerEase'] = self::sanitize_ease( (string) $motion['staggerEase'] );
		}

		// Loop.
		if ( isset( $motion['repeat'] ) && '' !== $motion['repeat'] ) {
			$out['repeat'] = (int) max( -1, min( 100, (int) $motion['repeat'] ) );
		}
		if ( isset( $motion['repeatDelay'] ) ) {
			$out['repeatDelay'] = self::clamp( $motion['repeatDelay'], 0, 30 );
		}
		if ( array_key_exists( 'yoyo', $motion ) ) {
			$out['yoyo'] = (bool) $motion['yoyo'];
		}

		// Scroll (ScrollTrigger).
		if ( ! empty( $motion['pin'] ) ) {
			$out['pin'] = true;
		}
		$pin_end = self::sanitize_scroll_position( $motion['pinEnd'] ?? '' );
		if ( '' !== $pin_end ) {
			$out['pinEnd'] = $pin_end;
		}
		$pin_start = self::sanitize_pin_start( $motion['pinStart'] ?? '' );
		if ( '' !== $pin_start ) {
			$out['pinStart'] = $pin_start;
		}
		if ( array_key_exists( 'scrub', $motion ) ) {
			$scrub = $motion['scrub'];
			if ( true === $scrub || 'true' === $scrub || 'locked' === $scrub ) {
				$out['scrub'] = true;
			} elseif ( false === $scrub || 'false' === $scrub || 'none' === $scrub ) {
				$out['scrub'] = false;
			} else {
				$out['scrub'] = self::clamp( $scrub, 0, 3 );
			}
		}
		foreach ( array( 'scrollStart', 'scrollEnd' ) as $key ) {
			$value = self::sanitize_scroll_position( $motion[ $key ] ?? '' );
			if ( '' !== $value ) {
				$out[ $key ] = $value;
			}
		}
		$toggle = self::sanitize_toggle_actions( $motion['toggleActions'] ?? '' );
		if ( '' !== $toggle ) {
			$out['toggleActions'] = $toggle;
		}
		if ( array_key_exists( 'markers', $motion ) ) {
			$out['markers'] = (bool) $motion['markers'];
		}

		if ( isset( $motion['transformOrigin'] ) ) {
			$origin = self::sanitize_transform_origin( $motion['transformOrigin'] );
			if ( '' !== $origin ) {
				$out['transformOrigin'] = $origin;
			}
		}

		return $out;
	}

	/**
	 * Core ids (fadeUp…) and addon ids (Pro: split-word-mask…) are slugs.
	 */
	public static function sanitize_preset_id( string $preset ): string {
		$preset = sanitize_text_field( $preset );
		return preg_match( '/^[A-Za-z0-9_-]{1,40}$/', $preset ) ? $preset : 'fadeUp';
	}

	/**
	 * GSAP ease string: names, dots and config parens (power2.out, back.out(1.7), blockishBounce).
	 */
	public static function sanitize_ease( string $ease ): string {
		$ease = sanitize_text_field( $ease );
		if ( strlen( $ease ) <= 80 && preg_match( '/^[a-z0-9._, +\-()]+$/i', $ease ) ) {
			return $ease;
		}
		return 'power1.inOut';
	}

	/**
	 * @param mixed $vars Raw tween from/to vars.
	 */
	private static function sanitize_vars( $vars ): array {
		if ( ! is_array( $vars ) ) {
			return array();
		}
		$out = array();
		foreach ( self::NUMERIC_KEYS as $key => $range ) {
			if ( array_key_exists( $key, $vars ) && '' !== $vars[ $key ] && is_numeric( $vars[ $key ] ) ) {
				$out[ $key ] = self::clamp( $vars[ $key ], $range[0], $range[1] );
			}
		}
		foreach ( self::STRING_KEYS as $key => $max_length ) {
			if ( isset( $vars[ $key ] ) && is_scalar( $vars[ $key ] ) && '' !== trim( (string) $vars[ $key ] ) ) {
				$out[ $key ] = substr( sanitize_text_field( (string) $vars[ $key ] ), 0, $max_length );
			}
		}
		return $out;
	}

	/**
	 * ScrollTrigger start/end ("top 80%", "bottom top", "+=120%", "+=800").
	 */
	private static function sanitize_scroll_position( $raw ): string {
		$s = trim( (string) $raw );
		if ( '' === $s || strlen( $s ) > 40 ) {
			return '';
		}
		return preg_match( '/^[+\-=%\s0-9.a-zA-Z]+$/', $s ) ? $s : '';
	}

	/**
	 * Pin start: auto (below header), 0 (viewport top), or pixel offset.
	 */
	private static function sanitize_pin_start( $raw ): string {
		$s = strtolower( trim( (string) $raw ) );
		if ( '' === $s || 'auto' === $s ) {
			return 'auto';
		}
		if ( '0' === $s || 'top' === $s ) {
			return '0';
		}
		if ( is_numeric( $s ) ) {
			return (string) max( 0, min( 400, (int) round( (float) $s ) ) );
		}
		return '';
	}

	private static function sanitize_toggle_actions( $raw ): string {
		$parts = preg_split( '/\s+/', strtolower( trim( (string) $raw ) ) );
		if ( 4 !== count( $parts ) ) {
			return '';
		}
		foreach ( $parts as $part ) {
			if ( ! in_array( $part, self::TOGGLE_ACTIONS, true ) ) {
				return '';
			}
		}
		return implode( ' ', $parts );
	}

	private static function sanitize_transform_origin( $raw ): string {
		$s = sanitize_text_field( (string) $raw );
		if ( '' === $s || strlen( $s ) > 40 ) {
			return '';
		}
		return preg_match( '/^[0-9.%\sleftcenterrighttopbottom-]+$/i', $s ) ? $s : '';
	}

	/**
	 * @param mixed $value Raw number.
	 */
	public static function clamp( $value, $min, $max ): float {
		$n = is_numeric( $value ) ? (float) $value : 0.0;
		return max( $min, min( $max, $n ) );
	}
}
