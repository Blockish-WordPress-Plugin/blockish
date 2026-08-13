<?php

namespace Blockish\Mcp\Abilities\ManageClass;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;
use Blockish\Extensions\ClassPrevious;
use Blockish\Extensions\ClassUsage;
use Blockish\Mcp\Converter\ClassStyleConverter;

defined('ABSPATH') || exit;

class Callbacks
{
    private const CSS_META_KEY = 'blockishClassManagerStyles';

    public static function manage_class( $input ): array
    {
        if (empty($input) && isset($_SERVER['CONTENT_LENGTH']) && (int)$_SERVER['CONTENT_LENGTH'] > 0) {
            return ['error' => 'Payload too large or invalid JSON. The request body was dropped or truncated before reaching the handler. Try simplifying styles to reduce payload size.'];
        }

        $input   = is_array( $input ) ? $input : array();
        $action  = $input['action'] ?? 'create';
        $post_id = absint( $input['post_id'] ?? 0 );

        if ( $action === 'sweep' ) {
            $confirm  = ! empty( $input['confirm'] );
            $only_ids = array();
            if ( ! empty( $input['post_ids'] ) && is_array( $input['post_ids'] ) ) {
                $only_ids = array_map( 'absint', $input['post_ids'] );
            } elseif ( $post_id > 0 ) {
                $only_ids = array( $post_id );
            }
            return ClassUsage::sweep_unused( $confirm, $only_ids );
        }

        if ( $action === 'delete' ) {
            if ( ! $post_id ) {
                return [ 'error' => 'post_id is required for delete.' ];
            }
            if ( 'blockish-classes' !== get_post_type( $post_id ) ) {
                return [ 'error' => 'Invalid post_id: not a blockish-classes post.' ];
            }
            if ( ! current_user_can( 'delete_post', $post_id ) ) {
                return [ 'error' => 'You do not have access to delete this class.' ];
            }
            wp_delete_post( $post_id, true );
            return [ 'deleted' => true, 'post_id' => $post_id ];
        }

        $has_css     = array_key_exists( 'css', $input );
        $has_content = array_key_exists( 'content', $input );

        // ── Raw CSS path (preferred AI surface) ──────────────────────────────
        // AI writes raw CSS only. The class name is read from each selector, so
        // create-vs-update is decided here: match by name → update, else create.
        if ( $has_css ) {
            if ( ! is_string( $input['css'] ) ) {
                return [ 'error' => 'css must be a string (raw stylesheet).' ];
            }
            $css           = $input['css'];
            $explicit_name = ( isset( $input['name'] ) && is_string( $input['name'] ) ) ? trim( $input['name'] ) : '';

            // Explicit target: a name and/or a parent post_id — also the {{SELECTOR}}
            // and "clear" (css: "") paths, which cannot derive a name from the CSS.
            if ( '' !== $explicit_name || $post_id > 0 ) {
                $name_for_convert = $explicit_name;

                if ( $post_id > 0 ) {
                    $existing = get_post( $post_id );
                    if ( ! $existing || 'blockish-classes' !== $existing->post_type ) {
                        return [ 'error' => 'Invalid post_id: not a blockish-classes post.' ];
                    }
                    if ( (int) $existing->post_parent > 0 ) {
                        return [ 'error' => 'css updates must target a parent class. Pass the parent post_id, or just the css and let the name be read from the selector; child posts are managed automatically.' ];
                    }
                    if ( ! current_user_can( 'edit_post', $post_id ) ) {
                        return [ 'error' => 'You do not have access to edit this class.' ];
                    }
                    if ( '' === $name_for_convert ) {
                        $name_for_convert = (string) $existing->post_title;
                    }
                }

                if ( '' === trim( (string) $name_for_convert ) ) {
                    return [ 'error' => 'name is required to convert css (the class slug scopes every selector).' ];
                }

                $converted = ClassStyleConverter::css_to_class_tree( $css, (string) $name_for_convert );
                if ( isset( $converted['error'] ) ) {
                    return [ 'error' => $converted['error'] ];
                }

                $row = self::persist_class_tree(
                    (string) $name_for_convert,
                    $converted['content'] ?? [],
                    $converted['children'] ?? [],
                    (string) ( $converted['css'] ?? '' ),
                    $post_id > 0 ? $post_id : null
                );
                if ( isset( $row['error'] ) ) {
                    return $row;
                }
                $row['classes'] = [ self::class_row_only( $row ) ];
                return $row;
            }

            // Derive class name(s) straight from the selectors — no name/action needed.
            $trees = ClassStyleConverter::css_to_class_trees( $css );
            if ( isset( $trees['error'] ) ) {
                return [ 'error' => $trees['error'] ];
            }
            $classes = $trees['classes'] ?? [];
            if ( empty( $classes ) ) {
                return [ 'error' => 'No class found in css. Write at least one ".name { … }" rule (its selector names the class), or pass an explicit name when using {{SELECTOR}}.' ];
            }

            $rows = [];
            foreach ( $classes as $tree ) {
                $row = self::persist_class_tree(
                    (string) ( $tree['name'] ?? '' ),
                    $tree['content'] ?? [],
                    $tree['children'] ?? [],
                    (string) ( $tree['css'] ?? '' ),
                    null
                );
                if ( isset( $row['error'] ) ) {
                    return $row;
                }
                $rows[] = $row;
            }

            $first            = $rows[0];
            $first['classes'] = array_map( [ self::class, 'class_row_only' ], $rows );
            return $first;
        }

        // ── Legacy editor paths (structured content object / bare create) ────
        if ( $action === 'create' ) {
            if ( empty( $input['name'] ) || ! is_string( $input['name'] ) ) {
                return [ 'error' => 'name is required when creating a class (non-empty string).' ];
            }
        }
        if ( $action === 'update' && $post_id > 0 && ! current_user_can( 'edit_post', $post_id ) ) {
            return [ 'error' => 'You do not have access to edit this class.' ];
        }

        $args = [
            'post_type'   => 'blockish-classes',
            'post_status' => 'publish',
        ];
        if ( isset( $input['name'] ) ) {
            if ( ! is_string( $input['name'] ) || '' === trim( $input['name'] ) ) {
                return [ 'error' => 'name must be a non-empty string.' ];
            }
            $args['post_title'] = sanitize_text_field( $input['name'] );
        }

        if ( $has_content ) {
            $content = $input['content'];

            if ( is_string( $content ) ) {
                $decoded = json_decode( $content, true );
                if ( JSON_ERROR_NONE !== json_last_error() || ! is_array( $decoded ) ) {
                    return [ 'error' => 'content must be a style object (JSON object), not a string of invalid JSON.' ];
                }
                $content = $decoded;
            }

            if ( ! is_array( $content ) ) {
                return [ 'error' => 'content must be a style object (key/value map).' ];
            }

            if ( $action === 'update' && $post_id > 0 ) {
                $existing_post = get_post( $post_id );
                if ( $existing_post && 'blockish-classes' === $existing_post->post_type ) {
                    $existing_content = json_decode( $existing_post->post_content, true );
                    if ( is_array( $existing_content ) && is_array( $content ) ) {
                        if ( empty( $content ) ) {
                            $content = [];
                        } else {
                            $full_replace_keys = ['boxShadow', 'textShadow', 'filters', 'backgroundFilters', 'customCss'];
                            foreach ($full_replace_keys as $k) {
                                if (array_key_exists($k, $content)) {
                                    $existing_content[$k] = $content[$k];
                                    unset($content[$k]);
                                }
                            }

                            $content = array_replace_recursive( $existing_content, $content );
                            $content = self::remove_null_values( $content );
                        }
                    }
                }
            }

            $args['post_content'] = wp_slash( wp_json_encode( $content ) );
            if ( ! empty( $input['parent_id'] ) ) {
                $args['post_parent'] = absint( $input['parent_id'] );
            }
        } elseif ( ! empty( $input['parent_id'] ) ) {
            $args['post_parent'] = absint( $input['parent_id'] );
        }

        if ( $action === 'update' ) {
            if ( ! $post_id ) {
                return [ 'error' => 'post_id is required for update.' ];
            }
            ClassPrevious::seed_if_empty( ClassPrevious::resolve_parent_id( $post_id ), false );
            $args['ID'] = $post_id;
            $result     = wp_update_post( $args, true );
        } else {
            $parent_id = absint( $args['post_parent'] ?? 0 );
            if ( $parent_id > 0 ) {
                ClassPrevious::seed_if_empty( $parent_id, false );
            }
            $result = wp_insert_post( $args, true );
        }

        if ( is_wp_error( $result ) ) {
            return [ 'error' => $result->get_error_message() ];
        }

        $id = (int) $result;
        if ( 'update' !== $action && (int) get_post_field( 'post_parent', $id ) < 1 ) {
            ClassPrevious::seed_if_empty( $id, true );
        }
        self::refresh_class_meta( $id );

        $post = get_post( $id );

        return [
            'post_id'      => $id,
            'name'         => $post->post_title,
            'css_selector' => GetClassesCallbacks::build_selector( $id, $post->post_title ?? '', 0 ),
            'parent_id'    => null,
            'css'          => GetClassesCallbacks::combined_css_for_parent( $id ),
        ];
    }

    /**
     * Insert-or-update a single parent class (matched by normalized name) from a
     * converted CSS tree, sync its child posts, and refresh compiled meta.
     *
     * @param array<string, mixed>                              $content
     * @param array<int, array{name: string, content: array}>  $children
     */
    private static function persist_class_tree( string $name, array $content, array $children, string $generated_css, ?int $force_post_id ): array {
        $slug = ClassStyleConverter::normalize_slug( $name );
        if ( '' === $slug ) {
            return [ 'error' => 'Invalid class name "' . $name . '": use a-z, 0-9, hyphen, underscore and start with a letter or underscore.' ];
        }

        $existing_id = $force_post_id ?: self::find_parent_by_name( $slug );

        $args = [
            'post_type'    => 'blockish-classes',
            'post_status'  => 'publish',
            'post_title'   => $slug,
            'post_content' => wp_slash( wp_json_encode( $content ) ),
            'post_parent'  => 0,
        ];

        if ( $existing_id ) {
            if ( ! current_user_can( 'edit_post', $existing_id ) ) {
                return [ 'error' => 'You do not have access to edit class "' . $slug . '".' ];
            }
            ClassPrevious::seed_if_empty( $existing_id, false );
            $args['ID'] = $existing_id;
            $result     = wp_update_post( $args, true );
        } else {
            $result = wp_insert_post( $args, true );
        }

        if ( is_wp_error( $result ) ) {
            return [ 'error' => $result->get_error_message() ];
        }

        $id = (int) $result;
        if ( empty( $existing_id ) ) {
            ClassPrevious::seed_if_empty( $id, true );
        }
        self::sync_children( $id, $children );

        /*
         * Seed the parent with the complete CSS produced from the AI stylesheet.
         * This is the editor/frontend baseline before render-style.js has had a
         * chance to regenerate and split CSS across the parent + child records.
         * Clear child meta so stale generated rules cannot duplicate or override
         * this complete baseline. The editor generator will repopulate the split
         * parent/child meta after it initializes.
         */
        update_post_meta( $id, self::CSS_META_KEY, $generated_css );
        foreach ( self::child_posts( $id ) as $child ) {
            update_post_meta( $child->ID, self::CSS_META_KEY, '' );
        }

        $post = get_post( $id );

        return [
            'post_id'      => $id,
            'name'         => $post->post_title,
            'css_selector' => GetClassesCallbacks::build_selector( $id, $post->post_title ?? '', 0 ),
            'parent_id'    => null,
            'css'          => GetClassesCallbacks::combined_css_for_parent( $id ),
            'created'      => empty( $existing_id ),
        ];
    }

    /**
     * Find an existing parent class whose title normalizes to the same slug.
     */
    private static function find_parent_by_name( string $name ): ?int {
        $slug = ClassStyleConverter::normalize_slug( $name );
        if ( '' === $slug ) {
            return null;
        }

        $ids = get_posts([
            'post_type'      => 'blockish-classes',
            'post_status'    => 'publish',
            'post_parent'    => 0,
            'posts_per_page' => -1,
            'fields'         => 'ids',
            'orderby'        => 'ID',
            'order'          => 'ASC',
        ]);

        foreach ( $ids as $pid ) {
            $title = (string) get_post_field( 'post_title', $pid );
            if ( ClassStyleConverter::normalize_slug( $title ) === $slug ) {
                return (int) $pid;
            }
        }

        return null;
    }

    /**
     * Recompile the AI/editor CSS meta for a parent and all of its children.
     */
    private static function refresh_class_meta( int $parent_id ): void {
        update_post_meta( $parent_id, self::CSS_META_KEY, self::parent_meta_css( $parent_id ) );
        self::refresh_child_meta( $parent_id );
    }

    /**
     * Compile generated CSS meta for every child of a parent.
     */
    private static function refresh_child_meta( int $parent_id ): void {
        foreach ( self::child_posts( $parent_id ) as $child ) {
            $child_content = json_decode( (string) $child->post_content, true );
            $child_sel     = GetClassesCallbacks::build_selector( $child->ID, $child->post_title, $parent_id );
            $child_css     = ClassStyleConverter::style_object_to_css(
                is_array( $child_content ) ? $child_content : [],
                (string) $child->post_title,
                $child_sel
            );
            update_post_meta( $child->ID, self::CSS_META_KEY, $child_css );
        }
    }

    /**
     * Strip the nested `classes` list from a result row (used when nesting rows).
     *
     * @param array<string, mixed> $row
     * @return array<string, mixed>
     */
    private static function class_row_only( array $row ): array {
        unset( $row['classes'] );
        return $row;
    }

    /**
     * Upsert child posts from CSS remainders; delete children no longer present.
     *
     * @param array<int, array{name: string, content: array}> $children
     */
    private static function sync_children( int $parent_id, array $children ): void {
        $existing = self::child_posts( $parent_id );
        $by_title = [];
        foreach ( $existing as $post ) {
            $by_title[ trim( (string) $post->post_title ) ] = $post;
        }

        $seen = [];
        foreach ( $children as $child ) {
            $name = trim( (string) ( $child['name'] ?? '' ) );
            if ( '' === $name ) {
                continue;
            }
            $seen[ $name ] = true;
            $content_json  = wp_slash( wp_json_encode( $child['content'] ?? [] ) );

            if ( isset( $by_title[ $name ] ) ) {
                wp_update_post([
                    'ID'           => (int) $by_title[ $name ]->ID,
                    'post_content' => $content_json,
                    'post_parent'  => $parent_id,
                    'post_status'  => 'publish',
                ]);
            } else {
                wp_insert_post([
                    'post_type'    => 'blockish-classes',
                    'post_status'  => 'publish',
                    'post_title'   => $name,
                    'post_parent'  => $parent_id,
                    'post_content' => $content_json,
                ]);
            }
        }

        foreach ( $by_title as $title => $post ) {
            if ( ! isset( $seen[ $title ] ) ) {
                wp_delete_post( (int) $post->ID, true );
            }
        }
    }

    /**
     * @return \WP_Post[]
     */
    private static function child_posts( int $parent_id ): array {
        return get_posts([
            'post_type'      => 'blockish-classes',
            'post_status'    => 'publish',
            'posts_per_page' => -1,
            'post_parent'    => $parent_id,
            'orderby'        => 'title',
            'order'          => 'ASC',
        ]);
    }

    private static function parent_meta_css( int $parent_id ): string {
        $post = get_post( $parent_id );
        if ( ! $post ) {
            return '';
        }
        $content = json_decode( (string) $post->post_content, true );
        return ClassStyleConverter::style_object_to_css(
            is_array( $content ) ? $content : [],
            (string) $post->post_title,
            '.' . ClassStyleConverter::normalize_slug( (string) $post->post_title )
        );
    }

    private static function remove_null_values( array $array ): array {
        foreach ( $array as $key => $value ) {
            if ( is_array( $value ) ) {
                $array[ $key ] = self::remove_null_values( $value );
                if ( empty( $array[ $key ] ) ) {
                    unset( $array[ $key ] );
                }
            } elseif ( $value === null ) {
                unset( $array[ $key ] );
            }
        }
        return $array;
    }
}
