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

        // Expose each public ability as its own MCP tool (skip generic adapter bridge tools).
        add_filter('mcp_adapter_default_server_config', [$this, 'expose_abilities_as_mcp_tools']);

        // Third-party abilities can ship schemas that break strict clients; repair them on the way out.
        add_filter('mcp_adapter_tools_list', [SchemaSanitizer::class, 'sanitize_tools'], 10, 2);

        // Schema helpers (validation/warnings) — no longer registers pending meta storage.
        BlockSchemaMeta::get_instance();
    }

    /**
     * Replace the default 3 adapter tools with every public ability as a first-class MCP tool.
     *
     * @param mixed $config
     * @return array
     */
    public function expose_abilities_as_mcp_tools( $config )
    {
        if ( ! is_array( $config ) ) {
            return $config;
        }

        if ( ! function_exists( 'wp_get_abilities' ) ) {
            return $config;
        }

        $tools = [];
        $fn = 'wp_get_abilities';
        foreach ( $fn() as $ability ) {
            $name = $ability->get_name();

            // Drop discover / get-info / execute bridge — agents call abilities directly.
            if ( 0 === strpos( $name, 'mcp-adapter/' ) ) {
                continue;
            }

            $meta = $ability->get_meta();
            if ( empty( $meta['mcp']['public'] ) ) {
                continue;
            }

            $type = $meta['mcp']['type'] ?? 'tool';
            if ( 'tool' !== $type ) {
                continue;
            }

            $tools[] = $name;
        }

        if ( ! empty( $tools ) ) {
            $config['tools']              = $tools;
            $config['server_name']        = $config['server_name'] ?? 'Blockish MCP Server';
            $config['server_description'] = 'Blockish MCP — each ability is exposed as a direct tool.';
        }

        return $config;
    }

    public function register_categories()
    {
        $fn = 'wp_register_ability_category';
        $fn('blockish', [
            'label'       => __('Blockish', 'blockish'),
            'description' => __('Blockish AI abilities', 'blockish'),
        ]);
    }

    private array $abilities = [
        Abilities\SiteInfo\Config::class,
        Abilities\BlocksInfo\Config::class,
        Abilities\ExtensionsInfo\Config::class,
        Abilities\PostTypes\Config::class,
        Abilities\ManagePost\Config::class,
        Abilities\ManagePattern\Config::class,
        Abilities\GetRevisions\Config::class,
        Abilities\RestoreRevision\Config::class,
        Abilities\GetClasses\Config::class,
        Abilities\GetClassUsage\Config::class,
        Abilities\ManageClass\Config::class,
        Abilities\BlockDocs\Config::class,
        Abilities\GetClassManagerDocs\Config::class,
        Abilities\ManageMedia\Config::class,
        Abilities\GetMedia\Config::class,
        Abilities\GetPosts\Config::class,
        Abilities\GetTemplates\Config::class,
        Abilities\FetchCloudTemplates\Config::class,
        Abilities\ManageTemplate\Config::class,
        Abilities\ManageThemeJson\Config::class,
        Abilities\GetThemeJsonDocs\Config::class,
        Abilities\WriteBlog\Config::class,
        Abilities\GetTaxonomies\Config::class,
        Abilities\ManageTerm\Config::class,
        Abilities\GetDesignerWorkflow\Config::class,
        Abilities\GetAutomationGuideline\Config::class,
        Abilities\GetIcons\Config::class,
        Abilities\GetFonts\Config::class,
        Abilities\FetchGoogleFonts\Config::class,
        Abilities\ManageFonts\Config::class,
        Abilities\ManageOptions\Config::class,
        Abilities\ManagePluginsThemes\Config::class,
        Abilities\ManageComments\Config::class,
        Abilities\ManageInteractions\Config::class,
        Abilities\TriggerRefresh\Config::class,
        Abilities\JsonHelper\Config::class,
        Abilities\ConvertCss\Config::class,
        Abilities\GetMagicLogin\Config::class,
    ];

    public function register_abilities()
    {
        foreach ( $this->abilities as $config ) {
            $fn = 'wp_register_ability';
            $fn( $config::NAME, $config::get() );
        }
    }
}
