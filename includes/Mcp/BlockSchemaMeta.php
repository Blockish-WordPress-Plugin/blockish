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

        json_decode($value);

        return JSON_ERROR_NONE === json_last_error() ? $value : '';
    }
}
