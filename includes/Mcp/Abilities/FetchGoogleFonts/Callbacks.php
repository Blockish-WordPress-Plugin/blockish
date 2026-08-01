<?php

namespace Blockish\Mcp\Abilities\FetchGoogleFonts;

defined('ABSPATH') || exit;

class Callbacks
{
    const API_URL = 'https://s.w.org/images/fonts/wp-6.5/collections/google-fonts-with-preview.json';
    const TRANSIENT_KEY = 'blockish_google_fonts_collection';

    public static function fetch_font(array $args): array
    {
        if (empty($args['name'])) {
            throw new \Exception('Font name is required.');
        }

        $search_name = strtolower(trim($args['name']));
        $requested_variants = $args['variants'] ?? [];

        $data = get_transient(self::TRANSIENT_KEY);

        if (false === $data) {
            $response = wp_remote_get(self::API_URL);
            if (is_wp_error($response)) {
                throw new \Exception('Failed to fetch Google Fonts collection: ' . $response->get_error_message());
            }

            $body = wp_remote_retrieve_body($response);
            $data = json_decode($body, true);

            if (empty($data) || empty($data['font_families'])) {
                throw new \Exception('Invalid response from Google Fonts collection API.');
            }

            // Cache for 24 hours
            set_transient(self::TRANSIENT_KEY, $data, 24 * HOUR_IN_SECONDS);
        }

        $found_family = null;

        foreach ($data['font_families'] as $family_node) {
            $family = $family_node['font_family_settings'] ?? $family_node;
            if (isset($family['name']) && strtolower($family['name']) === $search_name) {
                $found_family = $family;
                break;
            }
        }

        if (!$found_family) {
            throw new \Exception(sprintf('Font "%s" not found in the WordPress Google Fonts collection.', $args['name']));
        }

        // Filter font faces if variants are provided
        if (!empty($requested_variants)) {
            $filtered_faces = [];
            foreach ($found_family['fontFace'] as $face) {
                if (in_array($face['fontWeight'], $requested_variants)) {
                    $filtered_faces[] = $face;
                }
            }
            if (empty($filtered_faces)) {
                throw new \Exception(sprintf('Font "%s" does not have the requested variants (%s).', $args['name'], implode(', ', $requested_variants)));
            }
            $found_family['fontFace'] = $filtered_faces;
        }

        // Remove preview URLs before sending to install to keep payload clean
        $clean_faces = [];
        foreach ($found_family['fontFace'] as $face) {
            unset($face['preview']);
            // Convert src from string to array if it is not already, for backwards compatibility
            // WP JSON usually returns src as string, but manage-fonts accepts string or array
            $clean_faces[] = $face;
        }

        return [
            'actions' => ['install', 'activate'],
            'name' => $found_family['name'],
            'slug' => $found_family['slug'],
            'fontFamily' => $found_family['fontFamily'],
            'fontFace' => $clean_faces
        ];
    }
}
