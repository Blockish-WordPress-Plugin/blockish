<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

use Blockish\Traits\SingletonTrait;

class Loader
{

    use SingletonTrait;

    private function __construct()
    {
        add_action('wp_abilities_api_categories_init', [$this, 'register_categories']);
        add_action('wp_abilities_api_init', [$this, 'register_abilities']);
        add_action('init', [$this, 'register_settings']);


        BlockSchemaMeta::get_instance();
    }

    public function register_categories()
    {
        wp_register_ability_category('blockish', [
            'label'       => __('Blockish', 'blockish'),
            'description' => __('Blockish AI abilities', 'blockish'),
        ]);
    }


    public function register_settings()
    {
        $schema = [
            'type'                 => 'object',
            'additionalProperties' => true,
        ];

        register_setting('blockish', 'blockish_mcp_staged_template', [
            'type'         => 'object',
            'show_in_rest' => [
                'schema' => $schema,
            ],
            'default'      => [],
        ]);

        register_setting('blockish', 'blockish_mcp_staged_template_part', [
            'type'         => 'object',
            'show_in_rest' => [
                'schema' => $schema,
            ],
            'default'      => [],
        ]);

    }

    private array $abilities = [
        Abilities\SiteInfo\Config::class,
        Abilities\BlocksInfo\Config::class,
        Abilities\ExtensionsInfo\Config::class,
        Abilities\PostTypes\Config::class,
        Abilities\ManagePost\Config::class,
        Abilities\GetClasses\Config::class,
        Abilities\ManageClass\Config::class,
        Abilities\BlockDocs\Config::class,
        Abilities\GetClassManagerDocs\Config::class,
        Abilities\UploadMedia\Config::class,
        Abilities\GetMedia\Config::class,
        Abilities\GetPosts\Config::class,
        Abilities\GetTemplates\Config::class,
        Abilities\ManageTemplate\Config::class,
        Abilities\ManageThemeJson\Config::class,
        Abilities\GetThemeJsonDocs\Config::class,
        Abilities\WriteBlog\Config::class,
        Abilities\GetTaxonomies\Config::class,
        Abilities\ManageTerm\Config::class,
        Abilities\GetDesignerWorkflow\Config::class,
    ];

    public function register_abilities()
    {
        foreach ( $this->abilities as $config ) {
            wp_register_ability( $config::NAME, $config::get() );
        }
    }
}
