<?php

namespace Blockish\Endpoints;

use Blockish\Core\Utilities;
use WP_REST_Server;
use WP_REST_Request;
use WP_Error;

defined('ABSPATH') || exit;

class FontCollections
{
    use \Blockish\Traits\SingletonTrait;

    private const BLOCKISH_GOOGLE_FONTS_URL = 'https://s.w.org/images/fonts/wp-6.7/collections/google-fonts-with-preview.json';
    private const TRANSIENT_KEY = 'blockish_google_fonts';
    private const TRANSIENT_EXPIRATION = DAY_IN_SECONDS;

    private function __construct()
    {
        add_action('rest_api_init', [$this, 'register_endpoints']);
    }

    public function register_endpoints()
    {
        register_rest_route(
            'blockish/v1',
            '/fonts/',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_fonts'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => [
                    'per_page' => [
                        'required'          => false,
                        'default'           => 10,
                        'sanitize_callback' => 'absint',
                    ],
                    'page'     => [
                        'required'          => false,
                        'default'           => 1,
                        'sanitize_callback' => 'absint',
                    ],
                    'category' => [
                        'required'          => false,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                    'search'   => [
                        'required'          => false,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ]
        );

        register_rest_route(
            'blockish/v1',
            '/fonts/(?P<id>[^/]+)',
            [
                'methods'             => WP_REST_Server::READABLE,
                'callback'            => [$this, 'get_font_by_slug'],
                'permission_callback' => function () {
                    return current_user_can('manage_options');
                },
                'args'                => [
                    'id' => [
                        'required'          => true,
                        'sanitize_callback' => 'sanitize_text_field',
                    ],
                ],
            ]
        );
    }

    public function get_fonts(WP_REST_Request $request)
    {
        if (wp_is_block_theme()) {
            return rest_ensure_response([]);
        }

        $per_page = $request->get_param('per_page');
        $page = $request->get_param('page');
        $category = $request->get_param('category');
        $search = $request->get_param('search');

        $fonts = $this->fetch_fonts();
        if (is_wp_error($fonts)) {
            return $fonts;
        }

        $filtered_fonts = $this->filter_fonts($fonts, $category, $search);
        return rest_ensure_response($this->paginate_fonts($filtered_fonts, $page, $per_page));
    }

    private function binary_search_fonts($fonts, $target)
    {
        $low = 0;
        $high = count($fonts) - 1;

        while ($low <= $high) {
            $mid = (int) floor(($low + $high) / 2);
            $mid_slug = $fonts[$mid]['font_family_settings']['slug'] ?? '';

            if ($mid_slug === $target) {
                return $fonts[$mid]; // Found
            } elseif ($mid_slug < $target) {
                $low = $mid + 1; // Search right half
            } else {
                $high = $mid - 1; // Search left half
            }
        }

        return null; // Not found
    }

    public function get_font_by_slug(WP_REST_Request $request)
    {
        if (wp_is_block_theme()) {
            return rest_ensure_response([]);
        }

        $id = $request->get_param('id');

        if (!$id) {
            return new WP_Error('invalid_id', __('Invalid font ID.', 'blockish'), ['status' => 400]);
        }

        $fonts = $this->fetch_fonts();
        if (is_wp_error($fonts)) {
            return $fonts;
        }

        // Apply binary search
        $font = $this->binary_search_fonts($fonts, $id);

        if ($font !== null) {
            return rest_ensure_response($font);
        }

        return new WP_Error('not_found', __('Font not found.', 'blockish'), ['status' => 404]);
    }



    private function fetch_fonts()
    {
        $cached_fonts = get_transient(self::TRANSIENT_KEY);
        if ($cached_fonts) {
            $data = json_decode($cached_fonts, true);
            return $this->validate_font_data($data) ? $data['font_families'] : new WP_Error(
                'invalid_data',
                __('Invalid cached font data.', 'blockish'),
                ['status' => 500]
            );
        }

        $response = wp_remote_get(self::BLOCKISH_GOOGLE_FONTS_URL);
        if (is_wp_error($response)) {
            return $this->fetch_fonts_from_local();
        }

        $body = wp_remote_retrieve_body($response);
        $data = json_decode($body, true);
        if (!$this->validate_font_data($data)) {
            return $this->fetch_fonts_from_local();
        }

        set_transient(self::TRANSIENT_KEY, $body, self::TRANSIENT_EXPIRATION);
        return $data['font_families'];
    }

    private function fetch_fonts_from_local()
    {
        Utilities::get_filesystem();
        global $wp_filesystem;

        $fonts_metadata_path = BLOCKISH_DIR . '/assets/fonts/google-fonts.json';
        if (!$wp_filesystem || !$wp_filesystem->exists($fonts_metadata_path)) {
            return new WP_Error(
                'file_not_found',
                __('Font metadata file not found.', 'blockish'),
                ['status' => 500]
            );
        }

        $metadata = $wp_filesystem->get_contents($fonts_metadata_path);
        $decoded_metadata = json_decode($metadata, true);

        return !empty($decoded_metadata) ? $decoded_metadata : new WP_Error(
            'invalid_data',
            __('Invalid font data received.', 'blockish'),
            ['status' => 500]
        );
    }

    private function validate_font_data($data)
    {
        return is_array($data) && isset($data['font_families']) && is_array($data['font_families']);
    }

    private function filter_fonts(array $fonts, ?string $category, ?string $search): array
    {
        $search = is_string($search) ? trim($search) : '';
        $hasSearch = $search !== '';
        $searchLower = $hasSearch ? strtolower($search) : '';

        return array_filter($fonts, function ($font) use ($category, $hasSearch, $searchLower) {
            // Validate font structure
            if (!is_array($font) || !isset($font['categories'], $font['font_family_settings'])) {
                return false;
            }

            // Category matching
            $matchesCategory = true;
            if ($category) {
                $matchesCategory = in_array($category, $font['categories'], true);
            }

            // Early return if category doesn't match
            if (!$matchesCategory) {
                return false;
            }

            // Search matching
            if (!$hasSearch) {
                return true;
            }

            // Get searchable fields with fallbacks
            $fontFamily = strtolower($font['font_family_settings']['fontFamily'] ?? '');
            $fontName = strtolower($font['font_family_settings']['name'] ?? '');

            return str_contains($fontFamily, $searchLower) || str_contains($fontName, $searchLower);
        });
    }

    private function paginate_fonts($fonts, $page, $per_page)
    {
        $offset      = ($page - 1) * $per_page;
        $paged_fonts = array_slice($fonts, $offset, $per_page);

        return [
            'fonts'        => $paged_fonts,
            'total'        => count($fonts),
            'total_pages'  => ceil(count($fonts) / $per_page),
            'per_page'     => $per_page,
            'current_page' => $page,
        ];
    }
}
