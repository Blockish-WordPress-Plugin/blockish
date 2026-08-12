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
				throw new \Exception( 'post_id ' . $post_id . ' not found.' );
			}
			if ( ! current_user_can( 'edit_post', $post_id ) ) {
				throw new \Exception( 'You cannot edit post_id ' . $post_id . '.' );
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
			$out['actionType'] = sanitize_key( (string) $item['actionType'] );
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
			$out['presetOptions'] = [
				'duration' => isset( $item['presetOptions']['duration'] ) ? absint( $item['presetOptions']['duration'] ) : 600,
				'delay'    => isset( $item['presetOptions']['delay'] ) ? absint( $item['presetOptions']['delay'] ) : 0,
				'once'     => ! empty( $item['presetOptions']['once'] ),
			];
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
			];
		}
		if ( isset( $item['action'] ) && is_array( $item['action'] ) ) {
			$action      = $item['action'];
			$out['action'] = [
				'type'          => isset( $action['type'] ) ? sanitize_key( (string) $action['type'] ) : 'custom',
				'preset'        => isset( $action['preset'] ) ? self::sanitize_preset_id( (string) $action['preset'] ) : 'fadeUp',
				'eventName'     => isset( $action['eventName'] ) ? sanitize_text_field( (string) $action['eventName'] ) : '',
				'phase'         => isset( $action['phase'] ) ? sanitize_key( (string) $action['phase'] ) : 'start',
				'presetOptions' => isset( $action['presetOptions'] ) && is_array( $action['presetOptions'] )
					? [
						'duration' => isset( $action['presetOptions']['duration'] ) ? absint( $action['presetOptions']['duration'] ) : 600,
						'delay'    => isset( $action['presetOptions']['delay'] ) ? absint( $action['presetOptions']['delay'] ) : 0,
						'once'     => ! empty( $action['presetOptions']['once'] ),
					]
					: [
						'duration' => 600,
						'delay'    => 0,
						'once'     => true,
					],
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
		}

		return $out;
	}

	/**
	 * Preset ids are camelCase CSS suffixes (fadeUp). Never sanitize_key — it lowercases.
	 */
	private static function sanitize_preset_id( string $preset ): string {
		$preset = sanitize_text_field( $preset );
		$allowed = [ 'fadeIn', 'fadeUp', 'fadeDown', 'fadeLeft', 'fadeRight', 'zoomIn' ];
		return in_array( $preset, $allowed, true ) ? $preset : 'fadeUp';
	}
}
