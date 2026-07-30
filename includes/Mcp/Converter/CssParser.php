<?php

namespace Blockish\Mcp\Converter;

defined( 'ABSPATH' ) || exit;

/**
 * Minimal CSS parser for the CSS ⇄ attribute converter.
 *
 * Understands flat rules and @media (max-width: …) blocks. Nested @media /
 * @supports / @keyframes are left untouched and returned as raw leftovers.
 */
class CssParser {

	/**
	 * @return array{rules: array<int, array{selector: string, declarations: array<string, string>, device: string}>, raw_leftovers: string[]}
	 */
	public static function parse( string $css ): array {
		$css = self::strip_comments( $css );
		$rules = array();
		$raw_leftovers = array();

		$length = strlen( $css );
		$offset = 0;

		while ( $offset < $length ) {
			while ( $offset < $length && ctype_space( $css[ $offset ] ) ) {
				++$offset;
			}
			if ( $offset >= $length ) {
				break;
			}

			if ( '@' === $css[ $offset ] ) {
				$chunk = self::read_at_rule( $css, $offset );
				if ( null === $chunk ) {
					break;
				}

				$media_device = self::media_device( $chunk['prelude'] );
				if ( null !== $media_device && '' !== trim( $chunk['body'] ) ) {
					$nested = self::parse_rule_list( $chunk['body'], $media_device );
					$rules  = array_merge( $rules, $nested['rules'] );
					$raw_leftovers = array_merge( $raw_leftovers, $nested['raw_leftovers'] );
				} else {
					$raw_leftovers[] = trim( $chunk['raw'] );
				}
				continue;
			}

			$rule = self::read_style_rule( $css, $offset );
			if ( null === $rule ) {
				$raw_leftovers[] = trim( substr( $css, $offset ) );
				break;
			}

			foreach ( self::split_selectors( $rule['selector'] ) as $selector ) {
				$rules[] = array(
					'selector'     => $selector,
					'declarations' => $rule['declarations'],
					'device'       => 'Desktop',
				);
			}
		}

		return array(
			'rules'         => $rules,
			'raw_leftovers' => array_values( array_filter( $raw_leftovers ) ),
		);
	}

	private static function strip_comments( string $css ): string {
		return (string) preg_replace( '/\/\*.*?\*\//s', '', $css );
	}

	private static function media_device( string $prelude ): ?string {
		if ( ! preg_match( '/@media\b/i', $prelude ) ) {
			return null;
		}

		if ( preg_match( '/max-width\s*:\s*(\d+(?:\.\d+)?)px/i', $prelude, $match ) ) {
			$px = (float) $match[1];
			if ( $px <= 768 ) {
				return 'Mobile';
			}
			if ( $px <= 1024 ) {
				return 'Tablet';
			}
		}

		// Unknown media → treat as leftover by returning null.
		return null;
	}

	/**
	 * @return array{rules: array, raw_leftovers: string[]}
	 */
	private static function parse_rule_list( string $css, string $device ): array {
		$rules = array();
		$raw_leftovers = array();
		$length = strlen( $css );
		$offset = 0;

		while ( $offset < $length ) {
			while ( $offset < $length && ctype_space( $css[ $offset ] ) ) {
				++$offset;
			}
			if ( $offset >= $length ) {
				break;
			}

			if ( '@' === $css[ $offset ] ) {
				$chunk = self::read_at_rule( $css, $offset );
				if ( null === $chunk ) {
					break;
				}
				$raw_leftovers[] = trim( $chunk['raw'] );
				continue;
			}

			$rule = self::read_style_rule( $css, $offset );
			if ( null === $rule ) {
				$raw_leftovers[] = trim( substr( $css, $offset ) );
				break;
			}

			foreach ( self::split_selectors( $rule['selector'] ) as $selector ) {
				$rules[] = array(
					'selector'     => $selector,
					'declarations' => $rule['declarations'],
					'device'       => $device,
				);
			}
		}

		return array(
			'rules'         => $rules,
			'raw_leftovers' => $raw_leftovers,
		);
	}

	/**
	 * @return array{prelude: string, body: string, raw: string}|null
	 */
	private static function read_at_rule( string $css, int &$offset ): ?array {
		$start = $offset;
		$length = strlen( $css );
		$brace = strpos( $css, '{', $offset );
		if ( false === $brace ) {
			return null;
		}

		$prelude = substr( $css, $offset, $brace - $offset );
		$body_start = $brace + 1;
		$depth = 1;
		$i = $body_start;

		while ( $i < $length && $depth > 0 ) {
			$char = $css[ $i ];
			if ( '{' === $char ) {
				++$depth;
			} elseif ( '}' === $char ) {
				--$depth;
			}
			++$i;
		}

		$body = substr( $css, $body_start, $i - $body_start - 1 );
		$raw  = substr( $css, $start, $i - $start );
		$offset = $i;

		return array(
			'prelude' => trim( $prelude ),
			'body'    => $body,
			'raw'     => $raw,
		);
	}

	/**
	 * @return array{selector: string, declarations: array<string, string>}|null
	 */
	private static function read_style_rule( string $css, int &$offset ): ?array {
		$brace = strpos( $css, '{', $offset );
		if ( false === $brace ) {
			return null;
		}

		$selector = trim( substr( $css, $offset, $brace - $offset ) );
		$close = strpos( $css, '}', $brace );
		if ( false === $close ) {
			return null;
		}

		$body = substr( $css, $brace + 1, $close - $brace - 1 );
		$offset = $close + 1;

		return array(
			'selector'     => $selector,
			'declarations' => self::parse_declarations( $body ),
		);
	}

	/**
	 * @return array<string, string>
	 */
	private static function parse_declarations( string $body ): array {
		$declarations = array();
		$parts = explode( ';', $body );

		foreach ( $parts as $part ) {
			$part = trim( $part );
			if ( '' === $part || ! str_contains( $part, ':' ) ) {
				continue;
			}

			list( $property, $value ) = array_map( 'trim', explode( ':', $part, 2 ) );
			$property = strtolower( $property );
			if ( '' === $property || '' === $value ) {
				continue;
			}

			$declarations[ $property ] = $value;
		}

		return $declarations;
	}

	/**
	 * @return string[]
	 */
	private static function split_selectors( string $selector ): array {
		$parts = array_map( 'trim', explode( ',', $selector ) );
		return array_values( array_filter( $parts ) );
	}
}
