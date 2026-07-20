<?php

namespace Blockish\Core;

defined('ABSPATH') || exit;

class TemplateManager
{
    use \Blockish\Traits\SingletonTrait;

    const POST_TYPE = 'blockish_template';
    const WIZARD_OPTION_KEY = 'blockish_template_wizard_id';

    private function __construct()
    {
        add_action('init', [$this, 'register_post_type']);
        add_action('init', [$this, 'ensure_wizard_post_exists']);
        add_action('admin_head', [$this, 'hijack_editor_ui']);
        add_action('admin_enqueue_scripts', [$this, 'enqueue_wizard_scripts']);
    }

    public function register_post_type()
    {
        $args = [
            'label'               => __('Templates', 'blockish'),
            'public'              => false,
            'publicly_queryable'  => false,
            'show_ui'             => true,
            'show_in_menu'        => false, // Hide from standard menu, we'll manage via wizard
            'query_var'           => false,
            'rewrite'             => false,
            'capability_type'     => 'post',
            'has_archive'         => false,
            'hierarchical'        => false,
            'menu_position'       => null,
            'show_in_rest'        => true, // Essential for Gutenberg
            'supports'            => ['title', 'editor', 'custom-fields'],
        ];

        register_post_type(self::POST_TYPE, $args);

        // Register meta fields so they can be saved via REST API
        register_post_meta(self::POST_TYPE, 'template_type', [
            'show_in_rest' => true,
            'single'       => true,
            'type'         => 'string',
            'default'      => '',
        ]);

        register_post_meta(self::POST_TYPE, 'display_condition', [
            'show_in_rest' => true,
            'single'       => true,
            'type'         => 'string',
            'default'      => '',
        ]);
    }

    public function ensure_wizard_post_exists()
    {
        $wizard_id = get_option(self::WIZARD_OPTION_KEY);

        if ($wizard_id && get_post($wizard_id) && get_post_type($wizard_id) === self::POST_TYPE) {
            $status = get_post_status($wizard_id);
            if ($status !== 'trash') {
                return; // Wizard post already exists and is not in trash
            }
        }

        // Create the wizard post
        $post_id = wp_insert_post([
            'post_title'   => 'Template Wizard',
            'post_status'  => 'publish',
            'post_type'    => self::POST_TYPE,
            'post_content' => '<!-- blockish:template-wizard -->',
        ]);

        if (!is_wp_error($post_id)) {
            update_option(self::WIZARD_OPTION_KEY, $post_id);
        }
    }

    public function is_wizard_screen()
    {
        global $pagenow;
        if ('post.php' !== $pagenow) {
            return false;
        }

        $post_id = isset($_GET['post']) ? (int) $_GET['post'] : 0;
        $wizard_id = (int) get_option(self::WIZARD_OPTION_KEY);

        return $post_id === $wizard_id && $wizard_id !== 0;
    }

    public function hijack_editor_ui()
    {
        if (!$this->is_wizard_screen()) {
            return;
        }

        // We don't need CSS to hide elements because mounting React on #wpwrap 
        // will naturally clear out its children.
    }

    public function enqueue_wizard_scripts()
    {
        if (!$this->is_wizard_screen()) {
            return;
        }

        // Output global variable for React to detect
        wp_register_script('blockish-wizard-env', false);
        wp_enqueue_script('blockish-wizard-env');
        wp_add_inline_script('blockish-wizard-env', 'window.isBlockishTemplateWizard = true;', 'before');
    }
}
