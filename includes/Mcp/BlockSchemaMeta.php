<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

/**
 * Registers the post meta used to stage an AI-generated block schema
 * against a post before it is reviewed and applied in the editor.
 */
class BlockSchemaMeta
{
    use \Blockish\Traits\SingletonTrait;

    const META_KEY = '_blockish_block_schema';

    private function __construct()
    {
        add_action('init', [$this, 'register_meta']);
    }

    public function register_meta()
    {
        register_post_meta(
            '', // Empty post type = registered for every post type.
            self::META_KEY,
            [
                'type'              => 'string',
                'single'            => true,
                'default'           => '',
                'show_in_rest'      => true,
                'sanitize_callback' => [self::class, 'sanitize'],
                'auth_callback'     => function ($allowed, $meta_key, $post_id) {
                    return current_user_can('edit_post', $post_id);
                },
            ]
        );
    }

    /**
     * Stores the schema as-is when it is valid JSON, otherwise clears it.
     * Avoids generic string sanitizers (e.g. sanitize_text_field) mangling
     * whitespace/characters inside the JSON payload.
     *
     * @param mixed $value
     * @return string
     */
    public static function sanitize($value)
    {
        if (!is_string($value) || '' === trim($value)) {
            return '';
        }

        $decoded = json_decode($value, true);

        if (JSON_ERROR_NONE !== json_last_error() || !is_array($decoded)) {
            return '';
        }

        $decoded = self::force_required_attributes($decoded);

        return wp_json_encode($decoded);
    }

    /**
     * Recursively forces non-obvious required attributes that default to false.
     * e.g., isVariationPicked on blockish/container, hasStarted on blockish/navigation.
     */
    public static function force_required_attributes(array $blocks): array
    {
        foreach ($blocks as &$block) {
            if (isset($block['name'])) {
                if ($block['name'] === 'blockish/container') {
                    if (!isset($block['attributes']) || !is_array($block['attributes'])) {
                        $block['attributes'] = [];
                    }
                    $block['attributes']['isVariationPicked'] = true;
                } elseif ($block['name'] === 'blockish/navigation') {
                    if (!isset($block['attributes']) || !is_array($block['attributes'])) {
                        $block['attributes'] = [];
                    }
                    $block['attributes']['hasStarted'] = true;
                }
            }

            if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
                $block['innerBlocks'] = self::force_required_attributes($block['innerBlocks']);
            }
        }
        return $blocks;
    }
}
