<?php

namespace Blockish\Mcp\Abilities\ManageComments;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function handle(array $args): array
    {
        $action = $args['action'] ?? '';

        switch ($action) {
            case 'get':
                return self::get_comments($args);
            case 'create':
                return self::create_comment($args);
            case 'update':
                return self::update_comment($args);
            case 'delete':
                return self::delete_comment($args);
            case 'status':
                return self::set_comment_status($args);
            default:
                return ['error' => 'Invalid action. Use "get", "create", "update", "delete", or "status".'];
        }
    }

    private static function get_comments(array $args): array
    {
        $query_args = $args['args'] ?? [];
        if (!empty($args['comment_post_ID'])) {
            $query_args['post_id'] = intval($args['comment_post_ID']);
        }
        
        $comments = get_comments($query_args);
        
        $formatted = [];
        foreach ($comments as $comment) {
            $formatted[] = [
                'comment_ID' => $comment->comment_ID,
                'comment_post_ID' => $comment->comment_post_ID,
                'comment_author' => $comment->comment_author,
                'comment_author_email' => $comment->comment_author_email,
                'comment_content' => $comment->comment_content,
                'comment_approved' => $comment->comment_approved,
                'comment_date' => $comment->comment_date
            ];
        }

        return ['data' => $formatted];
    }

    private static function create_comment(array $args): array
    {
        if (empty($args['comment_post_ID']) || empty($args['comment_content'])) {
            return ['error' => 'comment_post_ID and comment_content are required.'];
        }

        $commentdata = [
            'comment_post_ID' => intval($args['comment_post_ID']),
            'comment_content' => wp_kses_post($args['comment_content']),
            'comment_author' => sanitize_text_field($args['comment_author'] ?? 'Admin'),
            'comment_author_email' => sanitize_email($args['comment_author_email'] ?? get_option('admin_email')),
            'comment_approved' => 1, // Auto approve for AI
            'user_id' => get_current_user_id()
        ];

        $comment_id = wp_insert_comment($commentdata);

        if (!$comment_id) {
            return ['error' => 'Failed to create comment.'];
        }

        return ['data' => ['message' => 'Comment created.', 'comment_ID' => $comment_id]];
    }

    private static function update_comment(array $args): array
    {
        if (empty($args['comment_ID'])) {
            return ['error' => 'comment_ID is required.'];
        }

        $commentdata = ['comment_ID' => intval($args['comment_ID'])];
        
        if (isset($args['comment_content'])) {
            $commentdata['comment_content'] = wp_kses_post($args['comment_content']);
        }

        wp_update_comment($commentdata);

        return ['data' => ['message' => 'Comment updated.', 'comment_ID' => $commentdata['comment_ID']]];
    }

    private static function delete_comment(array $args): array
    {
        if (empty($args['comment_ID'])) {
            return ['error' => 'comment_ID is required.'];
        }

        $deleted = wp_delete_comment(intval($args['comment_ID']), true); // Force delete

        if ($deleted) {
            return ['data' => ['message' => 'Comment deleted.']];
        }
        
        return ['error' => 'Failed to delete comment.'];
    }

    private static function set_comment_status(array $args): array
    {
        if (empty($args['comment_ID']) || empty($args['comment_status'])) {
            return ['error' => 'comment_ID and comment_status are required.'];
        }

        $status = $args['comment_status']; // approve, hold, spam, trash
        
        $result = wp_set_comment_status(intval($args['comment_ID']), $status);

        if ($result) {
            return ['data' => ['message' => "Comment status set to $status."]];
        }
        
        return ['error' => 'Failed to set comment status.'];
    }
}
