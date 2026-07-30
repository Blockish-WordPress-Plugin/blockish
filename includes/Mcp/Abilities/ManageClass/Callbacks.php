<?php

namespace Blockish\Mcp\Abilities\ManageClass;

use Blockish\Mcp\Abilities\GetClasses\Callbacks as GetClassesCallbacks;
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

        if ( $action === 'create' ) {
            if ( empty( $input['name'] ) || ! is_string( $input['name'] ) ) {
                return [ 'error' => 'name is required when creating a class (non-empty string).' ];
            }
        }

        if ( $action === 'update' && $post_id > 0 ) {
            if ( ! current_user_can( 'edit_post', $post_id ) ) {
                return [ 'error' => 'You do not have access to edit this class.' ];
            }
        }

        $args = [
            'post_type'   => 'blockish-classes',
            'post_status' => 'publish',
        ];

        $name_for_convert = null;
        if ( isset( $input['name'] ) ) {
            if ( ! is_string( $input['name'] ) || '' === trim( $input['name'] ) ) {
                return [ 'error' => 'name must be a non-empty string.' ];
            }
            $args['post_title'] = sanitize_text_field( $input['name'] );
            $name_for_convert   = $args['post_title'];
        } elseif ( $action === 'update' && $post_id > 0 ) {
            $existing = get_post( $post_id );
            if ( $existing && 'blockish-classes' === $existing->post_type ) {
                $name_for_convert = $existing->post_title;
            }
        }

        $has_css     = array_key_exists( 'css', $input );
        $has_content = array_key_exists( 'content', $input );
        $children    = [];

        // AI path: raw CSS → parent style object + child posts (AI never sees the split).
        if ( $has_css ) {
            if ( ! is_string( $input['css'] ) ) {
                return [ 'error' => 'css must be a string (raw stylesheet for this class).' ];
            }
            if ( null === $name_for_convert || '' === trim( (string) $name_for_convert ) ) {
                return [ 'error' => 'name is required to convert css (class slug scopes every selector).' ];
            }

            // MCP CSS updates always target a parent class — reject updating a child by id with css.
            if ( $action === 'update' && $post_id > 0 ) {
                $existing = get_post( $post_id );
                if ( $existing && (int) $existing->post_parent > 0 ) {
                    return [ 'error' => 'css updates must target a parent class. Pass the parent post_id (or create by name); child posts are managed automatically from the parent stylesheet.' ];
                }
            }

            $converted = ClassStyleConverter::css_to_class_tree( $input['css'], (string) $name_for_convert );
            if ( isset( $converted['error'] ) ) {
                return [ 'error' => $converted['error'] ];
            }

            $args['post_content'] = wp_slash( wp_json_encode( $converted['content'] ?? [] ) );
            $args['post_parent']  = 0;
            $children             = $converted['children'] ?? [];
        } elseif ( $has_content ) {
            // Legacy path for editor/compat — AI docs use css only.
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
            $args['ID'] = $post_id;
            $result     = wp_update_post( $args, true );
        } else {
            $result = wp_insert_post( $args, true );
        }

        if ( is_wp_error( $result ) ) {
            return [ 'error' => $result->get_error_message() ];
        }

        $id = (int) $result;

        if ( $has_css ) {
            self::sync_children( $id, $children );
        }

        $combined_css = GetClassesCallbacks::combined_css_for_parent( $id );
        update_post_meta( $id, self::CSS_META_KEY, self::parent_meta_css( $id ) );
        foreach ( self::child_posts( $id ) as $child ) {
            $child_content = json_decode( (string) $child->post_content, true );
            $child_sel     = GetClassesCallbacks::build_selector( $child->ID, $child->post_title, $id );
            $child_css     = ClassStyleConverter::style_object_to_css(
                is_array( $child_content ) ? $child_content : [],
                (string) $child->post_title,
                $child_sel
            );
            update_post_meta( $child->ID, self::CSS_META_KEY, $child_css );
        }

        $post = get_post( $id );

        return [
            'post_id'      => $id,
            'name'         => $post->post_title,
            'css_selector' => GetClassesCallbacks::build_selector( $id, $post->post_title ?? '', 0 ),
            'parent_id'    => null,
            'css'          => $combined_css,
        ];
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
