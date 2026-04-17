<?php

namespace Blockish\Core;

use Blockish\Config\ExtensionList;

defined('ABSPATH') || exit;

class Extensions
{
    use \Blockish\Traits\SingletonTrait;

    /**
     * Discovered extension metadata keyed by slug.
     *
     * @var array<string, array>
     */
    private $discovered_extensions = [];

    /**
     * Active extension metadata keyed by slug.
     *
     * @var array<string, array>
     */
    private $active_extensions = [];

    /**
     * Constructor.
     */
    private function __construct()
    {
        // Must run before block registration (Blocks::register_blocks on init priority 10)
        // so extension attributes are available during block_type_metadata filtering.
        add_action('init', [$this, 'register_extensions'], 9);
        add_action('enqueue_block_editor_assets', [$this, 'enqueue_editor_assets']);
    }

    /**
     * Register active extensions from configured paths.
     *
     * @return void
     */
    public function register_extensions()
    {
        $this->discovered_extensions = [];
        $this->active_extensions = [];

        $active_extensions = ExtensionList::get_instance()->get_list('active');
        if (empty($active_extensions)) {
            return;
        }

        foreach ($active_extensions as $slug => $extension) {
            $path = !empty($extension['path'])
                ? $extension['path']
                : trailingslashit(BLOCKISH_EXTENSIONS_DIR) . $slug;

            $metadata = $this->blockish_register_extensions_from_metadata($path);
            if (empty($metadata)) {
                continue;
            }

            $this->active_extensions[$slug] = $metadata;
        }
    }

    /**
     * Return merged extension metadata applicable for a given block.
     *
     * @param string $block_name Current block name.
     * @return array
     */
    public function get_applicable_metadata_for_block($block_name)
    {
        $merged = [
            'attributes' => [],
            'usesContext' => [],
            'providesContext' => [],
        ];

        // Safety net for any early metadata calls before init hooks complete.
        if (empty($this->active_extensions)) {
            $this->register_extensions();
        }
        
        if (
            empty($block_name) ||
            !str_starts_with($block_name, 'blockish') ||
            empty($this->active_extensions)
        ) {
            return $merged;
        }


        foreach ($this->active_extensions as $extension) {
            if (!$this->extension_targets_block($extension, $block_name)) {
                continue;
            }

            if (!empty($extension['attributes']) && is_array($extension['attributes'])) {
                $merged['attributes'] = array_merge($merged['attributes'], $extension['attributes']);
            }

            if (!empty($extension['usesContext']) && is_array($extension['usesContext'])) {
                $merged['usesContext'] = array_unique(array_merge($merged['usesContext'], $extension['usesContext']));
            }

            if (!empty($extension['providesContext']) && is_array($extension['providesContext'])) {
                $merged['providesContext'] = array_merge($merged['providesContext'], $extension['providesContext']);
            }
        }

        return $merged;
    }

    /**
     * Enqueue extension editor assets only.
     *
     * @return void
     */
    public function enqueue_editor_assets()
    {
        foreach ($this->active_extensions as $slug => $metadata) {
            $this->maybe_enqueue_handle($slug, 'editorScript');
            $this->maybe_enqueue_handle($slug, 'editorStyle');
        }
    }

    /**
     * Register one extension by directory path (block.json driven).
     *
     * @param string $path Extension directory path.
     * @return array|false
     */
    public function blockish_register_extensions_from_metadata($path)
    {
        if (empty($path) || !is_dir($path)) {
            return false;
        }

        $metadata = $this->get_extension_metadata($path);
        if (empty($metadata)) {
            return false;
        }

        $slug = basename(untrailingslashit($path));
        $this->register_assets($slug, $metadata, $path);
        $this->discovered_extensions[$slug] = $metadata;

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
    private function register_assets($slug, &$metadata, $path)
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
    private function process_and_register_asset($slug, &$metadata, $path, $field_name, $type)
    {
        if (empty($metadata[$field_name])) {
            return;
        }

        $assets = is_array($metadata[$field_name])
            ? $metadata[$field_name]
            : [$metadata[$field_name]];

        $registered_handles = [];

        foreach ($assets as $index => $asset) {
            if (!is_string($asset) || $asset === '') {
                continue;
            }

            if (str_starts_with($asset, 'file:')) {
                $handle = $this->register_asset($slug, $path, $asset, $type, $field_name, $index);
                if (!empty($handle)) {
                    $registered_handles[] = $handle;
                }
                continue;
            }

            $registered_handles[] = $asset;
        }

        if (empty($registered_handles)) {
            unset($metadata[$field_name]);
            return;
        }

        $metadata[$field_name] = count($registered_handles) === 1
            ? $registered_handles[0]
            : array_values(array_unique($registered_handles));
    }

    /**
     * Register a single script/style handle.
     *
     * @param string $slug Extension slug.
     * @param string $extension_path Extension directory path.
     * @param string $asset Asset path with file: prefix.
     * @param string $type script|style.
     * @param string $field_name Field name from metadata.
     * @param int    $index Asset index for unique generated handles.
     * @return string
     */
    private function register_asset($slug, $extension_path, $asset, $type, $field_name, $index = 0)
    {
        $asset_relative_path = remove_block_asset_path_prefix($asset);
        $asset_absolute_path = wp_normalize_path($extension_path . '/' . $asset_relative_path);

        if (!file_exists($asset_absolute_path)) {
            return '';
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

        $handle = $this->get_extension_asset_handle($slug, $field_name, $index);
        $asset_url = $this->get_asset_url_from_path($asset_absolute_path);
        if (empty($asset_url)) {
            return '';
        }

        if ($type === 'script') {
            wp_register_script(
                $handle,
                $asset_url,
                $asset_data['dependencies'] ?? [],
                $asset_data['version'] ?? false,
                ['strategy' => 'defer', 'in_footer' => true]
            );
            return $handle;
        }

        wp_register_style(
            $handle,
            $asset_url,
            [],
            $asset_data['version'] ?? false
        );

        return $handle;
    }

    /**
     * Convert a filesystem asset path to URL.
     *
     * @param string $asset_absolute_path
     * @return string
     */
    private function get_asset_url_from_path($asset_absolute_path)
    {
        $asset_absolute_path = wp_normalize_path($asset_absolute_path);
        $content_dir = wp_normalize_path(WP_CONTENT_DIR);

        if (!str_starts_with($asset_absolute_path, $content_dir)) {
            return '';
        }

        $relative = ltrim(str_replace($content_dir, '', $asset_absolute_path), '/');
        return content_url($relative);
    }

    /**
     * Generate deterministic handle per extension and field.
     *
     * @param string $slug Extension slug.
     * @param string $field_name Metadata field.
     * @return string
     */
    private function get_extension_asset_handle($slug, $field_name, $index = 0)
    {
        $handle = 'blockish-extension-' . sanitize_key($slug) . '-' . sanitize_key($field_name);

        if ($index > 0) {
            $handle .= '-' . absint($index + 1);
        }

        return $handle;
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
        if (empty($this->active_extensions[$slug][$field_name])) {
            return;
        }

        $handles = is_array($this->active_extensions[$slug][$field_name])
            ? $this->active_extensions[$slug][$field_name]
            : [$this->active_extensions[$slug][$field_name]];

        if (str_contains($field_name, 'Style') || $field_name === 'style') {
            foreach ($handles as $handle) {
                if (is_string($handle) && wp_style_is($handle, 'registered')) {
                    wp_enqueue_style($handle);
                }
            }
            return;
        }

        foreach ($handles as $handle) {
            if (is_string($handle) && wp_script_is($handle, 'registered')) {
                wp_enqueue_script($handle);
            }
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
        // Extensions are scoped to Blockish blocks only.
        if (!str_starts_with($block_name, 'blockish/')) {
            return false;
        }

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

        if (empty($include)) {
            return str_starts_with($block_name, 'blockish/');
        }

        return true;
    }
}
