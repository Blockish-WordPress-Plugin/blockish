<?php

namespace Blockish\Core;

use Blockish\Config\ExtensionList;

defined('ABSPATH') || exit;

class Extensions
{
    use \Blockish\Traits\SingletonTrait;

    public $scripts_handles = ['blockish-editorscript', 'blockish-script', 'blockish-viewscript'];
    public $styles_handles = ['blockish-editorstyle', 'blockish-style', 'blockish-viewstyle'];

    /**
     * Constructor.
     * Registers the extensions.
     */
    private function __construct()
    {
        add_action('enqueue_block_assets', [$this, 'register_extension_assets']);
        add_filter('render_block_data', [$this, 'register_blockish_extensions'], 10);
    }

    /**
     * register_extension_assets
     * 
     */
    public function register_extension_assets()
    {
        $active_extensions = ExtensionList::get_instance()->get_list('active');
        foreach ($active_extensions as $slug => $extension) {
            $path = BLOCKISH_EXTENSIONS_DIR . $slug;
            if (is_readable($path)) {
                $extension_metadata = $this->get_extensions_metadata($path);
                if (!empty($extension_metadata)) {
                    $this->register_assets($extension_metadata, $path);
                    if (is_admin()) {
                        foreach ($this->scripts_handles as $handle) {
                            if (wp_script_is($handle, 'registered')) {
                                wp_enqueue_script($handle);
                            }
                        }
                    
                        foreach ($this->styles_handles as $handle) {
                            if (wp_style_is($handle, 'registered')) {
                                wp_enqueue_style($handle);
                            }
                        }
                    }               
                }
            }
        }
    }


    /**
     * Registers the active extensions from the ExtensionList.
     */
    public function register_blockish_extensions($block)
    {
        $active_extensions = ExtensionList::get_instance()->get_list('active');
        if (isset($block['blockName']) && str_contains($block['blockName'], 'blockish') && !empty($active_extensions)) {
            // Register the necessary assets from block.json
            foreach ($active_extensions as $slug => $extension) {
                $path = BLOCKISH_EXTENSIONS_DIR . $slug;
                if (is_readable($path)) {
                    $extension_metadata = $this->get_extensions_metadata($path);
                    if (!empty($extension_metadata)) {
                        foreach ($this->scripts_handles as $handle) {
                            if (wp_script_is($handle, 'registered') && !str_contains($handle, 'editor')) {
                                if (empty($extension_metadata['editorScriptData']['conditions'])) {
                                    wp_enqueue_script('blockish-editorscript');
                                } else {
                                    $data = $extension_metadata['editorScriptData'];
                                    $conditions = $data['conditions'] ?? [];
                                    if ($this->should_execute_scripts($conditions, $block)) {
                                        wp_enqueue_script('blockish-editorscript');
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        return $block;
    }

    /**
     * Get WP filesystem
     *
     * @return void
     */
    protected function get_filesystem()
    {
        // Check if WP_Filesystem is available
        if (!function_exists('WP_Filesystem')) {
            require_once ABSPATH . 'wp-admin/includes/file.php';
        }

        // Initialize WP_Filesystem
        WP_Filesystem();
    }

    /**
     * get_extensions_metadata
     *
     * @param string $path The path to the extension.
     * @return array | false
     */
    private function get_extensions_metadata($path)
    {
        $this->get_filesystem();
        global $wp_filesystem;

        $block_json_path = $path . '/block.json';

        // Ensure the block.json file exists
        if (!is_readable($block_json_path)) {
            return false;
        }

        // Get the contents of block.json
        $block_json = $wp_filesystem->get_contents($block_json_path);

        // Decode the JSON into an associative array
        $metadata = json_decode($block_json, true);

        if (empty($metadata)) {
            return false;
        }

        // Check if the "file" key is available
        if (!isset($path)) {
            $path = $block_json_path;  // Use the path to block.json as a fallback
        }

        return $metadata;
    }

    /**
     * Registers scripts and styles for the extension.
     *
     * @param array  $metadata The block.json metadata.
     * @param string $path     The path to the extension directory.
     */
    private function register_assets($metadata, $path)
    {
        // Register editor scripts and styles
        $this->process_and_register_assets($metadata, $path, 'editorScript', 'script');
        $this->process_and_register_assets($metadata, $path, 'editorStyle', 'style');
        $this->process_and_register_assets($metadata, $path, 'style', 'style');
        $this->process_and_register_assets($metadata, $path, 'script', 'script');
        $this->process_and_register_assets($metadata, $path, 'viewScript', 'script');
        $this->process_and_register_assets($metadata, $path, 'viewStyle', 'style');
    }

    /**
     * Process asset registration (script or style) and enqueue.
     *
     * @param array  $metadata   The block.json metadata.
     * @param string $path       The path to the extension directory.
     * @param string $field_name The field name in block.json (editorScript, editorStyle).
     * @param string $type       Either 'script' or 'style'.
     */
    private function process_and_register_assets($metadata, $path, $field_name, $type)
    {

        if (empty($metadata[$field_name])) {
            return;
        }

        $assets = $metadata[$field_name];

        if (is_string($assets)) {
            return $this->register_asset($path, $assets, $type, $field_name, $metadata);
        }
    }

    /**
     * Registers a script or style.
     *
     * @param string $extension_file The block's main file path for asset normalization.
     * @param mixed  $asset      The asset, either a handle or file path.
     * @param string $type       Either 'script' or 'style'.
     */
    private function register_asset($extension_file, $asset, $type, $field_name, $metadata)
    {
        // Ensure that $extension_file is not null before calling dirname()
        if (empty($extension_file)) {
            return;
        }

        // If the asset is a handle, do nothing as it's already registered.
        if (!is_string($asset) || !str_starts_with($asset, 'file:')) {
            return;
        }

        // Remove the 'file:' prefix and get the actual file path.
        $asset = remove_block_asset_path_prefix($asset);
        $path = wp_normalize_path($extension_file);

        // Build the script asset file path and normalize it.
        $script_asset_raw_path = $path . '/' . substr_replace($asset, '.asset.php', -strlen('.js'));
        $script_asset_path = wp_normalize_path(realpath($script_asset_raw_path));

        // Check for the asset file and asset.php (for dependencies and version).
        $asset_path = wp_normalize_path(realpath($path . '/' . $asset));

        $assets = [
            'dependencies' => [],
            'version'      => filemtime($asset_path),
        ];

        if (file_exists($script_asset_path)) {
            $assets = include $script_asset_path;
        }

        // Register the script or style
        $handle = 'blockish-' . sanitize_key($field_name);
        $asset_url = plugins_url($asset, $path . '/' . $asset);
        if ($type === 'script') {
            $extension_3rd_party_dependencies = $metadata[$field_name . 'Data']['dependencies'] ?? [];
            $assets['dependencies'] = array_merge($assets['dependencies'], $extension_3rd_party_dependencies);
            wp_register_script(
                $handle,
                $asset_url,
                $assets['dependencies'],
                $assets['version'],
                ['strategy' => 'defer', 'in_footer' => true]
            );
        } elseif ($type === 'style') {
            wp_register_style(
                $handle,
                $asset_url,
                [],
                $assets['version']
            );
        }
    }

    /**
     * handle_conditions
     * 
     * @param array $metadata
     * @param array $conditions
     * 
     * @return void
     */

    public function should_execute_scripts($conditions, $block)
    {
        if (empty($conditions)) {
            return true;
        }

        foreach ($conditions as $condition) {
            $type = $condition['type'] ?? '';

            if ($type === 'attributes') {
                $key = $condition['key'] ?? [];
                // TODO: Implement multiple attributes conditions
                if (empty($condition['value']) && !empty($block['attrs'][$key])) {
                    return true;
                }elseif (!empty($condition['value']) && $block['attrs'][$key] == $condition['value']) {
                    return true;
                }elseif (!empty($condition['value']) && $block['attrs'][$key] != $condition['value']) {
                    return false;
                }elseif (empty($condition['value']) && empty($block['attrs'][$key])) {
                    return true;
                }
            }elseif ($type === 'meta') {
                // TODO: Implement meta conditions
            }elseif ($type === 'blockName') {
                // TODO: Implement blockName conditions 
            }
        }

        return false;
    }
}
