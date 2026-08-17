<?php

namespace Blockish\Mcp\Abilities\ManagePluginsThemes;

defined('ABSPATH') || exit;

class Callbacks
{
    const SLUG_PATTERN = '/^[a-z0-9-]+$/';

    const PROTECTED_PLUGIN_SLUGS = [
        'blockish',
    ];

    const PRO_ACTIVATE_ONLY = [
        'blockish-forms',
        'blockish-dynamicity',
    ];

    const ABILITY_SHIFT_SLUGS = [
        'advanced-custom-fields',
        'woocommerce',
        'blockish-forms',
        'blockish-dynamicity',
    ];

    const ORG_DOWNLOAD_HOSTS = [
        'downloads.wordpress.org',
        'downloads.w.org',
    ];

    const RESTART_MESSAGE = 'New MCP abilities from this plugin will not appear until the user fully restarts the AI software they are using (Cursor, Claude Desktop, ChatGPT, etc.) or reconnects/reloads the Blockish MCP server. Tell them that clearly now. Do not continue as if the new tools already exist in this session.';

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function promoted_catalog(): array
    {
        return [
            [
                'slug'             => 'advanced-custom-fields',
                'name'             => 'Advanced Custom Fields',
                'type'             => 'plugin',
                'install_from_org' => true,
                'note'             => 'Custom fields / CPT. After install or activate, the user must restart their AI app for acf/* tools.',
            ],
            [
                'slug'             => 'woocommerce',
                'name'             => 'WooCommerce',
                'type'             => 'plugin',
                'install_from_org' => true,
                'note'             => 'Shop. After install or activate, the user must restart their AI app for woocommerce-* tools.',
            ],
            [
                'slug'             => 'blockish-forms',
                'name'             => 'Blockish Forms',
                'type'             => 'plugin',
                'install_from_org' => false,
                'note'             => 'Pro. Activate only if already installed. Do not install from WordPress.org.',
            ],
            [
                'slug'             => 'blockish-dynamicity',
                'name'             => 'Blockish Dynamicity',
                'type'             => 'plugin',
                'install_from_org' => false,
                'note'             => 'Pro. Activate only if already installed. Do not install from WordPress.org.',
            ],
        ];
    }

    public static function handle(array $args): array
    {
        $action = isset($args['action']) ? (string) $args['action'] : '';

        if ('list' === $action) {
            return self::list_installed($args);
        }

        $mutating = ['install', 'activate', 'deactivate', 'switch', 'update'];
        if (! in_array($action, $mutating, true)) {
            return ['error' => 'Invalid action. Use list, install, activate, deactivate, switch, or update. There is no delete/uninstall action.'];
        }

        if (empty($args['confirm'])) {
            return [
                'status' => 'aborted',
                'error'  => 'confirm must be true. Ask the user in chat first, then retry with confirm:true.',
            ];
        }

        $type = isset($args['type']) ? (string) $args['type'] : '';
        if (! in_array($type, ['plugin', 'theme'], true)) {
            return ['error' => 'type must be "plugin" or "theme".'];
        }

        $slug = isset($args['slug']) ? strtolower(trim((string) $args['slug'])) : '';
        if ('' === $slug || ! preg_match(self::SLUG_PATTERN, $slug)) {
            return ['error' => 'slug must be the exact wordpress.org directory slug (lowercase letters, numbers, hyphens). Do not pass a URL, zip, or file path.'];
        }

        if ('plugin' === $type) {
            return self::handle_plugin($action, $slug);
        }

        return self::handle_theme($action, $slug);
    }

    /**
     * @param array<string, mixed> $args
     * @return array<string, mixed>
     */
    private static function list_installed(array $args): array
    {
        $type = isset($args['type']) ? (string) $args['type'] : '';

        $out = [
            'status'   => 'ok',
            'promoted' => self::promoted_catalog(),
        ];

        if ('' === $type || 'plugin' === $type) {
            $out['plugins'] = self::list_plugins();
        }
        if ('' === $type || 'theme' === $type) {
            $out['themes'] = self::list_themes();
        }

        return $out;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function list_plugins(): array
    {
        self::load_plugin_admin();
        $items = [];
        foreach (get_plugins() as $file => $data) {
            $items[] = [
                'slug'        => self::slug_from_plugin_file($file),
                'plugin_file' => $file,
                'name'        => $data['Name'] ?? '',
                'version'     => $data['Version'] ?? '',
                'active'      => is_plugin_active($file),
            ];
        }
        return $items;
    }

    /**
     * @return array<int, array<string, mixed>>
     */
    private static function list_themes(): array
    {
        $active = get_stylesheet();
        $items  = [];
        foreach (wp_get_themes() as $stylesheet => $theme) {
            $items[] = [
                'slug'       => $stylesheet,
                'stylesheet' => $stylesheet,
                'name'       => $theme->get('Name'),
                'version'    => $theme->get('Version'),
                'active'     => $stylesheet === $active,
            ];
        }
        return $items;
    }

    /**
     * @return array<string, mixed>
     */
    private static function handle_plugin(string $action, string $slug): array
    {
        self::load_plugin_admin();

        if ('switch' === $action) {
            return ['error' => 'Use action=activate for plugins. switch is for themes only.'];
        }

        $file = self::find_plugin_file($slug);

        if ('install' === $action) {
            return self::install_plugin($slug, $file);
        }
        if ('activate' === $action) {
            return self::activate_plugin_slug($slug, $file);
        }
        if ('deactivate' === $action) {
            return self::deactivate_plugin_slug($slug, $file);
        }
        if ('update' === $action) {
            return self::update_plugin_slug($slug, $file);
        }

        return ['error' => 'Invalid plugin action.'];
    }

    /**
     * @return array<string, mixed>
     */
    private static function handle_theme(string $action, string $slug): array
    {
        if ('activate' === $action) {
            return ['error' => 'Use action=switch for themes. activate is for plugins only.'];
        }
        if ('deactivate' === $action) {
            return ['error' => 'Themes cannot be deactivated. Use action=switch to change the active theme.'];
        }

        if ('install' === $action) {
            return self::install_theme($slug);
        }
        if ('switch' === $action) {
            return self::switch_theme_slug($slug);
        }
        if ('update' === $action) {
            return self::update_theme_slug($slug);
        }

        return ['error' => 'Invalid theme action.'];
    }

    /**
     * @return array<string, mixed>
     */
    private static function install_plugin(string $slug, ?string $file): array
    {
        if (in_array($slug, self::PRO_ACTIVATE_ONLY, true)) {
            if ($file) {
                return [
                    'status' => 'error',
                    'slug'   => $slug,
                    'error'  => self::promoted_name($slug) . ' is a Pro plugin and cannot be installed from WordPress.org. It is already on disk — use action=activate with confirm:true.',
                ];
            }
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => self::promoted_name($slug) . ' is a Pro plugin and cannot be installed from WordPress.org. Ask the user to install it from their Blockish account, then use action=activate.',
            ];
        }

        if (! current_user_can('install_plugins') || ! current_user_can('activate_plugins')) {
            return ['error' => 'Current user cannot install or activate plugins.'];
        }

        if ($file) {
            if (is_plugin_active($file)) {
                return self::plugin_payload($slug, $file, 'already_active', self::promoted_name($slug) . ' is already installed and active.');
            }
            return self::activate_plugin_slug($slug, $file);
        }

        $download = self::download_org_plugin($slug);
        if (! empty($download['error'])) {
            return array_merge(['status' => 'error', 'slug' => $slug], $download);
        }

        $file = $download['plugin_file'] ?? self::find_plugin_file($slug);
        if (! $file) {
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => 'Installed from WordPress.org but the plugin file could not be resolved.',
            ];
        }

        $activated = activate_plugin($file, '', false, false);
        if (is_wp_error($activated)) {
            return [
                'status'      => 'error',
                'slug'        => $slug,
                'plugin_file' => $file,
                'error'       => 'Installed but activation failed: ' . $activated->get_error_message(),
            ];
        }

        return self::plugin_payload($slug, $file, 'installed_and_activated', self::promoted_name($slug) . ' installed from WordPress.org and activated.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function activate_plugin_slug(string $slug, ?string $file): array
    {
        if (! current_user_can('activate_plugins')) {
            return ['error' => 'Current user cannot activate plugins.'];
        }

        if (! $file) {
            if (in_array($slug, self::PRO_ACTIVATE_ONLY, true)) {
                return [
                    'status' => 'error',
                    'slug'   => $slug,
                    'error'  => self::promoted_name($slug) . ' is not installed. It is Pro — the user must install it from their Blockish account first.',
                ];
            }
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => 'Plugin is not installed. Use action=install with the exact wordpress.org slug, after the user confirms in chat.',
            ];
        }

        if (is_plugin_active($file)) {
            return self::plugin_payload($slug, $file, 'already_active', self::promoted_name($slug) . ' is already active.');
        }

        $activated = activate_plugin($file, '', false, false);
        if (is_wp_error($activated)) {
            return [
                'status'      => 'error',
                'slug'        => $slug,
                'plugin_file' => $file,
                'error'       => $activated->get_error_message(),
            ];
        }

        return self::plugin_payload($slug, $file, 'activated', self::promoted_name($slug) . ' activated.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function deactivate_plugin_slug(string $slug, ?string $file): array
    {
        if (! current_user_can('activate_plugins')) {
            return ['error' => 'Current user cannot deactivate plugins.'];
        }

        if (self::is_protected_plugin($slug, $file)) {
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => 'Blockish core cannot be deactivated.',
            ];
        }

        if (! $file) {
            return ['error' => 'Plugin is not installed.'];
        }

        if (! is_plugin_active($file)) {
            return self::plugin_payload($slug, $file, 'already_inactive', self::promoted_name($slug) . ' is already inactive.');
        }

        deactivate_plugins($file, false, false);

        if (is_plugin_active($file)) {
            return [
                'status'      => 'error',
                'slug'        => $slug,
                'plugin_file' => $file,
                'error'       => 'Deactivate did not take effect.',
            ];
        }

        return self::plugin_payload($slug, $file, 'deactivated', self::promoted_name($slug) . ' deactivated.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function update_plugin_slug(string $slug, ?string $file): array
    {
        if (! current_user_can('update_plugins')) {
            return ['error' => 'Current user cannot update plugins.'];
        }

        if (! $file) {
            return ['error' => 'Plugin is not installed, so it cannot be updated.'];
        }

        if (in_array($slug, self::PRO_ACTIVATE_ONLY, true)) {
            wp_update_plugins();
            $current = get_site_transient('update_plugins');
            if (empty($current->response[$file])) {
                return [
                    'status' => 'error',
                    'slug'   => $slug,
                    'error'  => self::promoted_name($slug) . ' is Pro and has no WordPress.org update. Update it from wp-admin / the plugin\'s own updater.',
                ];
            }
        }

        wp_update_plugins();
        $current = get_site_transient('update_plugins');
        if (empty($current->response[$file])) {
            return self::plugin_payload($slug, $file, 'already_current', self::promoted_name($slug) . ' is already at the latest available version.');
        }

        self::load_upgrader();
        $skin     = new \WP_Ajax_Upgrader_Skin();
        $upgrader = new \Plugin_Upgrader($skin);
        $result   = $upgrader->upgrade($file);

        if (is_wp_error($result)) {
            return ['status' => 'error', 'slug' => $slug, 'error' => $result->get_error_message()];
        }

        $skin_error = $skin->get_errors();
        if (is_wp_error($skin_error) && $skin_error->has_errors()) {
            return ['status' => 'error', 'slug' => $slug, 'error' => $skin_error->get_error_message()];
        }

        $file = self::find_plugin_file($slug) ?: $file;
        return self::plugin_payload($slug, $file, 'updated', self::promoted_name($slug) . ' updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function install_theme(string $slug): array
    {
        if (! current_user_can('install_themes') || ! current_user_can('switch_themes')) {
            return ['error' => 'Current user cannot install or switch themes.'];
        }

        $theme = wp_get_theme($slug);
        if ($theme->exists()) {
            return self::switch_theme_slug($slug);
        }

        $download = self::download_org_theme($slug);
        if (! empty($download['error'])) {
            return array_merge(['status' => 'error', 'slug' => $slug, 'type' => 'theme'], $download);
        }

        return self::switch_theme_slug($slug);
    }

    /**
     * @return array<string, mixed>
     */
    private static function switch_theme_slug(string $slug): array
    {
        if (! current_user_can('switch_themes')) {
            return ['error' => 'Current user cannot switch themes.'];
        }

        $theme = wp_get_theme($slug);
        if (! $theme->exists()) {
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => 'Theme is not installed. Use action=install with the exact wordpress.org slug, after the user confirms in chat.',
            ];
        }

        if (get_stylesheet() === $slug) {
            return self::theme_payload($slug, 'already_active', $theme->get('Name') . ' is already the active theme.');
        }

        switch_theme($slug);

        if (get_stylesheet() !== $slug) {
            return [
                'status' => 'error',
                'slug'   => $slug,
                'error'  => 'Theme switch did not take effect.',
            ];
        }

        return self::theme_payload($slug, 'switched', $theme->get('Name') . ' is now the active theme.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function update_theme_slug(string $slug): array
    {
        if (! current_user_can('update_themes')) {
            return ['error' => 'Current user cannot update themes.'];
        }

        $theme = wp_get_theme($slug);
        if (! $theme->exists()) {
            return ['error' => 'Theme is not installed, so it cannot be updated.'];
        }

        wp_update_themes();
        $current = get_site_transient('update_themes');
        if (empty($current->response[$slug])) {
            return self::theme_payload($slug, 'already_current', $theme->get('Name') . ' is already at the latest available version.');
        }

        self::load_upgrader();
        $skin     = new \WP_Ajax_Upgrader_Skin();
        $upgrader = new \Theme_Upgrader($skin);
        $result   = $upgrader->upgrade($slug);

        if (is_wp_error($result)) {
            return ['status' => 'error', 'slug' => $slug, 'error' => $result->get_error_message()];
        }

        $skin_error = $skin->get_errors();
        if (is_wp_error($skin_error) && $skin_error->has_errors()) {
            return ['status' => 'error', 'slug' => $slug, 'error' => $skin_error->get_error_message()];
        }

        return self::theme_payload($slug, 'updated', $theme->get('Name') . ' updated.');
    }

    /**
     * @return array<string, mixed>
     */
    private static function download_org_plugin(string $slug): array
    {
        self::load_upgrader();
        require_once ABSPATH . 'wp-admin/includes/plugin-install.php';

        $api = plugins_api(
            'plugin_information',
            [
                'slug'   => $slug,
                'fields' => [
                    'sections' => false,
                    'icons'    => false,
                    'banners'  => false,
                ],
            ]
        );

        if (is_wp_error($api)) {
            return ['error' => 'Could not fetch plugin from WordPress.org: ' . $api->get_error_message() . self::slug_hint($slug)];
        }

        $api_slug = isset($api->slug) ? (string) $api->slug : '';
        if ($api_slug !== $slug) {
            return ['error' => 'WordPress.org slug mismatch. Requested `' . $slug . '`, API returned `' . $api_slug . '`.'];
        }

        $link = isset($api->download_link) ? (string) $api->download_link : '';
        $host_error = self::org_download_error($link);
        if ($host_error) {
            return ['error' => $host_error];
        }

        $skin     = new \WP_Ajax_Upgrader_Skin();
        $upgrader = new \Plugin_Upgrader($skin);
        $result   = $upgrader->install($link);

        if (is_wp_error($result)) {
            return ['error' => $result->get_error_message()];
        }

        $plugin_file = $upgrader->plugin_info();
        if (! $plugin_file) {
            $skin_error = $skin->get_errors();
            if (is_wp_error($skin_error) && $skin_error->has_errors()) {
                return ['error' => $skin_error->get_error_message()];
            }
            return ['error' => 'Plugin install failed for an unknown reason.'];
        }

        return ['plugin_file' => $plugin_file];
    }

    /**
     * @return array<string, mixed>
     */
    private static function download_org_theme(string $slug): array
    {
        self::load_upgrader();
        require_once ABSPATH . 'wp-admin/includes/theme.php';
        require_once ABSPATH . 'wp-admin/includes/theme-install.php';

        $api = themes_api(
            'theme_information',
            [
                'slug'   => $slug,
                'fields' => [
                    'sections' => false,
                    'ratings'  => false,
                ],
            ]
        );

        if (is_wp_error($api)) {
            return ['error' => 'Could not fetch theme from WordPress.org: ' . $api->get_error_message() . self::slug_hint($slug)];
        }

        $api_slug = isset($api->slug) ? (string) $api->slug : '';
        if ($api_slug !== $slug) {
            return ['error' => 'WordPress.org slug mismatch. Requested `' . $slug . '`, API returned `' . $api_slug . '`.'];
        }

        $link = isset($api->download_link) ? (string) $api->download_link : '';
        $host_error = self::org_download_error($link);
        if ($host_error) {
            return ['error' => $host_error];
        }

        $skin     = new \WP_Ajax_Upgrader_Skin();
        $upgrader = new \Theme_Upgrader($skin);
        $result   = $upgrader->install($link);

        if (is_wp_error($result)) {
            return ['error' => $result->get_error_message()];
        }

        $info = $upgrader->theme_info();
        if (! $info) {
            $skin_error = $skin->get_errors();
            if (is_wp_error($skin_error) && $skin_error->has_errors()) {
                return ['error' => $skin_error->get_error_message()];
            }
            return ['error' => 'Theme install failed for an unknown reason.'];
        }

        return ['stylesheet' => $info->get_stylesheet()];
    }

    private static function org_download_error(string $link): ?string
    {
        if ('' === $link) {
            return 'WordPress.org returned no download link.';
        }

        $host = wp_parse_url($link, PHP_URL_HOST);
        if (! is_string($host) || ! in_array(strtolower($host), self::ORG_DOWNLOAD_HOSTS, true)) {
            return 'Refusing download: host is not downloads.wordpress.org.';
        }

        $scheme = wp_parse_url($link, PHP_URL_SCHEME);
        if ('https' !== $scheme) {
            return 'Refusing download: link must be https.';
        }

        return null;
    }

    /**
     * @return array<string, mixed>
     */
    private static function plugin_payload(string $slug, string $file, string $status, string $message): array
    {
        self::load_plugin_admin();
        $plugins = get_plugins();
        $data    = $plugins[$file] ?? [];

        $payload = [
            'status'      => $status,
            'type'        => 'plugin',
            'slug'        => $slug,
            'plugin_file' => $file,
            'name'        => $data['Name'] ?? self::promoted_name($slug),
            'version'     => $data['Version'] ?? '',
            'active'      => is_plugin_active($file),
            'message'     => $message,
        ];

        return self::maybe_restart($payload, $slug, $status);
    }

    /**
     * @return array<string, mixed>
     */
    private static function theme_payload(string $slug, string $status, string $message): array
    {
        $theme = wp_get_theme($slug);

        return [
            'status'      => $status,
            'type'        => 'theme',
            'slug'        => $slug,
            'stylesheet'  => $slug,
            'name'        => $theme->exists() ? $theme->get('Name') : $slug,
            'version'     => $theme->exists() ? $theme->get('Version') : '',
            'active'      => get_stylesheet() === $slug,
            'message'     => $message,
        ];
    }

    /**
     * @param array<string, mixed> $payload
     * @return array<string, mixed>
     */
    private static function maybe_restart(array $payload, string $slug, string $status): array
    {
        $shift_statuses = ['installed_and_activated', 'activated', 'updated'];
        if (! in_array($slug, self::ABILITY_SHIFT_SLUGS, true) || ! in_array($status, $shift_statuses, true)) {
            return $payload;
        }

        $payload['restart_required'] = true;
        $payload['restart_message']  = self::RESTART_MESSAGE;
        $payload['next_steps']       = array_merge(
            [
                'Tell the user to fully restart the AI software they are using (Cursor, Claude Desktop, ChatGPT, etc.) or reconnect/reload the Blockish MCP server. New abilities will not appear until they do.',
            ],
            self::ability_shift_next_steps($slug)
        );

        return $payload;
    }

    /**
     * @return array<int, string>
     */
    private static function ability_shift_next_steps(string $slug): array
    {
        if ('advanced-custom-fields' === $slug) {
            return [
                'After restart, use native acf/* tools for post types, taxonomies, and field groups. Skip ACF Options pages.',
            ];
        }
        if ('woocommerce' === $slug) {
            return [
                'After restart, WooCommerce MCP tools (woocommerce-*) will be available on this server if WooCommerce registered them.',
            ];
        }
        if ('blockish-forms' === $slug) {
            return [
                'After restart, use blockish-forms tools. Never put field blocks on a page — create a blockish_form post and embed blockish-forms/form.',
            ];
        }
        if ('blockish-dynamicity' === $slug) {
            return [
                'After restart, use blockish-dynamicity/query-builder + loop (not core/query) and get-meta-list for bindings.',
            ];
        }
        return [];
    }

    private static function is_protected_plugin(string $slug, ?string $file): bool
    {
        if (in_array($slug, self::PROTECTED_PLUGIN_SLUGS, true)) {
            return true;
        }

        if ($file && defined('BLOCKISH_DIR')) {
            $core = plugin_basename(BLOCKISH_DIR . 'blockish.php');
            if ($file === $core) {
                return true;
            }
        }

        return false;
    }

    private static function find_plugin_file(string $slug): ?string
    {
        self::load_plugin_admin();
        $plugins = get_plugins();

        $single = $slug . '.php';
        if (isset($plugins[$single])) {
            return $single;
        }

        $prefix = $slug . '/';
        foreach ($plugins as $file => $data) {
            if (0 === strpos($file, $prefix)) {
                return $file;
            }
        }

        return null;
    }

    private static function slug_from_plugin_file(string $file): string
    {
        $dir = dirname($file);
        if ('.' === $dir) {
            return basename($file, '.php');
        }
        return $dir;
    }

    private static function promoted_name(string $slug): string
    {
        foreach (self::promoted_catalog() as $item) {
            if ($item['slug'] === $slug) {
                return $item['name'];
            }
        }
        return $slug;
    }

    private static function slug_hint(string $slug): string
    {
        $promoted = [];
        foreach (self::promoted_catalog() as $item) {
            $promoted[] = $item['slug'];
        }

        $hints = [
            'acf'              => 'advanced-custom-fields',
            'advanced-custom-field' => 'advanced-custom-fields',
            'woo'              => 'woocommerce',
            'woo-commerce'     => 'woocommerce',
            'forms'            => 'blockish-forms',
            'blockish-form'    => 'blockish-forms',
            'dynamicity'       => 'blockish-dynamicity',
        ];

        if (isset($hints[$slug])) {
            return ' Did you mean `' . $hints[$slug] . '`? Promoted slugs: ' . implode(', ', $promoted) . '.';
        }

        return ' Promoted slugs: ' . implode(', ', $promoted) . '.';
    }

    private static function load_plugin_admin(): void
    {
        if (! function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
    }

    private static function load_upgrader(): void
    {
        require_once ABSPATH . 'wp-admin/includes/file.php';
        require_once ABSPATH . 'wp-admin/includes/misc.php';
        require_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }
}
