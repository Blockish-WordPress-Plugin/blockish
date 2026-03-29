<?php

namespace Blockish\Core;

use Blockish\Config\ExtensionList;

defined('ABSPATH') || exit;

class Extensions
{
    use \Blockish\Traits\SingletonTrait;

    /**
     * Cached extension metadata keyed by slug.
     *
     * @var array<string, array>
     */
    private $extensions = [];

    /**
     * Constructor.
     */
    private function __construct()
    {
        add_action('init', [$this, 'load_extensions'], 11);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
        add_filter('block_type_metadata', [$this, 'inject_extension_attributes'], 20);
    }

    /**
     * Load active extension metadata and register their assets.
     *
     * @return void
     */
    public function load_extensions()
    {
        $active_extensions = ExtensionList::get_instance()->get_list('active');

        if (empty($active_extensions)) {
            return;
        }

        foreach ($active_extensions as $slug => $extension) {
            $path = BLOCKISH_EXTENSIONS_DIR . $slug;
            if (!is_dir($path)) {
                continue;
            }

            $metadata = $this->get_extension_metadata($path);
            if (empty($metadata)) {
                continue;
            }

            $this->extensions[$slug] = $metadata;
            $this->register_assets($slug, $metadata, $path);
        }
    }

    /**
     * Enqueue extension editor assets only.
     *
     * @return void
     */
    public function enqueue_editor_assets()
    {
        foreach ($this->extensions as $slug => $metadata) {
            $this->maybe_enqueue_handle($slug, 'editorScript');
            $this->maybe_enqueue_handle($slug, 'editorStyle');
        }
    }

    /**
     * Inject extension attributes into selected blocks via include/exclude rules.
     *
     * @param array $metadata Block metadata.
     * @return array
     */
    public function inject_extension_attributes($metadata)
    {
        if (!isset($metadata['name']) || !is_string($metadata['name'])) {
            return $metadata;
        }

        if (empty($this->extensions)) {
            return $metadata;
        }

        foreach ($this->extensions as $extension) {
            if (!$this->extension_targets_block($extension, $metadata['name'])) {
                continue;
            }

            if (empty($extension['attributes']) || !is_array($extension['attributes'])) {
                continue;
            }

            if (!isset($metadata['attributes']) || !is_array($metadata['attributes'])) {
                $metadata['attributes'] = [];
            }

            $metadata['attributes'] = array_merge($metadata['attributes'], $extension['attributes']);
        }

        return $metadata;
    }

    /**
     * Get extension metadata from block.json.
     *
     * @param string $path Extension directory path.
     * @return array|false
     */
    private function get_extension_metadata($path)
    {
        $block_json_path = trailingslashit($path) . 'block.json';

        if (!is_readable($block_json_path)) {
            return false;
        }

        $contents = file_get_contents($block_json_path);
        if ($contents === false) {
            return false;
        }

        $metadata = json_decode($contents, true);
        if (empty($metadata) || !is_array($metadata)) {
            return false;
        }

        return $metadata;
    }

    /**
     * Register extension assets found in metadata.
     *
     * @param string $slug Extension slug.
     * @param array  $metadata Extension metadata.
     * @param string $path Extension directory path.
     * @return void
     */
    private function register_assets($slug, $metadata, $path)
    {
        $this->process_and_register_asset($slug, $metadata, $path, 'editorScript', 'script');
        $this->process_and_register_asset($slug, $metadata, $path, 'editorStyle', 'style');
        $this->process_and_register_asset($slug, $metadata, $path, 'script', 'script');
        $this->process_and_register_asset($slug, $metadata, $path, 'style', 'style');
        $this->process_and_register_asset($slug, $metadata, $path, 'viewScript', 'script');
        $this->process_and_register_asset($slug, $metadata, $path, 'viewStyle', 'style');
    }

    /**
     * Process one block.json asset field.
     *
     * @param string $slug Extension slug.
     * @param array  $metadata Extension metadata.
     * @param string $path Extension directory path.
     * @param string $field_name Field name in block.json.
     * @param string $type script|style.
     * @return void
     */
    private function process_and_register_asset($slug, $metadata, $path, $field_name, $type)
    {
        if (empty($metadata[$field_name]) || !is_string($metadata[$field_name])) {
            return;
        }

        $asset = $metadata[$field_name];
        if (!str_starts_with($asset, 'file:')) {
            return;
        }

        $this->register_asset($slug, $path, $asset, $type, $field_name);
    }

    /**
     * Register a single script/style handle.
     *
     * @param string $slug Extension slug.
     * @param string $extension_path Extension directory path.
     * @param string $asset Asset path with file: prefix.
     * @param string $type script|style.
     * @param string $field_name Field name from metadata.
     * @return void
     */
    private function register_asset($slug, $extension_path, $asset, $type, $field_name)
    {
        $asset_relative_path = remove_block_asset_path_prefix($asset);
        $asset_absolute_path = wp_normalize_path($extension_path . '/' . $asset_relative_path);

        if (!file_exists($asset_absolute_path)) {
            return;
        }

        $asset_data = [
            'dependencies' => [],
            'version' => filemtime($asset_absolute_path),
        ];

        if ($type === 'script') {
            $script_asset_path = wp_normalize_path(
                substr_replace($asset_absolute_path, '.asset.php', -strlen('.js'))
            );

            if (file_exists($script_asset_path)) {
                $script_asset_data = include $script_asset_path;
                if (is_array($script_asset_data)) {
                    $asset_data = array_merge($asset_data, $script_asset_data);
                }
            }
        }

        $handle = $this->get_extension_asset_handle($slug, $field_name);
        $asset_url = plugins_url(
            'build/extensions/' . $slug . '/' . ltrim($asset_relative_path, '/'),
            BLOCKISH_DIR . 'blockish.php'
        );

        if ($type === 'script') {
            wp_register_script(
                $handle,
                $asset_url,
                $asset_data['dependencies'] ?? [],
                $asset_data['version'] ?? false,
                ['strategy' => 'defer', 'in_footer' => true]
            );
            return;
        }

        wp_register_style(
            $handle,
            $asset_url,
            [],
            $asset_data['version'] ?? false
        );
    }

    /**
     * Generate deterministic handle per extension and field.
     *
     * @param string $slug Extension slug.
     * @param string $field_name Metadata field.
     * @return string
     */
    private function get_extension_asset_handle($slug, $field_name)
    {
        return 'blockish-extension-' . sanitize_key($slug) . '-' . sanitize_key($field_name);
    }

    /**
     * Enqueue a registered extension asset handle if present.
     *
     * @param string $slug Extension slug.
     * @param string $field_name Metadata field.
     * @return void
     */
    private function maybe_enqueue_handle($slug, $field_name)
    {
        $handle = $this->get_extension_asset_handle($slug, $field_name);

        if (str_contains($field_name, 'Style') || $field_name === 'style') {
            if (wp_style_is($handle, 'registered')) {
                wp_enqueue_style($handle);
            }
            return;
        }

        if (wp_script_is($handle, 'registered')) {
            wp_enqueue_script($handle);
        }
    }

    /**
     * Check if an extension should target a given block name.
     *
     * @param array  $extension Extension metadata.
     * @param string $block_name Current block name.
     * @return bool
     */
    private function extension_targets_block($extension, $block_name)
    {
        $include = isset($extension['include']) && is_array($extension['include'])
            ? $extension['include']
            : [];
        $exclude = isset($extension['exclude']) && is_array($extension['exclude'])
            ? $extension['exclude']
            : [];

        if (!empty($include) && !in_array('*', $include, true) && !in_array($block_name, $include, true)) {
            return false;
        }

        if (in_array($block_name, $exclude, true)) {
            return false;
        }

        // If include is not defined, default to Blockish blocks.
        if (empty($include)) {
            return str_starts_with($block_name, 'blockish/');
        }

        return true;
    }

}
