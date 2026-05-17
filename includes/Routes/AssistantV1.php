<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

class AssistantV1 extends WP_REST_Controller {

	use \Blockish\Traits\SingletonTrait;

	private function __construct() {
		$this->namespace = 'blockish/v1';
		$this->rest_base = 'assistant';

		add_action( 'rest_api_init', array( $this, 'register_routes' ) );
	}

	public function register_routes() {
		register_rest_route(
			$this->namespace,
			'/' . $this->rest_base,
			array(
				array(
					'methods'             => WP_REST_Server::CREATABLE,
					'callback'            => array( $this, 'chat' ),
					'permission_callback' => array( $this, 'permissions_check' ),
				),
			)
		);
	}

	public function permissions_check() {
		return current_user_can( 'manage_options' );
	}

	public function chat( WP_REST_Request $request ) {
		$payload = $request->get_json_params();
		if ( ! is_array( $payload ) ) {
			$payload = array();
		}

		if ( $this->should_stream_response( $request ) ) {
			$this->stream_chat( $payload );
			exit;
		}

		$response = wp_remote_post(
			trailingslashit( BLOCKISH_AI_ASSISTANT_URL ) . 'assistant',
			array(
				'headers' => array(
					'Content-Type' => 'application/json',
				),
				'body'    => wp_json_encode( $payload ),
				'timeout' => 20,
			)
		);

		if ( is_wp_error( $response ) ) {
			return $response;
		}

		return rest_ensure_response(
			array(
				'status'      => 'success',
				'status_code' => (int) wp_remote_retrieve_response_code( $response ),
				'response'    => wp_remote_retrieve_body( $response ),
			)
		);
	}

	private function should_stream_response( WP_REST_Request $request ) {
		return false !== stripos( $request->get_header( 'accept' ), 'text/event-stream' );
	}

	private function stream_chat( array $payload ) {
		if ( ! function_exists( 'curl_init' ) ) {
			$this->send_stream_error( 'Streaming requires the PHP cURL extension.' );
			return;
		}

		$this->prepare_stream_headers();

		$curl = curl_init( trailingslashit( BLOCKISH_AI_ASSISTANT_URL ) . 'assistant' );

		curl_setopt_array(
			$curl,
			array(
				CURLOPT_POST           => true,
				CURLOPT_HTTPHEADER     => array(
					'Accept: text/event-stream',
					'Content-Type: application/json',
				),
				CURLOPT_POSTFIELDS     => wp_json_encode( $payload ),
				CURLOPT_RETURNTRANSFER => false,
				CURLOPT_TIMEOUT        => 0,
				CURLOPT_CONNECTTIMEOUT => 10,
				CURLOPT_WRITEFUNCTION  => function ( $curl, $chunk ) {
					if ( connection_aborted() ) {
						return 0;
					}

					echo $chunk;
					$this->flush_stream();
					return strlen( $chunk );
				},
			)
		);

		$result = curl_exec( $curl );

		if ( false === $result && ! connection_aborted() ) {
			$this->send_stream_error( curl_error( $curl ) );
		}

		curl_close( $curl );
		$this->flush_stream();
	}

	private function prepare_stream_headers() {
		if ( function_exists( 'apache_setenv' ) ) {
			apache_setenv( 'no-gzip', '1' );
		}

		@ini_set( 'zlib.output_compression', '0' );
		@set_time_limit( 0 );

		header( 'Content-Type: text/event-stream; charset=utf-8' );
		header( 'Cache-Control: no-cache, no-transform' );
		header( 'Connection: keep-alive' );
		header( 'X-Accel-Buffering: no' );

		while ( ob_get_level() > 0 ) {
			ob_end_flush();
		}

		$this->flush_stream();
	}

	private function send_stream_error( $message ) {
		echo 'event: error' . "\n";
		echo 'data: ' . wp_json_encode(
			array(
				'error' => $message,
			)
		) . "\n\n";
		$this->flush_stream();
	}

	private function flush_stream() {
		if ( ob_get_level() > 0 ) {
			ob_flush();
		}

		flush();
	}
}
