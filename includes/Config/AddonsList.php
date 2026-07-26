<?php
namespace Blockish\Config;

defined('ABSPATH') || exit;

class AddonsList extends ConfigList {

    use \Blockish\Traits\SingletonTrait;

    protected $type = 'addon';

    public function __construct() {
        parent::__construct();
    }

    /**
     * Rebuild the add-ons list (e.g. after license activate/deactivate).
     *
     * @return array
     */
    public function refresh_list() {
        $this->set_list();
        return $this->list;
    }

    protected function set_list() {
        $forms_installed      = class_exists( 'Blockish_Forms' );
        $dynamicity_installed = class_exists( 'Blockish_Dynamicity' );

        $forms_license      = $this->get_license_meta( 'blockish_forms_fs' );
        $dynamicity_license = $this->get_license_meta( 'blockish_dynamicity_fs' );

        $forms_licensed       = $forms_license['is_active'] || $this->is_local_license_bypass();
        $dynamicity_licensed  = $dynamicity_license['is_active'] || $this->is_local_license_bypass();

        // Pro Bundle intentionally omitted from the Addons UI until a real Freemius
        // product + pricing exist (soft launch sells Forms + Dynamicity only).

        $this->list = array(
            'blockish-forms' => array(
                'name'        => __('Blockish Forms', 'blockish'),
                'description' => __('A modern, secure Form Builder addon for Blockish with reCAPTCHA protection and reusable centralized form management.', 'blockish'),
                'is_bundle'   => false,
                'freemius_id' => '35570',
                'public_key'  => 'pk_30z0b14a271932fc6b6990dbec091',
                'is_installed'=> $forms_installed,
                'is_licensed' => $forms_licensed,
                'is_available'=> $forms_installed && $forms_licensed,
                'supports_license_key' => true,
                'license'     => $forms_license,
                // Freemius → Forms → Plans.
                'plans'       => array(
                    array(
                        'id'          => '58654',
                        'key'         => 'personal',
                        'title'       => __('Personal', 'blockish'),
                        'description' => __('1 site', 'blockish'),
                    ),
                    array(
                        'id'          => '58656',
                        'key'         => 'agency',
                        'title'       => __('Agency', 'blockish'),
                        'description' => __('Unlimited sites', 'blockish'),
                    ),
                ),
                'features'    => array(
                    __('Drag & Drop Form Builder', 'blockish'),
                    __('reCAPTCHA v3 Integration', 'blockish'),
                    __('Centralized Form Management', 'blockish'),
                    __('Database Submissions', 'blockish'),
                ),
            ),
            'blockish-dynamicity' => array(
                'name'        => __('Blockish Dynamicity', 'blockish'),
                'description' => __('A powerful addon for Blockish that introduces dynamic data capabilities. Includes a visual Query Builder, Loop, Pagination blocks, and advanced display conditions.', 'blockish'),
                'is_bundle'   => false,
                'freemius_id' => '35567',
                'public_key'  => 'pk_fbb8916f708406e71483681e74b8c',
                'is_installed'=> $dynamicity_installed,
                'is_licensed' => $dynamicity_licensed,
                'is_available'=> $dynamicity_installed && $dynamicity_licensed,
                'supports_license_key' => true,
                'license'     => $dynamicity_license,
                'plans'       => array(
                    array(
                        'id'          => '58645',
                        'key'         => 'personal',
                        'title'       => __('Personal', 'blockish'),
                        'description' => __('1 site', 'blockish'),
                    ),
                    array(
                        'id'          => '58651',
                        'key'         => 'agency',
                        'title'       => __('Agency', 'blockish'),
                        'description' => __('Unlimited sites', 'blockish'),
                    ),
                ),
                'features'    => array(
                    __('Advanced Query Builder', 'blockish'),
                    __('Dynamic Data Binding', 'blockish'),
                    __('Display Conditions', 'blockish'),
                    __('Custom Loop Templates', 'blockish'),
                ),
            ),
        );

        $this->list = apply_filters( 'blockish/addons/list', $this->list );
    }

    /**
     * Whether local/dev environments bypass Freemius gating for features.
     *
     * @return bool
     */
    private function is_local_license_bypass() {
        if ( function_exists( 'wp_get_environment_type' ) && in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
            return true;
        }

        $host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';
        if ( preg_match( '/\.(local|localhost|test)$/i', $host ) || $host === 'localhost' || $host === '127.0.0.1' ) {
            return true;
        }

        return false;
    }

    /**
     * Build license status for the dashboard (real Freemius state — no local bypass).
     *
     * @param string $helper_function Add-on Freemius helper function.
     * @return array
     */
    private function get_license_meta( $helper_function ) {
        $meta = array(
            'is_active'  => false,
            'fs_ready'   => false,
            'masked_key' => '',
            'plan_title' => '',
        );

        if ( ! function_exists( $helper_function ) ) {
            return $meta;
        }

        $sdk = call_user_func( $helper_function );

        if ( ! is_object( $sdk ) ) {
            return $meta;
        }

        $meta['fs_ready'] = true;

        if ( method_exists( $sdk, 'can_use_premium_code' ) && $sdk->can_use_premium_code() ) {
            $meta['is_active'] = true;
        }

        if ( method_exists( $sdk, '_get_license' ) ) {
            $license = $sdk->_get_license();
            if ( is_object( $license ) && ! empty( $license->secret_key ) ) {
                $secret = (string) $license->secret_key;
                $length = strlen( $secret );

                if ( $length <= 9 ) {
                    $meta['masked_key'] = str_repeat( '•', max( 0, $length ) );
                } else {
                    $meta['masked_key'] = substr( $secret, 0, 6 )
                        . str_repeat( '•', $length - 9 )
                        . substr( $secret, -3 );
                }
            }
        }

        if ( method_exists( $sdk, 'get_plan_title' ) ) {
            $plan_title = trim( (string) $sdk->get_plan_title() );
            // Freemius sometimes returns the untranslated key before plans sync.
            if ( '' !== $plan_title && 'PLAN_TITLE' !== strtoupper( $plan_title ) ) {
                $meta['plan_title'] = $plan_title;
            }
        }

        return $meta;
    }
}
