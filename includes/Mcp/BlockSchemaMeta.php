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
                } elseif ($block['name'] === 'core/block') {
                    // WP core/block `content` must be an overrides object or omitted.
                    // Agents often send content:"" which triggers foreach() warnings in
                    // wp-includes/blocks/block.php during front-end render.
                    if (isset($block['attributes']) && is_array($block['attributes'])) {
                        if (array_key_exists('content', $block['attributes']) && !is_array($block['attributes']['content'])) {
                            unset($block['attributes']['content']);
                        }
                    }
                }
            }

            if (!empty($block['innerBlocks']) && is_array($block['innerBlocks'])) {
                $block['innerBlocks'] = self::force_required_attributes($block['innerBlocks']);
            }
        }
        return $blocks;
    }

    /**
     * Metrics for a block_schema tree (depth, node count, encoded size).
     *
     * @param array $blocks
     * @return array{max_depth:int,node_count:int,json_bytes:int,top_level_count:int,ref_heavy:bool}
     */
    public static function get_schema_metrics(array $blocks): array
    {
        $node_count = 0;
        $max_depth  = 0;

        $walk = function ($nodes, $depth) use (&$walk, &$node_count, &$max_depth) {
            if (!is_array($nodes)) {
                return;
            }
            foreach ($nodes as $node) {
                if (!is_array($node)) {
                    continue;
                }
                $node_count++;
                if ($depth > $max_depth) {
                    $max_depth = $depth;
                }
                if (!empty($node['innerBlocks']) && is_array($node['innerBlocks'])) {
                    $walk($node['innerBlocks'], $depth + 1);
                }
            }
        };

        $walk($blocks, 1);

        $encoded = wp_json_encode($blocks);
        $json_bytes = false === $encoded ? 0 : strlen($encoded);

        $top_level = count($blocks);
        $ref_like  = 0;
        foreach ($blocks as $block) {
            if (!is_array($block) || empty($block['name'])) {
                continue;
            }
            if (in_array($block['name'], ['core/block', 'core/template-part'], true)) {
                $ref_like++;
            }
        }
        $ref_heavy = $top_level > 0 && ($ref_like / $top_level) >= 0.6;

        return [
            'max_depth'       => $max_depth,
            'node_count'      => $node_count,
            'json_bytes'      => $json_bytes,
            'top_level_count' => $top_level,
            'ref_heavy'       => $ref_heavy,
        ];
    }

    /**
     * Reject monolithic page/template schemas with an actionable pattern-first error.
     * Patterns allow deeper nesting (one section); pages/templates must stay ref-light.
     *
     * @param array  $blocks
     * @param string $context 'page'|'template'|'pattern'
     * @return string|null Error message, or null when OK.
     */
    public static function get_monolithic_schema_error(array $blocks, string $context = 'page'): ?string
    {
        if (empty($blocks)) {
            return null;
        }

        $m = self::get_schema_metrics($blocks);

        // Absolute transport ceiling for every context.
        if ($m['json_bytes'] > 500000) {
            return sprintf(
                'Schema too large (%d bytes). Write it to a scratch JSON file and pass schema_file, or split into smaller patterns via blockish/manage-pattern. Then assemble with {"name":"core/block","attributes":{"ref":<pattern_id>}}. See blockish/get-designer-workflow step 7–8.',
                $m['json_bytes']
            );
        }

        if ('pattern' === $context) {
            // One section can nest; only reject extreme trees.
            if ($m['node_count'] > 250 || $m['max_depth'] > 12) {
                return sprintf(
                    'Pattern schema is too heavy (nodes=%d, depth=%d). Split this section into smaller patterns, or simplify nested containers. Prefer schema_file for large payloads. See blockish/get-designer-workflow step 7.',
                    $m['node_count'],
                    $m['max_depth']
                );
            }
            return null;
        }

        // Page / template assembly: allow ref-based layouts; reject monolithic trees.
        if ($m['ref_heavy']) {
            return null;
        }

        if ($m['max_depth'] >= 6 || $m['node_count'] >= 80 || $m['json_bytes'] >= 100000) {
            return sprintf(
                'Schema too large or too deeply nested for a full page/template (nodes=%d, depth=%d, bytes=%d). Do NOT send a monolithic layout. Build each section with blockish/manage-pattern, then assemble a lightweight schema of {"name":"core/block","attributes":{"ref":<pattern_id>}} (plus core/template-part for header/footer). See blockish/get-designer-workflow step 7–8.',
                $m['node_count'],
                $m['max_depth'],
                $m['json_bytes']
            );
        }

        return null;
    }

    /**
     * Soft agent warnings (non-blocking) for common schema mistakes.
     *
     * @param array $blocks
     * @return string[]
     */
    public static function get_schema_warnings(array $blocks): array
    {
        $warnings = [];

        $walk = function ($nodes) use (&$walk, &$warnings) {
            if (!is_array($nodes)) {
                return;
            }
            foreach ($nodes as $node) {
                if (!is_array($node) || empty($node['name'])) {
                    continue;
                }

                if ('blockish/button' === $node['name']) {
                    $attrs = isset($node['attributes']) && is_array($node['attributes']) ? $node['attributes'] : [];
                    $has_button_border = !empty($attrs['buttonBorder']);
                    $has_global_border = !empty($attrs['border']);
                    if ($has_button_border && $has_global_border) {
                        $warnings[] = 'blockish/button: buttonBorder and the global border attribute are both set — that creates a double border. Use buttonBorder only (or Class Manager customCss targeting .blockish-button-link), not both.';
                    }
                }

                if (!empty($node['innerBlocks']) && is_array($node['innerBlocks'])) {
                    $walk($node['innerBlocks']);
                }
            }
        };

        $walk($blocks);

        return array_values(array_unique($warnings));
    }

    /**
     * Shared copy when the HTTP body was truncated before PHP saw it.
     */
    public static function payload_truncated_error(): string
    {
        return 'Payload too large or invalid JSON — the request body was dropped/truncated before reaching the handler. Fix: (1) split the layout into section patterns with blockish/manage-pattern, (2) assemble the page/template with core/block refs only, or (3) write the schema to a scratch file and pass schema_file. See blockish/get-designer-workflow step 7–8.';
    }
}
