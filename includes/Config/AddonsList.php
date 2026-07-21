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
        $this->list = array(
            'blockish-pro-bundle' => array(
                'name'        => __('Blockish Pro Bundle', 'blockish'),
                'description' => __('Get Lifetime Access to ALL current and future Blockish Addons! This is the ultimate bundle for professionals who want everything we have to offer without any recurring fees.', 'blockish'),
                'is_bundle'   => true,
                'freemius_id' => '12345', // Placeholder Freemius Plugin ID
                'public_key'  => 'pk_placeholder', // Placeholder Public Key
                'is_installed'=> false, // Bundle itself is not a plugin
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
                'is_installed'=> class_exists('Blockish_Forms'),
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
                'is_installed'=> class_exists('Blockish_Dynamicity'),
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
}
