<?php
namespace Blockish\Core;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Global third-party integration credentials (site-level).
 *
 * Forms / future marketing addons consume these connections.
 */
class Integrations {

	const OPTION_KEY = 'blockish_integrations';

	/**
	 * Catalog definition used by the dashboard UI + REST.
	 *
	 * @return array<int, array<string, mixed>>
	 */
	public static function get_catalog() {
		return array(
			array(
				'key'         => 'mailchimp',
				'name'        => 'Mailchimp',
				'icon'        => '📧',
				'initials'    => 'MC',
				'color'       => '#FFE01B',
				'category'    => 'marketing',
				'description' => __( 'Upsert contacts into a Mailchimp audience (Marketing API 3.0).', 'blockish' ),
				'docs_url'    => 'https://mailchimp.com/developer/marketing/api/list-members/',
				'settings_url'=> 'https://admin.mailchimp.com/account/api/',
				'fields'      => array(
					array(
						'key'         => 'api_key',
						'label'       => __( 'API key', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'placeholder' => 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx-us12',
						'help'        => __( 'Mailchimp → Profile → Extras → API keys. Key must end with your DC (e.g. -us12).', 'blockish' ),
					),
					array(
						'key'         => 'audience_id',
						'label'       => __( 'Audience ID', 'blockish' ),
						'type'        => 'text',
						'required'    => true,
						'placeholder' => 'a1b2c3d4e5',
						'help'        => __( 'Audience → Settings → Audience name and defaults → Audience ID.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'convertkit',
				'name'        => 'Kit (ConvertKit)',
				'icon'        => '✉️',
				'initials'    => 'CK',
				'color'       => '#FB6970',
				'category'    => 'marketing',
				'description' => __( 'Subscribe contacts via Kit v3 form subscribe (api.convertkit.com).', 'blockish' ),
				'docs_url'    => 'https://developers.kit.com/api-reference/v3/forms',
				'settings_url'=> 'https://app.kit.com/account_settings/developer_settings',
				'fields'      => array(
					array(
						'key'         => 'api_key',
						'label'       => __( 'API key (public)', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'help'        => __( 'Kit → Developer settings (link below). Use the V3 API key for form subscribe. Form ID still required.', 'blockish' ),
					),
					array(
						'key'         => 'api_secret',
						'label'       => __( 'API secret (optional)', 'blockish' ),
						'type'        => 'password',
						'required'    => false,
						'help'        => __( 'V3 secret from the same Developer settings page (optional).', 'blockish' ),
					),
					array(
						'key'         => 'form_id',
						'label'       => __( 'Form ID', 'blockish' ),
						'type'        => 'text',
						'required'    => true,
						'help'        => __( 'Audience growth → Landing pages & Forms → open a form → number in the URL.', 'blockish' ),
						'placeholder' => '123456',
					),
				),
			),
			array(
				'key'         => 'hubspot',
				'name'        => 'HubSpot',
				'icon'        => '🎯',
				'initials'    => 'HS',
				'color'       => '#FF7A59',
				'category'    => 'crm',
				'description' => __( 'Create/update CRM contacts (Bearer token).', 'blockish' ),
				'docs_url'    => 'https://developers.hubspot.com/docs/apps/developer-platform/build-apps/authentication/account-service-keys',
				'settings_url'=> 'https://app.hubspot.com/l/service-keys',
				'fields'      => array(
					array(
						'key'         => 'access_token',
						'label'       => __( 'Access token / Service key', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'help'        => __( 'Service Key: Development → Keys → Service Keys → Create → add scopes crm.objects.contacts.read AND crm.objects.contacts.write (both required). Or Legacy private app → Private → Auth → Scopes → same two. Copy the Bearer token. Do not use Personal Access Key / Developer API Key.', 'blockish' ),
						'placeholder' => 'pat-na1-… or service key',
					),
				),
			),
			array(
				'key'         => 'stripe',
				'name'        => 'Stripe',
				'icon'        => '💳',
				'initials'    => 'ST',
				'color'       => '#635BFF',
				'category'    => 'payments',
				'description' => __( 'Accept payments on forms (native Stripe — no WooCommerce required).', 'blockish' ),
				'docs_url'    => 'https://docs.stripe.com/keys',
				'settings_url'=> 'https://dashboard.stripe.com/apikeys',
				'fields'      => array(
					array(
						'key'         => 'mode',
						'label'       => __( 'Mode', 'blockish' ),
						'type'        => 'select',
						'required'    => true,
						'options'     => array(
							array(
								'label' => __( 'Test', 'blockish' ),
								'value' => 'test',
							),
							array(
								'label' => __( 'Live', 'blockish' ),
								'value' => 'live',
							),
						),
						'default'     => 'test',
					),
					array(
						'key'      => 'publishable_key',
						'label'    => __( 'Publishable key', 'blockish' ),
						'type'     => 'text',
						'required' => true,
						'placeholder' => 'pk_test_…',
					),
					array(
						'key'      => 'secret_key',
						'label'    => __( 'Secret key', 'blockish' ),
						'type'     => 'password',
						'required' => true,
						'placeholder' => 'sk_test_…',
						'help'     => __( 'Never share this key. Stored only on your server.', 'blockish' ),
					),
					array(
						'key'      => 'webhook_secret',
						'label'    => __( 'Webhook signing secret', 'blockish' ),
						'type'     => 'password',
						'required' => false,
						'placeholder' => 'whsec_…',
					),
				),
			),
			array(
				'key'         => 'slack',
				'name'        => 'Slack',
				'icon'        => '💬',
				'initials'    => 'SL',
				'color'       => '#4A154B',
				'category'    => 'communication',
				'description' => __( 'Post form submission alerts to a Slack channel.', 'blockish' ),
				'docs_url'    => 'https://api.slack.com/messaging/webhooks',
				'settings_url'=> 'https://api.slack.com/apps',
				'fields'      => array(
					array(
						'key'         => 'webhook_url',
						'label'       => __( 'Incoming webhook URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://hooks.slack.com/services/…',
						'help'        => __( 'Slack app → Incoming Webhooks → Add to channel → copy Webhook URL.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'zapier',
				'name'        => 'Zapier',
				'icon'        => '⚡',
				'initials'    => 'ZA',
				'color'       => '#FF4A00',
				'category'    => 'automation',
				'description' => __( 'POST JSON to a Zapier Catch Hook.', 'blockish' ),
				'docs_url'    => 'https://help.zapier.com/hc/en-us/articles/8496288691469-Get-started-with-Webhooks-by-Zapier',
				'settings_url'=> 'https://zapier.com/app/zaps',
				'fields'      => array(
					array(
						'key'         => 'webhook_url',
						'label'       => __( 'Catch Hook URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://hooks.zapier.com/…',
						'help'        => __( 'Zapier → Create Zap → Webhooks by Zapier → Catch Hook → copy the custom webhook URL.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'webhooks',
				'name'        => 'Webhooks',
				'icon'        => '🔗',
				'initials'    => 'WH',
				'color'       => '#0F172A',
				'category'    => 'developer',
				'description' => __( 'POST submission JSON to your own HTTPS endpoint.', 'blockish' ),
				'docs_url'    => '',
				'settings_url'=> '',
				'fields'      => array(
					array(
						'key'         => 'endpoint_url',
						'label'       => __( 'Endpoint URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://example.com/hooks/blockish',
						'help'        => __( 'Must be public https. Optional secret sends X-Blockish-Signature: sha256=… HMAC.', 'blockish' ),
					),
					array(
						'key'      => 'secret',
						'label'    => __( 'Signing secret (optional)', 'blockish' ),
						'type'     => 'password',
						'required' => false,
						'help'     => __( 'If set, we send header X-Blockish-Signature with HMAC-SHA256 of the body.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'google-sheets',
				'name'        => 'Google Sheets',
				'icon'        => '📄',
				'initials'    => 'GS',
				'color'       => '#0F9D58',
				'category'    => 'productivity',
				'description' => __( 'Credential storage for Sheets append (OAuth / service account — coming next).', 'blockish' ),
				'docs_url'    => 'https://console.cloud.google.com/apis/credentials',
				'settings_url'=> 'https://console.cloud.google.com/apis/credentials',
				'fields'      => array(
					array(
						'key'         => 'spreadsheet_id',
						'label'       => __( 'Spreadsheet ID', 'blockish' ),
						'type'        => 'text',
						'required'    => true,
						'help'        => __( 'From the sheet URL between /d/ and /edit.', 'blockish' ),
					),
					array(
						'key'      => 'sheet_name',
						'label'    => __( 'Sheet tab name', 'blockish' ),
						'type'     => 'text',
						'required' => false,
						'default'  => 'Sheet1',
					),
					array(
						'key'      => 'api_key',
						'label'    => __( 'Service account JSON / token (storage only for now)', 'blockish' ),
						'type'     => 'password',
						'required' => true,
						'help'     => __( 'Sheets write requires a Google service account / OAuth — form push not wired yet.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'google-analytics',
				'name'        => 'Google Analytics',
				'icon'        => '📊',
				'initials'    => 'GA',
				'color'       => '#E37400',
				'category'    => 'analytics',
				'description' => __( 'Track form submits and block engagement with GA4.', 'blockish' ),
				'docs_url'    => 'https://support.google.com/analytics/answer/9539598',
				'settings_url'=> 'https://analytics.google.com/analytics/web/',
				'fields'      => array(
					array(
						'key'         => 'measurement_id',
						'label'       => __( 'Measurement ID', 'blockish' ),
						'type'        => 'text',
						'required'    => true,
						'placeholder' => 'G-XXXXXXXX',
					),
				),
			),
			array(
				'key'         => 'brevo',
				'name'        => 'Brevo',
				'icon'        => '✉️',
				'initials'    => 'BR',
				'color'       => '#0B996E',
				'category'    => 'marketing',
				'description' => __( 'Create/update contacts via Brevo Contacts API v3.', 'blockish' ),
				'docs_url'    => 'https://developers.brevo.com/docs/api-key-authentication',
				'settings_url'=> 'https://app.brevo.com/settings/keys/api',
				'fields'      => array(
					array(
						'key'         => 'api_key',
						'label'       => __( 'API key', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'help'        => __( 'Brevo → Settings → SMTP & API → API keys. Sent as api-key header.', 'blockish' ),
					),
					array(
						'key'         => 'list_id',
						'label'       => __( 'List ID (optional)', 'blockish' ),
						'type'        => 'text',
						'required'    => false,
						'placeholder' => '2',
						'help'        => __( 'Contacts → Lists → open list → ID in URL/settings. Sent as listIds[].', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'activecampaign',
				'name'        => 'ActiveCampaign',
				'icon'        => '📈',
				'initials'    => 'AC',
				'color'       => '#356AE6',
				'category'    => 'marketing',
				'description' => __( 'Upsert contacts via ActiveCampaign API v3 (/contact/sync).', 'blockish' ),
				'docs_url'    => 'https://help.activecampaign.com/hc/en-us/articles/207317590-Getting-started-with-the-API',
				'settings_url'=> 'https://www.activecampaign.com/login',
				'fields'      => array(
					array(
						'key'         => 'api_url',
						'label'       => __( 'API URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://youraccount.api-us1.com',
						'help'        => __( 'After login: Settings → Developer → copy API URL + Key. Direct account path is Settings → Developer (no global deep link).', 'blockish' ),
					),
					array(
						'key'         => 'api_key',
						'label'       => __( 'API key', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'help'        => __( 'Same Settings → Developer page. Sent as Api-Token header.', 'blockish' ),
					),
					array(
						'key'         => 'list_id',
						'label'       => __( 'List ID (optional)', 'blockish' ),
						'type'        => 'text',
						'required'    => false,
						'help'        => __( 'If set, contact is subscribed via POST /api/3/contactLists (status 1).', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'paypal',
				'name'        => 'PayPal',
				'icon'        => '🅿️',
				'initials'    => 'PP',
				'color'       => '#003087',
				'category'    => 'payments',
				'description' => __( 'Accept form payments with PayPal (native — no WooCommerce required).', 'blockish' ),
				'docs_url'    => 'https://developer.paypal.com/api/rest/',
				'settings_url'=> 'https://developer.paypal.com/dashboard/applications/sandbox',
				'fields'      => array(
					array(
						'key'      => 'mode',
						'label'    => __( 'Mode', 'blockish' ),
						'type'     => 'select',
						'required' => true,
						'options'  => array(
							array(
								'label' => __( 'Sandbox', 'blockish' ),
								'value' => 'sandbox',
							),
							array(
								'label' => __( 'Live', 'blockish' ),
								'value' => 'live',
							),
						),
						'default'  => 'sandbox',
					),
					array(
						'key'         => 'client_id',
						'label'       => __( 'Client ID', 'blockish' ),
						'type'        => 'text',
						'required'    => true,
					),
					array(
						'key'      => 'client_secret',
						'label'    => __( 'Client secret', 'blockish' ),
						'type'     => 'password',
						'required' => true,
					),
				),
			),
			array(
				'key'         => 'make',
				'name'        => 'Make',
				'icon'        => '🟣',
				'initials'    => 'MK',
				'color'       => '#6D0EB2',
				'category'    => 'automation',
				'description' => __( 'POST JSON to a Make custom webhook.', 'blockish' ),
				'docs_url'    => 'https://www.make.com/en/help/tools/webhooks',
				'settings_url'=> 'https://www.make.com/en/login',
				'fields'      => array(
					array(
						'key'         => 'webhook_url',
						'label'       => __( 'Webhook URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://hook.make.com/…',
						'help'        => __( 'Make scenario → add Webhooks → Custom webhook → copy the address shown.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'discord',
				'name'        => 'Discord',
				'icon'        => '🎮',
				'initials'    => 'DC',
				'color'       => '#5865F2',
				'category'    => 'communication',
				'description' => __( 'Post form submission alerts to a Discord channel via webhook.', 'blockish' ),
				'docs_url'    => 'https://support.discord.com/hc/en-us/articles/228383668-Intro-to-Webhooks',
				'settings_url'=> 'https://discord.com/developers/applications',
				'fields'      => array(
					array(
						'key'         => 'webhook_url',
						'label'       => __( 'Discord webhook URL', 'blockish' ),
						'type'        => 'url',
						'required'    => true,
						'placeholder' => 'https://discord.com/api/webhooks/…',
						'help'        => __( 'Channel settings → Integrations → Webhooks → New Webhook → Copy Webhook URL.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'zoho',
				'name'        => 'Zoho CRM',
				'icon'        => '🟧',
				'initials'    => 'ZO',
				'color'       => '#E42527',
				'category'    => 'crm',
				'description' => __( 'OAuth credential storage for Zoho CRM (form push coming next).', 'blockish' ),
				'docs_url'    => 'https://www.zoho.com/crm/developer/docs/api/v2/oauth-overview.html',
				'settings_url'=> 'https://api-console.zoho.com/',
				'fields'      => array(
					array(
						'key'      => 'data_center',
						'label'    => __( 'Data center', 'blockish' ),
						'type'     => 'select',
						'required' => true,
						'options'  => array(
							array(
								'label' => 'US (.com)',
								'value' => 'com',
							),
							array(
								'label' => 'EU (.eu)',
								'value' => 'eu',
							),
							array(
								'label' => 'IN (.in)',
								'value' => 'in',
							),
							array(
								'label' => 'AU (.com.au)',
								'value' => 'com.au',
							),
						),
						'default'  => 'com',
						'help'     => __( 'Must match your Zoho CRM data center.', 'blockish' ),
					),
					array(
						'key'      => 'client_id',
						'label'    => __( 'Client ID', 'blockish' ),
						'type'     => 'text',
						'required' => true,
						'help'     => __( 'Zoho API Console → Self Client / Server-based app.', 'blockish' ),
					),
					array(
						'key'      => 'client_secret',
						'label'    => __( 'Client secret', 'blockish' ),
						'type'     => 'password',
						'required' => true,
					),
					array(
						'key'         => 'refresh_token',
						'label'       => __( 'Refresh token', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
						'help'        => __( 'Generate via Zoho OAuth; form lead push is not enabled yet.', 'blockish' ),
					),
				),
			),
			array(
				'key'         => 'salesforce',
				'name'        => 'Salesforce',
				'icon'        => '☁️',
				'initials'    => 'SF',
				'color'       => '#00A1E0',
				'category'    => 'crm',
				'description' => __( 'OAuth credential storage for Salesforce (form push coming next).', 'blockish' ),
				'docs_url'    => 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_understanding_authentication.htm',
				'settings_url'=> 'https://login.salesforce.com/',
				'fields'      => array(
					array(
						'key'      => 'environment',
						'label'    => __( 'Environment', 'blockish' ),
						'type'     => 'select',
						'required' => true,
						'options'  => array(
							array(
								'label' => __( 'Production', 'blockish' ),
								'value' => 'production',
							),
							array(
								'label' => __( 'Sandbox', 'blockish' ),
								'value' => 'sandbox',
							),
						),
						'default'  => 'production',
					),
					array(
						'key'      => 'client_id',
						'label'    => __( 'Consumer key', 'blockish' ),
						'type'     => 'text',
						'required' => true,
					),
					array(
						'key'      => 'client_secret',
						'label'    => __( 'Consumer secret', 'blockish' ),
						'type'     => 'password',
						'required' => true,
					),
					array(
						'key'         => 'refresh_token',
						'label'       => __( 'Refresh token', 'blockish' ),
						'type'        => 'password',
						'required'    => true,
					),
				),
			),
		);
	}

	/**
	 * @return array<string, array>
	 */
	public static function get_stored() {
		$stored = get_option( self::OPTION_KEY, array() );
		return is_array( $stored ) ? $stored : array();
	}

	/**
	 * @param string $key Integration key.
	 * @return array
	 */
	public static function get_connection( $key ) {
		$key     = sanitize_key( $key );
		$stored  = self::get_stored();
		$current = isset( $stored[ $key ] ) && is_array( $stored[ $key ] ) ? $stored[ $key ] : array();
		return isset( $current['config'] ) && is_array( $current['config'] ) ? $current['config'] : array();
	}

	/**
	 * Whether required fields are filled for an integration.
	 *
	 * @param string $key    Integration key.
	 * @param array  $config Config map.
	 * @return bool
	 */
	public static function is_connected( $key, $config = null ) {
		$def = self::get_definition( $key );
		if ( ! $def ) {
			return false;
		}
		if ( null === $config ) {
			$config = self::get_connection( $key );
		}
		foreach ( $def['fields'] as $field ) {
			if ( empty( $field['required'] ) ) {
				continue;
			}
			$f_key = $field['key'];
			$val   = isset( $config[ $f_key ] ) ? trim( (string) $config[ $f_key ] ) : '';
			if ( '' === $val ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * @param string $key Integration key.
	 * @return array|null
	 */
	public static function get_definition( $key ) {
		$key = sanitize_key( $key );
		foreach ( self::get_catalog() as $item ) {
			if ( $item['key'] === $key ) {
				return $item;
			}
		}
		return null;
	}

	/**
	 * Public list payload for the dashboard (secrets masked).
	 *
	 * @return array{items:array,connected_count:int}
	 */
	public static function get_public_list() {
		$items = array();
		$count = 0;

		foreach ( self::get_catalog() as $def ) {
			$row = self::format_public_item( $def );
			if ( 'connected' === $row['status'] ) {
				++$count;
			}
			$items[] = $row;
		}

		return array(
			'items'           => $items,
			'connected_count' => $count,
		);
	}

	/**
	 * @param array $def Catalog definition.
	 * @return array
	 */
	public static function format_public_item( $def ) {
		$config  = self::get_connection( $def['key'] );
		$secrets = array();
		$public  = array();

		foreach ( $def['fields'] as $field ) {
			$f_key = $field['key'];
			$raw   = isset( $config[ $f_key ] ) ? (string) $config[ $f_key ] : '';
			$is_secret = in_array( $field['type'], array( 'password' ), true );

			if ( $is_secret ) {
				$secrets[ $f_key ] = '' !== trim( $raw );
				$public[ $f_key ]  = '';
			} else {
				$public[ $f_key ] = $raw;
			}
		}

		$connected = self::is_connected( $def['key'], $config );
		$stored    = self::get_stored();
		$meta      = isset( $stored[ $def['key'] ] ) && is_array( $stored[ $def['key'] ] ) ? $stored[ $def['key'] ] : array();

		return array(
			'key'           => $def['key'],
			'name'          => $def['name'],
			'icon'          => isset( $def['icon'] ) ? $def['icon'] : '',
			'initials'      => $def['initials'],
			'color'         => $def['color'],
			'category'      => $def['category'],
			'description'   => $def['description'],
			'docs_url'      => isset( $def['docs_url'] ) ? $def['docs_url'] : '',
			'settings_url'  => isset( $def['settings_url'] ) ? $def['settings_url'] : '',
			'fields'        => $def['fields'],
			'status'        => $connected ? 'connected' : 'available',
			'config'        => $public,
			'has_secrets'   => $secrets,
			'connected_at'  => isset( $meta['connected_at'] ) ? (string) $meta['connected_at'] : '',
			'updated_at'    => isset( $meta['updated_at'] ) ? (string) $meta['updated_at'] : '',
		);
	}

	/**
	 * Save / update connection config for one integration.
	 *
	 * @param string $key    Integration key.
	 * @param array  $input  Field values.
	 * @return array|\WP_Error Public item or error.
	 */
	public static function save_connection( $key, $input ) {
		$def = self::get_definition( $key );
		if ( ! $def ) {
			return new \WP_Error( 'invalid_integration', __( 'Unknown integration.', 'blockish' ), array( 'status' => 404 ) );
		}

		$input    = is_array( $input ) ? $input : array();
		$current  = self::get_connection( $key );
		$next     = $current;
		$errors   = array();

		foreach ( $def['fields'] as $field ) {
			$f_key     = $field['key'];
			$is_secret = 'password' === $field['type'];
			$provided  = array_key_exists( $f_key, $input );

			if ( ! $provided ) {
				continue;
			}

			$raw = is_string( $input[ $f_key ] ) || is_numeric( $input[ $f_key ] )
				? trim( (string) $input[ $f_key ] )
				: '';

			// Blank password = keep existing secret.
			if ( $is_secret && '' === $raw ) {
				continue;
			}

			if ( 'url' === $field['type'] ) {
				$raw = esc_url_raw( $raw );
			} elseif ( 'select' === $field['type'] ) {
				$allowed = array();
				foreach ( $field['options'] as $opt ) {
					$allowed[] = $opt['value'];
				}
				$raw = in_array( $raw, $allowed, true ) ? $raw : ( $field['default'] ?? $allowed[0] ?? '' );
			} else {
				$raw = sanitize_text_field( $raw );
			}

			$next[ $f_key ] = $raw;
		}

		// Apply defaults for missing select/text when connecting fresh.
		foreach ( $def['fields'] as $field ) {
			$f_key = $field['key'];
			if ( ! isset( $next[ $f_key ] ) && isset( $field['default'] ) ) {
				$next[ $f_key ] = $field['default'];
			}
		}

		foreach ( $def['fields'] as $field ) {
			if ( empty( $field['required'] ) ) {
				continue;
			}
			$f_key = $field['key'];
			$val   = isset( $next[ $f_key ] ) ? trim( (string) $next[ $f_key ] ) : '';
			if ( '' === $val ) {
				$errors[ $f_key ] = sprintf(
					/* translators: %s: field label */
					__( '%s is required.', 'blockish' ),
					$field['label']
				);
			}
		}

		if ( ! empty( $errors ) ) {
			return new \WP_Error(
				'validation_failed',
				__( 'Please fix the highlighted fields.', 'blockish' ),
				array(
					'status' => 400,
					'errors' => $errors,
				)
			);
		}

		$stored = self::get_stored();
		$now    = gmdate( 'c' );
		$prev   = isset( $stored[ $key ] ) && is_array( $stored[ $key ] ) ? $stored[ $key ] : array();

		$stored[ $key ] = array(
			'config'       => $next,
			'connected_at' => ! empty( $prev['connected_at'] ) ? $prev['connected_at'] : $now,
			'updated_at'   => $now,
		);

		update_option( self::OPTION_KEY, $stored, false );

		return self::format_public_item( $def );
	}

	/**
	 * Remove a connection.
	 *
	 * @param string $key Integration key.
	 * @return array|\WP_Error
	 */
	public static function disconnect( $key ) {
		$def = self::get_definition( $key );
		if ( ! $def ) {
			return new \WP_Error( 'invalid_integration', __( 'Unknown integration.', 'blockish' ), array( 'status' => 404 ) );
		}

		$stored = self::get_stored();
		unset( $stored[ $key ] );
		update_option( self::OPTION_KEY, $stored, false );

		return self::format_public_item( $def );
	}

	/**
	 * Integration keys selectable per form (CRM + automation destinations).
	 *
	 * @return string[]
	 */
	public static function get_form_destination_keys() {
		/**
		 * Filter which catalog keys appear as per-form enable/disable switches.
		 *
		 * @param string[] $keys Integration keys.
		 */
		return apply_filters(
			'blockish_form_destination_keys',
			array(
				// Wired submit push today:
				'mailchimp',
				'convertkit',
				'hubspot',
				'brevo',
				'activecampaign',
				'zapier',
				'make',
				'webhooks',
				'slack',
				'discord',
				// Credential storage only (not in form switches until push is ready):
				// zoho, salesforce, google-sheets
			)
		);
	}

	/**
	 * Integration keys that POST form payloads to a stored URL.
	 *
	 * @return string[]
	 */
	public static function get_outbound_webhook_keys() {
		/**
		 * Filter which catalog keys are selectable as form outbound webhooks.
		 *
		 * @param string[] $keys Integration keys.
		 */
		return apply_filters(
			'blockish_outbound_webhook_keys',
			array( 'zapier', 'make', 'webhooks', 'slack', 'discord' )
		);
	}

	/**
	 * Whether catalog key is an outbound URL webhook.
	 *
	 * @param string $key Integration key.
	 * @return bool
	 */
	public static function is_outbound_webhook( $key ) {
		return in_array( sanitize_key( $key ), self::get_outbound_webhook_keys(), true );
	}

	/**
	 * Resolve the outbound endpoint URL for a connected integration.
	 *
	 * @param string $key Integration key.
	 * @return string Empty if disconnected / unknown.
	 */
	public static function get_outbound_endpoint_url( $key ) {
		$key = sanitize_key( $key );
		if ( ! self::is_outbound_webhook( $key ) || ! self::is_connected( $key ) ) {
			return '';
		}

		$config = self::get_connection( $key );
		$url_key = 'webhooks' === $key ? 'endpoint_url' : 'webhook_url';
		$url     = isset( $config[ $url_key ] ) ? trim( (string) $config[ $url_key ] ) : '';

		return $url ? esc_url_raw( $url ) : '';
	}

	/**
	 * Connected outbound webhook integrations (public-safe fields).
	 *
	 * @return array<int, array>
	 */
	public static function get_connected_outbound_webhooks() {
		$items = array();
		foreach ( self::get_outbound_webhook_keys() as $key ) {
			$def = self::get_definition( $key );
			if ( ! $def || ! self::is_connected( $key ) ) {
				continue;
			}
			$row     = self::format_public_item( $def );
			$items[] = array(
				'key'         => $row['key'],
				'name'        => $row['name'],
				'icon'        => $row['icon'],
				'initials'    => $row['initials'],
				'color'       => $row['color'],
				'description' => $row['description'],
				'status'      => $row['status'],
			);
		}
		return $items;
	}
}
