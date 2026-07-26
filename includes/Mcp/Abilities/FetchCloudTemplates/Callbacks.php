<?php

namespace Blockish\Mcp\Abilities\FetchCloudTemplates;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function fetch(array $args): array
    {
        $endpoint = BLOCKISH_TEMPLATE_LIBRARY_URL . '/designs';
        
        $query_args = [
            'token' => BLOCKISH_TEMPLATE_LIBRARY_TOKEN
        ];

        if (!empty($args['type'])) {
            $query_args['type'] = sanitize_text_field($args['type']);
        }

        if (!empty($args['keywords']) && is_array($args['keywords'])) {
            $taxonomies = self::get_cloud_taxonomies();
            $search_terms = [];

            foreach ($args['keywords'] as $keyword) {
                $slug = sanitize_title($keyword);
                
                if (in_array($slug, $taxonomies['categories'], true)) {
                    $query_args['category'] = $slug;
                } elseif (in_array($slug, $taxonomies['tags'], true)) {
                    $query_args['tag'] = $slug;
                } else {
                    $search_terms[] = sanitize_text_field($keyword);
                }
            }

            if (!empty($search_terms)) {
                $query_args['search'] = implode(' ', $search_terms);
            }
        }
        if (!empty($args['posts_per_page'])) {
            $query_args['posts_per_page'] = absint($args['posts_per_page']);
        }
        if (!empty($args['paged'])) {
            $query_args['paged'] = absint($args['paged']);
        }

        $url = add_query_arg($query_args, $endpoint);

        $response = wp_remote_get($url, [
            'timeout' => 30,
            'sslverify' => false,
            'headers' => [
                'Accept' => 'application/json'
            ]
        ]);

        if (is_wp_error($response)) {
            return ['error' => 'Failed to connect to the Blockish Template Library: ' . $response->get_error_message()];
        }

        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);

        if ($status_code !== 200) {
            return ['error' => 'API returned an error. Status Code: ' . $status_code . '. Response: ' . $body];
        }

        $data = json_decode($body, true);

        if (empty($data) || !is_array($data)) {
            return ['error' => 'Invalid JSON response from the Template Library.'];
        }

        $designs = $data['designs'] ?? [];
        
        if (!function_exists('is_plugin_active') || !function_exists('get_plugins')) {
            require_once ABSPATH . 'wp-admin/includes/plugin.php';
        }
        $installed_plugins = get_plugins();

        $filtered_designs = [];

        foreach ($designs as $design) {
            $package_name = $design['package_name'] ?? '';
            $is_installed = false;

            if (empty($package_name)) {
                // If there's no package name, assume it's allowed
                $is_installed = true;
            } else {
                $package_slug = strtolower(sanitize_title($package_name));
                foreach ($installed_plugins as $path => $plugin_data) {
                    // Check if package matches plugin Name or directory slug
                    if (strcasecmp($plugin_data['Name'], $package_name) === 0 || strpos($path, $package_slug . '/') === 0) {
                        if (is_plugin_active($path)) {
                            $is_installed = true;
                            break;
                        }
                    }
                }
            }

            if ($is_installed) {
                // Enrich with dependencies from single-design endpoint when missing.
                if (empty($design['dependencies']) && !empty($design['id'])) {
                    $design = self::fetch_design_with_dependencies((int) $design['id']) ?: $design;
                }

                if (!empty($design['content'])) {
                    $parsed_blocks = parse_blocks($design['content']);
                    $design['schema'] = \Blockish\Mcp\SchemaUtils::convert_to_js_schema($parsed_blocks);
                } else {
                    $design['schema'] = [];
                }

                if (!empty($design['dependencies']['patterns']) && is_array($design['dependencies']['patterns'])) {
                    foreach ($design['dependencies']['patterns'] as &$pattern) {
                        if (!empty($pattern['content'])) {
                            $pattern['schema'] = \Blockish\Mcp\SchemaUtils::convert_to_js_schema(
                                parse_blocks($pattern['content'])
                            );
                        }
                    }
                    unset($pattern);
                }

                if (!empty($design['dependencies']['forms']) && is_array($design['dependencies']['forms'])) {
                    foreach ($design['dependencies']['forms'] as &$form) {
                        if (!empty($form['content'])) {
                            $form['schema'] = \Blockish\Mcp\SchemaUtils::convert_to_js_schema(
                                parse_blocks($form['content'])
                            );
                        }
                    }
                    unset($form);
                }

                // Keep content + dependencies so the agent can recreate entities and remap IDs
                // before applying schema. Do not unset content.
                $filtered_designs[] = $design;
            }
        }

        return [
            'total_pages'  => $data['total_pages'] ?? 1,
            'current_page' => $data['current_page'] ?? 1,
            'designs'      => $filtered_designs,
            'note'         => 'Each design may include dependencies.patterns / dependencies.forms with cloud ids + content/schema. Create local wp_block / blockish_form entities, remap ref/formId from cloud→local, then use the remapped schema. Prefer edit_url staging — do not assume cloud refs work on this site.',
        ];
    }

    /**
     * Fetch one design with dependency bundle.
     *
     * @param int $design_id Cloud design ID.
     * @return array|null
     */
    private static function fetch_design_with_dependencies(int $design_id): ?array
    {
        $url = BLOCKISH_TEMPLATE_LIBRARY_URL . '/designs/' . $design_id;
        $url = add_query_arg('token', BLOCKISH_TEMPLATE_LIBRARY_TOKEN, $url);

        $response = wp_remote_get($url, [
            'timeout'   => 30,
            'sslverify' => false,
            'headers'   => ['Accept' => 'application/json'],
        ]);

        if (is_wp_error($response) || 200 !== wp_remote_retrieve_response_code($response)) {
            return null;
        }

        $data = json_decode(wp_remote_retrieve_body($response), true);
        return is_array($data) ? $data : null;
    }

    private static function get_cloud_taxonomies(): array
    {
        $cached = get_transient('blockish_cloud_taxonomies');
        if ($cached !== false) {
            return $cached;
        }

        $taxonomies = [
            'categories' => [],
            'tags'       => [],
        ];

        $endpoints = [
            'categories' => '/categories',
            'tags'       => '/tags',
        ];

        foreach ($endpoints as $key => $path) {
            $url = BLOCKISH_TEMPLATE_LIBRARY_URL . $path;
            $url = add_query_arg('token', BLOCKISH_TEMPLATE_LIBRARY_TOKEN, $url);
            
            $response = wp_remote_get($url, [
                'timeout'   => 15,
                'sslverify' => false,
                'headers'   => ['Accept' => 'application/json']
            ]);

            if (!is_wp_error($response) && wp_remote_retrieve_response_code($response) === 200) {
                $body = wp_remote_retrieve_body($response);
                $data = json_decode($body, true);
                if (isset($data['success']) && $data['success'] && !empty($data['data'])) {
                    // Collect slugs from the API response
                    foreach ($data['data'] as $term) {
                        if (!empty($term['slug'])) {
                            $taxonomies[$key][] = $term['slug'];
                        }
                    }
                } elseif (is_array($data)) {
                    foreach ($data as $term) {
                        if (!empty($term['slug'])) {
                            $taxonomies[$key][] = $term['slug'];
                        }
                    }
                }
            }
        }

        set_transient('blockish_cloud_taxonomies', $taxonomies, HOUR_IN_SECONDS);
        return $taxonomies;
    }
}
