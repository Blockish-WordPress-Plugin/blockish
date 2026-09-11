<?php

namespace Blockish\Mcp\Abilities\ManageInteractions;

defined( 'ABSPATH' ) || exit;

class Callbacks
{
	/**
	 * @param array|object $input Ability input.
	 * @return array
	 * @throws \Exception
	 */
	public static function execute( $input ): array {
		$input = self::normalize_input( $input );
		$action = isset( $input['action'] ) ? sanitize_key( (string) $input['action'] ) : 'get';
		$scope  = isset( $input['scope'] ) ? sanitize_key( (string) $input['scope'] ) : '';

		if ( ! in_array( $scope, [ 'global', 'page' ], true ) ) {
			throw new \Exception( 'scope is required and must be "global" or "page".' );
		}

		if ( ! in_array( $action, [ 'get', 'update' ], true ) ) {
			throw new \Exception( 'action must be "get" or "update".' );
		}

		$post_id = 0;
		if ( 'page' === $scope ) {
			$post_id = isset( $input['post_id'] ) ? absint( $input['post_id'] ) : 0;
			if ( $post_id <= 0 ) {
				throw new \Exception( 'post_id is required when scope is "page".' );
			}
			$post = get_post( $post_id );
			if ( ! $post ) {
				throw new \Exception( esc_html( sprintf( 'post_id %d not found.', $post_id ) ) );
			}
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				throw new \Exception( esc_html( sprintf( 'You cannot edit post_id %d.', $post_id ) ) );
			}
		} elseif ( ! current_user_can( 'edit_theme_options' ) ) {
			throw new \Exception( 'edit_theme_options is required for global interactions.' );
		}

		if ( 'update' === $action ) {
			if ( ! isset( $input['interactions'] ) || ! is_array( $input['interactions'] ) ) {
				throw new \Exception( 'Missing or invalid "interactions" array for update.' );
			}

			$sanitized = [];
			foreach ( $input['interactions'] as $item ) {
				if ( ! is_array( $item ) ) {
					continue;
				}
				$clean = self::sanitize_interaction_item( $item );
				$clean['scope'] = $scope;
				if ( empty( $clean['id'] ) ) {
					continue;
				}
				$sanitized[] = $clean;
			}

			if ( 'global' === $scope ) {
				update_option( 'blockish_global_interactions', array_values( $sanitized ), false );
			} else {
				update_post_meta( $post_id, 'blockish_page_interactions', array_values( $sanitized ) );
			}

			$interactions = $sanitized;
			$message      = 'page' === $scope
				? sprintf( 'Page interactions updated for post_id %d.', $post_id )
				: 'Global interactions updated successfully.';
		} else {
			$interactions = self::read_interactions( $scope, $post_id );
			$message      = 'page' === $scope
				? sprintf( 'Page interactions retrieved for post_id %d.', $post_id )
				: 'Global interactions retrieved successfully.';
		}

		$result = [
			'scope'        => $scope,
			'count'        => count( $interactions ),
			'interactions' => array_values( $interactions ),
			'message'      => $message,
		];

		if ( 'page' === $scope ) {
			$result['post_id'] = $post_id;
		}

		return $result;
	}

	/**
	 * @return array<int, array>
	 */
	private static function read_interactions( string $scope, int $post_id ): array {
		if ( 'page' === $scope ) {
			$meta = get_post_meta( $post_id, 'blockish_page_interactions', true );
			if ( is_string( $meta ) ) {
				$decoded = json_decode( $meta, true );
				$meta    = is_array( $decoded ) ? $decoded : [];
			}
			return is_array( $meta ) ? $meta : [];
		}

		$interactions = get_option( 'blockish_global_interactions', [] );
		if ( is_string( $interactions ) ) {
			$decoded      = json_decode( $interactions, true );
			$interactions = is_array( $decoded ) ? $decoded : [];
		}
		return is_array( $interactions ) ? $interactions : [];
	}

	/**
	 * @param mixed $input Raw input.
	 * @return array
	 */
	private static function normalize_input( $input ): array {
		if ( is_array( $input ) ) {
			return $input;
		}
		if ( is_object( $input ) ) {
			return (array) $input;
		}
		return [];
	}

	/**
	 * Light sanitize (mirror DashboardToolsV1::sanitize_interaction_item).
	 *
	 * @param array $item Interaction item.
	 * @return array
	 */
	private static function sanitize_interaction_item( array $item ): array {
		$out = [];

		if ( isset( $item['id'] ) ) {
			$out['id'] = sanitize_text_field( (string) $item['id'] );
		}
		if ( isset( $item['title'] ) ) {
			$out['title'] = sanitize_text_field( (string) $item['title'] );
		}
		if ( isset( $item['scope'] ) ) {
			$out['scope'] = sanitize_key( (string) $item['scope'] );
		}
		if ( isset( $item['event'] ) ) {
			$out['event'] = sanitize_text_field( (string) $item['event'] );
		}
		if ( isset( $item['selector'] ) ) {
			$out['selector'] = sanitize_text_field( (string) $item['selector'] );
		}
		if ( isset( $item['actionType'] ) ) {
			$out['actionType'] = self::sanitize_action_type( (string) $item['actionType'] );
		}
		if ( isset( $item['preset'] ) ) {
			$out['preset'] = self::sanitize_preset_id( (string) $item['preset'] );
		}
		if ( isset( $item['listenEventName'] ) ) {
			$out['listenEventName'] = sanitize_text_field( (string) $item['listenEventName'] );
		}
		if ( isset( $item['listenPhase'] ) ) {
			$out['listenPhase'] = sanitize_key( (string) $item['listenPhase'] );
		}
		if ( isset( $item['emitEventName'] ) ) {
			$out['emitEventName'] = sanitize_text_field( (string) $item['emitEventName'] );
		}
		if ( isset( $item['emitPhase'] ) ) {
			$out['emitPhase'] = sanitize_key( (string) $item['emitPhase'] );
		}
		if ( isset( $item['presetOptions'] ) && is_array( $item['presetOptions'] ) ) {
			$preset = isset( $item['preset'] ) ? self::sanitize_preset_id( (string) $item['preset'] ) : 'fadeUp';
			$out['presetOptions'] = self::sanitize_preset_options( $item['presetOptions'], $preset );
		}
		if ( isset( $item['className'] ) ) {
			$out['className'] = self::sanitize_class_name( (string) $item['className'] );
		}
		if ( isset( $item['callbacks'] ) && is_array( $item['callbacks'] ) ) {
			$out['callbacks'] = array_values(
				array_filter(
					array_map(
						static function ( $cb ) {
							return is_string( $cb ) ? $cb : '';
						},
						$item['callbacks']
					)
				)
			);
		}
		if ( isset( $item['when'] ) && is_array( $item['when'] ) ) {
			$out['when'] = [
				'source'    => isset( $item['when']['source'] ) ? sanitize_key( (string) $item['when']['source'] ) : 'dom',
				'event'     => isset( $item['when']['event'] ) ? sanitize_text_field( (string) $item['when']['event'] ) : 'ready',
				'selector'  => isset( $item['when']['selector'] ) ? sanitize_text_field( (string) $item['when']['selector'] ) : '',
				'eventName' => isset( $item['when']['eventName'] ) ? sanitize_text_field( (string) $item['when']['eventName'] ) : '',
				'phase'     => isset( $item['when']['phase'] ) ? sanitize_key( (string) $item['when']['phase'] ) : 'start',
				'scrollY'   => isset( $item['when']['scrollY'] ) ? absint( $item['when']['scrollY'] ) : 80,
				'parallax'  => isset( $item['when']['parallax'] ) ? absint( $item['when']['parallax'] ) : 0,
			];
		}
		if ( isset( $item['action'] ) && is_array( $item['action'] ) ) {
			$action      = $item['action'];
			$preset      = isset( $action['preset'] ) ? self::sanitize_preset_id( (string) $action['preset'] ) : 'fadeUp';
			$out['action'] = [
				'type'          => isset( $action['type'] ) ? self::sanitize_action_type( (string) $action['type'] ) : 'custom',
				'preset'        => $preset,
				'eventName'     => isset( $action['eventName'] ) ? sanitize_text_field( (string) $action['eventName'] ) : '',
				'phase'         => isset( $action['phase'] ) ? sanitize_key( (string) $action['phase'] ) : 'start',
				'className'     => isset( $action['className'] ) ? self::sanitize_class_name( (string) $action['className'] ) : '',
				'applyTo'       => isset( $action['applyTo'] ) ? sanitize_text_field( (string) $action['applyTo'] ) : '',
				'presetOptions' => self::sanitize_preset_options(
					isset( $action['presetOptions'] ) && is_array( $action['presetOptions'] ) ? $action['presetOptions'] : [],
					$preset
				),
				'callbacks'     => isset( $action['callbacks'] ) && is_array( $action['callbacks'] )
					? array_values(
						array_filter(
							array_map(
								static function ( $cb ) {
									return is_string( $cb ) ? $cb : '';
								},
								$action['callbacks']
							)
						)
					)
					: [],
			];
			$motion = self::sanitize_motion( $action['motion'] ?? null );
			if ( $motion ) {
				$out['action']['motion'] = $motion;
			}
		}

		return $out;
	}

	/**
	 * Motion numbers stay signed. Preset id seeds fill missing keys so fadeUp
	 * does not collapse to 0,0 when an older payload is saved.
	 *
	 * @param array  $opts   Raw presetOptions.
	 * @param string $preset Preset id.
	 * @return array
	 */
	private static function sanitize_preset_options( $opts, $preset = 'fadeUp' ) {
		$opts  = is_array( $opts ) ? $opts : [];
		$seeds = [
			'fadeIn'    => [ 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'fadeUp'    => [ 'fromY' => 40, 'toY' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'fadeDown'  => [ 'fromY' => -40, 'toY' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'fadeLeft'  => [ 'fromX' => 40, 'toX' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'fadeRight' => [ 'fromX' => -40, 'toX' => 0, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'zoomIn'    => [ 'fromScale' => 85, 'toScale' => 100, 'fromOpacity' => 0, 'toOpacity' => 100, 'easing' => 'ease' ],
			'custom'    => [ 'easing' => 'ease' ],
		];
		$seed = $seeds[ $preset ] ?? $seeds['fadeUp'];
		$clamp = static function ( $value, $min, $max ) {
			return max( $min, min( $max, intval( $value ) ) );
		};
		$easing = isset( $opts['easing'] ) ? sanitize_text_field( (string) $opts['easing'] ) : ( $seed['easing'] ?? 'ease' );
		$allowed_easing = [
			'ease',
			'ease-in',
			'ease-out',
			'ease-in-out',
			'linear',
			'cubic-bezier(0.22, 1, 0.36, 1)',
			'power1.inOut',
			'power2.in',
			'power2.out',
			'power2.inOut',
			'none',
			'expo.out',
		];
		if ( ! in_array( $easing, $allowed_easing, true ) ) {
			$easing = 'ease';
		}
		$out = [
			'duration' => self::sanitize_time_seconds( $opts['duration'] ?? null, 0.6 ),
			'delay'    => self::sanitize_time_seconds( $opts['delay'] ?? null, 0 ),
			'once'     => array_key_exists( 'once', $opts ) ? ! empty( $opts['once'] ) : true,
			'stagger'  => self::sanitize_time_seconds( $opts['stagger'] ?? null, 0 ),
			'easing'   => $easing,
		];
		$motion_keys = [
			'fromX'       => [ -400, 400 ],
			'fromY'       => [ -400, 400 ],
			'fromScale'   => [ 0, 200 ],
			'fromRotate'  => [ -180, 180 ],
			'fromOpacity' => [ 0, 100 ],
			'toX'         => [ -400, 400 ],
			'toY'         => [ -400, 400 ],
			'toScale'     => [ 0, 200 ],
			'toRotate'    => [ -180, 180 ],
			'toOpacity'   => [ 0, 100 ],
		];
		foreach ( $motion_keys as $key => $range ) {
			if ( ! array_key_exists( $key, $opts ) && ! array_key_exists( $key, $seed ) ) {
				continue;
			}
			$raw         = array_key_exists( $key, $opts ) ? $opts[ $key ] : $seed[ $key ];
			$out[ $key ] = $clamp( $raw, $range[0], $range[1] );
		}
		return $out;
	}

	/**
	 * GSAP fromTo-compatible tweens. Extra transform keys pass through if present.
	 *
	 * @param mixed $motion Raw motion object.
	 * @return array|null
	 */
	private static function sanitize_motion( $motion ) {
		if ( ! is_array( $motion ) || empty( $motion['tweens'] ) || ! is_array( $motion['tweens'] ) ) {
			return null;
		}
		$tweens = [];
		foreach ( array_slice( $motion['tweens'], 0, 12 ) as $tween ) {
			if ( ! is_array( $tween ) ) {
				continue;
			}
			$clean = [
				'from'     => self::sanitize_gsap_vars( $tween['from'] ?? [] ),
				'to'       => self::sanitize_gsap_vars( $tween['to'] ?? [] ),
				'duration' => self::clamp_float( $tween['duration'] ?? 0.6, 0, 30 ),
				'delay'    => self::clamp_float( $tween['delay'] ?? 0, 0, 30 ),
				'ease'     => self::sanitize_ease( $tween['ease'] ?? 'power1.inOut' ),
			];
			if ( array_key_exists( 'position', $tween ) ) {
				if ( is_numeric( $tween['position'] ) ) {
					$clean['position'] = self::clamp_float( $tween['position'], 0, 60 );
				} else {
					$clean['position'] = sanitize_text_field( (string) $tween['position'] );
				}
			}
			$tweens[] = $clean;
		}
		if ( ! $tweens ) {
			return null;
		}
		$out = [ 'tweens' => $tweens ];
		if ( ! empty( $motion['pin'] ) ) {
			$out['pin'] = true;
		}
		$pin_end = self::sanitize_pin_end( $motion['pinEnd'] ?? '' );
		if ( $pin_end !== '' ) {
			$out['pinEnd'] = $pin_end;
		}
		$pin_start = self::sanitize_pin_start( $motion['pinStart'] ?? '' );
		if ( $pin_start !== '' ) {
			$out['pinStart'] = $pin_start;
		}
		if ( array_key_exists( 'scrub', $motion ) ) {
			if ( true === $motion['scrub'] || 'true' === $motion['scrub'] || 'locked' === $motion['scrub'] ) {
				$out['scrub'] = true;
			} else {
				$out['scrub'] = self::clamp_float( $motion['scrub'], 0, 3 );
			}
		}
		if ( isset( $motion['transformOrigin'] ) ) {
			$origin = self::sanitize_transform_origin( $motion['transformOrigin'] );
			if ( $origin !== '' ) {
				$out['transformOrigin'] = $origin;
			}
		}
		return $out;
	}

	/**
	 * Pin start: auto (below header), 0 (viewport top), or pixel offset.
	 */
	private static function sanitize_pin_start( $raw ): string {
		$s = strtolower( trim( (string) $raw ) );
		if ( $s === '' || $s === 'auto' ) {
			return 'auto';
		}
		if ( $s === '0' || $s === 'top' ) {
			return '0';
		}
		if ( is_numeric( $s ) ) {
			$n = (int) round( (float) $s );
			return (string) max( 0, min( 400, $n ) );
		}
		return '';
	}

	private static function sanitize_transform_origin( $raw ): string {
		$s = sanitize_text_field( (string) $raw );
		if ( $s === '' || strlen( $s ) > 40 ) {
			return '';
		}
		return preg_match( '/^[0-9.%\sleftcenterrighttopbottom-]+$/i', $s ) ? $s : '';
	}

	/**
	 * ScrollTrigger end string (pin distance), e.g. +=120% or +=800.
	 */
	private static function sanitize_pin_end( $raw ): string {
		$s = trim( (string) $raw );
		if ( $s === '' || strlen( $s ) > 32 ) {
			return '';
		}
		return preg_match( '/^[+\-=%\s0-9.a-zA-Z]+$/', $s ) ? $s : '';
	}

	/**
	 * @param mixed $vars Raw GSAP vars.
	 * @return array
	 */
	private static function sanitize_gsap_vars( $vars ) {
		if ( ! is_array( $vars ) ) {
			return [];
		}
		$out    = [];
		$ranges = [
			'x'          => [ -2000, 2000 ],
			'y'          => [ -2000, 2000 ],
			'z'          => [ -2000, 2000 ],
			'scale'      => [ 0, 10 ],
			'scaleX'     => [ 0, 10 ],
			'scaleY'     => [ 0, 10 ],
			'rotation'   => [ -720, 720 ],
			'rotationX'  => [ -720, 720 ],
			'rotationY'  => [ -720, 720 ],
			'rotationZ'  => [ -720, 720 ],
			'skewX'      => [ -180, 180 ],
			'skewY'      => [ -180, 180 ],
			'xPercent'   => [ -200, 200 ],
			'yPercent'   => [ -200, 200 ],
			'opacity'    => [ 0, 1 ],
			'autoAlpha'  => [ 0, 1 ],
		];
		foreach ( $ranges as $key => $range ) {
			if ( ! array_key_exists( $key, $vars ) ) {
				continue;
			}
			$out[ $key ] = self::clamp_float( $vars[ $key ], $range[0], $range[1] );
		}
		if ( isset( $vars['transformOrigin'] ) ) {
			$out['transformOrigin'] = sanitize_text_field( (string) $vars['transformOrigin'] );
		}
		return $out;
	}

	private static function sanitize_time_seconds( $value, float $fallback ): float {
		if ( $value === null || $value === '' ) {
			return $fallback;
		}
		$n = is_numeric( $value ) ? (float) $value : $fallback;
		if ( $n > 30 ) {
			$n = $n / 1000;
		}
		return self::clamp_float( $n, 0, 30 );
	}

	private static function clamp_float( $value, $min, $max ): float {
		$n = is_numeric( $value ) ? (float) $value : 0.0;
		return max( $min, min( $max, $n ) );
	}

	private static function sanitize_ease( string $ease ): string {
		$ease = sanitize_text_field( $ease );
		if ( strlen( $ease ) <= 80 && preg_match( '/^[a-z0-9._, +\-()]+$/i', $ease ) ) {
			return $ease;
		}
		return 'power1.inOut';
	}

	private static function sanitize_preset_id( string $preset ): string {
		$preset = sanitize_text_field( $preset );
		$allowed = [ 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'zoomIn', 'custom' ];
		return in_array( $preset, $allowed, true ) ? $preset : 'fadeUp';
	}

	private static function sanitize_action_type( string $type ): string {
		$allowed = [ 'preset', 'emit', 'custom', 'toggleClass', 'show', 'hide', 'toggle' ];
		return in_array( $type, $allowed, true ) ? $type : 'custom';
	}

	private static function sanitize_class_name( string $class ): string {
		$class = ltrim( sanitize_text_field( $class ), '.' );
		return sanitize_html_class( $class );
	}
}
