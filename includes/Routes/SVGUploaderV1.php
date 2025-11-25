<?php

namespace Blockish\Routes;

use WP_REST_Controller;
use WP_REST_Request;

if (!defined('ABSPATH')) exit;

class SVGUploaderV1 extends WP_REST_Controller
{

    use \Blockish\Traits\SingletonTrait;

    const OPTION_KEY = 'blockish_upload_svg_icons';

    private function __construct()
    {
        $this->namespace = 'blockish/v1';
        $this->rest_base = 'custom-svg-icons';
        add_action('rest_api_init', [$this, 'register_routes']);
    }

    /**
     * Register Routes
     */
    public function register_routes()
    {
        // CREATE
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => 'POST',
                'callback'            => [$this, 'create_icon'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);

        // UPDATE
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<slug>[a-zA-Z0-9-_]+)', [
            [
                'methods'             => 'POST', // PUT + files is messy — use POST override
                'callback'            => [$this, 'update_icon'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);

        // DELETE
        register_rest_route($this->namespace, '/' . $this->rest_base . '/(?P<slug>[a-zA-Z0-9-_]+)', [
            [
                'methods'             => 'DELETE',
                'callback'            => [$this, 'delete_icon'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);

        // LIST
        register_rest_route($this->namespace, '/' . $this->rest_base, [
            [
                'methods'             => 'GET',
                'callback'            => [$this, 'get_icons'],
                'permission_callback' => [$this, 'permissions_check'],
            ]
        ]);
    }

    /**
     * Permissions
     */
    public function permissions_check()
    {
        return current_user_can('manage_options');
    }

    /**
     * GET all icons
     */
    public function get_icons()
    {
        return rest_ensure_response(get_option(self::OPTION_KEY, []));
    }

    /**
     * Generate label from file name
     */
    private function create_label_from_name($name)
    {
        $name = preg_replace('/\.svg$/i', '', $name);
        $name = str_replace(['-', '_'], ' ', $name);
        return ucwords(trim($name));
    }

    /**
     * CREATE Icon
     */
    public function create_icon(WP_REST_Request $request)
    {

        if (empty($_FILES['file'])) {
            return new \WP_Error('no_file', 'SVG file is required.', ['status' => 400]);
        }

        $svg = $this->sanitize_svg_file($_FILES['file']);
    
        if (is_wp_error($svg)) {
            return $svg;
        }

        $file_name = sanitize_file_name($_FILES['file']['name']);
        $label     = $this->create_label_from_name($file_name);
        $slug      = sanitize_title($label);

        $icons = get_option(self::OPTION_KEY, []);

        $icons[$slug] = [
            'label'    => $label,
            'category' => 'custom',
            'terms'    => [$slug, $label, $file_name],
            'icon'     => [
                'viewBox' => 'custom',
                'path' => $icons[$slug]['icon']['path'] ?? wp_generate_uuid4(),
                'svg'     => $svg
            ],
        ];

        update_option(self::OPTION_KEY, $icons);

        return [
            'message' => 'Icon created successfully.',
            'slug'    => $slug,
            'data'    => $icons[$slug]
        ];
    }

    /**
     * UPDATE Icon
     */
    public function update_icon(WP_REST_Request $request)
    {

        $slug  = sanitize_key($request->get_param('slug'));
        $icons = get_option(self::OPTION_KEY, []);

        if (!isset($icons[$slug])) {
            return new \WP_Error('not_found', 'Icon not found.', ['status' => 404]);
        }

        // optional file upload
        if (!empty($_FILES['file'])) {
            $svg = $this->sanitize_svg_file($_FILES['file']);
            if (is_wp_error($svg)) {
                return $svg;
            }
            $icons[$slug]['icon'] = [
                'viewBox' => $icons[$slug]['icon']['viewBox'],
                'path'    => $icons[$slug]['icon']['path'],
                'svg' => $svg
            ];
        }

        // optional updates
        if ($request->get_param('label')) {
            $icons[$slug]['label'] = sanitize_text_field($request->get_param('label'));
        }

        if ($request->get_param('category')) {
            $icons[$slug]['category'] = sanitize_text_field($request->get_param('category'));
        }

        if ($request->get_param('terms')) {
            $terms = $request->get_param('terms');
            $icons[$slug]['terms'] = is_array($terms)
                ? array_map('sanitize_text_field', $terms)
                : [];
        }

        update_option(self::OPTION_KEY, $icons);

        return [
            'message' => 'Icon updated successfully.',
            'slug'    => $slug,
            'data'    => $icons[$slug]
        ];
    }

    /**
     * DELETE
     */
    public function delete_icon(WP_REST_Request $request)
    {
        $slug  = sanitize_key($request->get_param('slug'));
        $icons = get_option(self::OPTION_KEY, []);

        if (!isset($icons[$slug])) {
            return new \WP_Error('not_found', 'Icon not found.', ['status' => 404]);
        }

        unset($icons[$slug]);
        update_option(self::OPTION_KEY, $icons);

        return [
            'message' => 'Icon deleted successfully.',
            'slug'    => $slug
        ];
    }

    /**
     * SVG Sanitization using restricted wp_kses
     */
    private function sanitize_svg_file($file)
    {
        if ($file['type'] !== 'image/svg+xml') {
            return new \WP_Error('invalid_type', 'Only SVG files are allowed.', ['status' => 400]);
        }

        $svg_content = file_get_contents($file['tmp_name']);
        if (!$svg_content) {
            return new \WP_Error('read_error', 'Unable to read uploaded SVG.', ['status' => 400]);
        }

        // Strip comments
        $svg_content = preg_replace('/<!--.*?-->/s', '', $svg_content);

        // Allowed SVG elements
        $allowed_tags = [
            'svg'     => ['xmlns' => true, 'width' => true, 'height' => true, 'viewBox' => true, 'viewbox' => true, 'fill' => true, 'class' => true, 'aria-hidden' => true, 'aria-labelledby' => true, 'role' => true, 'preserveaspectratio' => true, 'version' => true, 'id' => true],
            'defs'    => [],
            'style'   => [],
            'linearGradient' => ['id' => true, 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientUnits' => true, 'gradientTransform' => true, 'spreadMethod' => true, 'offset' => true],
            'radialGradient' => ['id' => true, 'cx' => true, 'cy' => true, 'r' => true, 'fx' => true, 'fy' => true, 'gradientUnits' => true, 'gradientTransform' => true, 'spreadMethod' => true, 'offset' => true],
            'lineargradient' => ['id' => true, 'x1' => true, 'y1' => true, 'x2' => true, 'y2' => true, 'gradientUnits' => true, 'gradientTransform' => true, 'spreadMethod' => true, 'offset' => true],
            'radialgradient' => ['id' => true, 'cx' => true, 'cy' => true, 'r' => true, 'fx' => true, 'fy' => true, 'gradientUnits' => true, 'gradientTransform' => true, 'spreadMethod' => true, 'offset' => true],
            'stop'    => ['offset' => true, 'stop-color' => true, 'stop-opacity' => true],
            'path'    => ['d' => true, 'fill' => true, 'class' => true, 'id' => true, 'stroke' => true, 'stroke-width' => true],
            'g'       => ['fill' => true],
            'rect'    => ['x' => true, 'y' => true, 'width' => true, 'height' => true],
            'circle'  => ['cx' => true, 'cy' => true, 'r' => true],
            'polygon' => ['points' => true],
            'line'    => ['x1' => true, 'y1' => true, 'x2' => true, 'y2' => true],
        ];

        return wp_kses($svg_content, $allowed_tags);
    }
}
