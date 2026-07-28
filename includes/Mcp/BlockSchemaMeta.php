<?php

namespace Blockish\Mcp;

defined('ABSPATH') || exit;

/**
 * Schema validation / normalization helpers for MCP staging.
 * Pending layouts are stored on content as blockish/ai-preview (not post meta).
 */
class BlockSchemaMeta
{
    use \Blockish\Traits\SingletonTrait;

    /** @deprecated Legacy meta key; no longer written for new staging. Kept for one-shot cleanup. */
    const META_KEY = '_blockish_block_schema';

    private function __construct()
    {
    }

    /**
     * Recursively forces non-obvious required attributes that default to false.
     * e.g., isVariationPicked on blockish/container, hasStarted on blockish/navigation.
     * Nested containers: strip alignItems/justifyContent so they do not pick up the
     * top-level Center CSS default (omit = unset; set only when intentional).
     *
     * @param array $blocks
     * @param bool  $inside_container Whether walking children of a blockish/container.
     */
    public static function force_required_attributes(array $blocks, bool $inside_container = false): array
    {
        foreach ($blocks as &$block) {
            if (isset($block['name'])) {
                if ($block['name'] === 'blockish/container') {
                    if (!isset($block['attributes']) || !is_array($block['attributes'])) {
                        $block['attributes'] = [];
                    }
                    $block['attributes']['isVariationPicked'] = true;

                    if ($inside_container) {
                        // Empty objects survive serialization and prevent accidental
                        // center/start from older schema defaults / AI habit.
                        if (!isset($block['attributes']['alignItems'])) {
                            $block['attributes']['alignItems'] = new \stdClass();
                        }
                        if (!isset($block['attributes']['justifyContent'])) {
                            $block['attributes']['justifyContent'] = new \stdClass();
                        }
                    }
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
                $child_inside = $inside_container || (isset($block['name']) && $block['name'] === 'blockish/container');
                $block['innerBlocks'] = self::force_required_attributes($block['innerBlocks'], $child_inside);
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
                'Schema too large (%d bytes). Write it to a scratch JSON file and pass schema_file, or split into smaller patterns via blockish/manage-pattern. Then assemble with {"name":"core/block","attributes":{"ref":<pattern_id>,"align":"full"}}. See blockish/get-designer-workflow step 7–8.',
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
                'Schema too large or too deeply nested for a full page/template (nodes=%d, depth=%d, bytes=%d). Do NOT send a monolithic layout. Build each section with blockish/manage-pattern, then assemble a lightweight schema of {"name":"core/block","attributes":{"ref":<pattern_id>,"align":"full"}}. On block themes, omit header/footer template-parts from page content (the template already provides them); use core/template-part only when editing wp_template layouts. See blockish/get-designer-workflow step 7–8.',
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
     * Pages/posts must not embed header/footer template parts (theme template already does).
     *
     * @param array  $blocks
     * @param string $post_type
     * @return string|null
     */
    public static function get_page_template_part_error(array $blocks, string $post_type): ?string
    {
        // Only enforce on normal content; templates may include header/footer parts.
        if (in_array($post_type, ['wp_template', 'wp_template_part', 'wp_block'], true)) {
            return null;
        }

        $found = [];
        $walk  = function ($nodes) use (&$walk, &$found) {
            if (!is_array($nodes)) {
                return;
            }
            foreach ($nodes as $node) {
                if (!is_array($node) || empty($node['name'])) {
                    continue;
                }
                if ('core/template-part' === $node['name']) {
                    $slug = isset($node['attributes']['slug']) ? (string) $node['attributes']['slug'] : '';
                    if (in_array($slug, ['header', 'footer'], true) || '' === $slug) {
                        $found[] = $slug !== '' ? $slug : 'template-part';
                    }
                }
                if (!empty($node['innerBlocks']) && is_array($node['innerBlocks'])) {
                    $walk($node['innerBlocks']);
                }
            }
        };
        $walk($blocks);

        if (empty($found)) {
            return null;
        }

        return 'Do not put core/template-part header/footer in page/post block_schema — the block theme template already renders them (duplicates otherwise). Assemble pages with core/block pattern refs only. Use core/template-part only when editing a wp_template via blockish/manage-template. See blockish/get-designer-workflow step 8.';
    }

    /**
     * Shared copy when the HTTP body was truncated before PHP saw it.
     */
    public static function payload_truncated_error(): string
    {
        return 'Payload too large or invalid JSON — the request body was dropped/truncated before reaching the handler. Fix: (1) split the layout into section patterns with blockish/manage-pattern, (2) assemble the page/template with core/block refs only, or (3) write the schema to a scratch file and pass schema_file. See blockish/get-designer-workflow step 7–8.';
    }
}
