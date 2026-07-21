<?php
namespace Blockish\Config;

defined('ABSPATH') || exit;

class AddonsList extends ConfigList {

    use \Blockish\Traits\SingletonTrait;

    protected $type = 'addon';

    public function __construct() {
        parent::__construct();
    }

    protected function set_list() {
        $forms_installed      = class_exists( 'Blockish_Forms' );
        $forms_licensed       = $this->has_valid_license( 'blockish_forms_fs' );
        $dynamicity_installed = class_exists( 'Blockish_Dynamicity' );
        $dynamicity_licensed  = $this->has_valid_license( 'blockish_dynamicity_fs' );

        $this->list = array(
            'blockish-pro-bundle' => array(
                'name'        => __('Blockish Pro Bundle', 'blockish'),
                'description' => __('Get Lifetime Access to ALL current and future Blockish Addons! This is the ultimate bundle for professionals who want everything we have to offer without any recurring fees.', 'blockish'),
                'is_bundle'   => true,
                'freemius_id' => '12345', // Placeholder Freemius Plugin ID
                'public_key'  => 'pk_placeholder', // Placeholder Public Key
                'is_installed'=> false, // Bundle itself is not a plugin
                'is_licensed' => false,
                'is_available'=> false,
                'features'    => array(
                    __('All Current & Future Addons', 'blockish'),
                    __('Lifetime Updates & Support', 'blockish'),
                    __('Unlimited Sites License', 'blockish'),
                    __('Premium Templates & Blocks', 'blockish'),
                ),
            ),
            'blockish-forms' => array(
                'name'        => __('Blockish Forms', 'blockish'),
                'description' => __('A modern, secure Form Builder addon for Blockish with reCAPTCHA protection and reusable centralized form management.', 'blockish'),
                'is_bundle'   => false,
                'freemius_id' => '23456', // Placeholder Freemius Plugin ID
                'public_key'  => 'pk_placeholder', // Placeholder Public Key
                'is_installed'=> $forms_installed,
                'is_licensed' => $forms_licensed,
                'is_available'=> $forms_installed && $forms_licensed,
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
                'freemius_id' => '34567', // Placeholder Freemius Plugin ID
                'public_key'  => 'pk_placeholder', // Placeholder Public Key
                'is_installed'=> $dynamicity_installed,
                'is_licensed' => $dynamicity_licensed,
                'is_available'=> $dynamicity_installed && $dynamicity_licensed,
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
     * Check an add-on's Freemius instance for a usable premium license.
     *
     * @param string $helper_function Add-on Freemius helper function.
     * @return bool
     */
    private function has_valid_license( $helper_function ) {
        // Bypass license check for local environments
        if ( function_exists( 'wp_get_environment_type' ) && in_array( wp_get_environment_type(), array( 'local', 'development' ), true ) ) {
            return true;
        }
        
        $host = isset( $_SERVER['HTTP_HOST'] ) ? $_SERVER['HTTP_HOST'] : '';
        if ( preg_match( '/\.(local|localhost|test)$/i', $host ) || $host === 'localhost' || $host === '127.0.0.1' ) {
            return true;
        }

        if ( ! function_exists( $helper_function ) ) {
            return false;
        }

        $sdk = call_user_func( $helper_function );

        return (
            is_object( $sdk ) &&
            method_exists( $sdk, 'can_use_premium_code' ) &&
            $sdk->can_use_premium_code()
        );
    }
}
