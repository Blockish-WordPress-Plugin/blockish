<?php

namespace Blockish\Mcp\Abilities\ManageGlobalInteractions;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function execute( $input ): array
    {
        $action = $input['action'] ?? 'get';
        
        if ( 'update' === $action ) {
            if ( ! isset( $input['interactions'] ) || ! is_array( $input['interactions'] ) ) {
                throw new \Exception( 'Missing or invalid "interactions" array for update action.' );
            }
            
            update_option( 'blockish_global_interactions', $input['interactions'] );
            
            return [
                'interactions' => $input['interactions'],
                'message' => 'Global interactions updated successfully.',
            ];
        }
        
        $interactions = get_option( 'blockish_global_interactions', [] );
        if ( is_string( $interactions ) ) {
            $interactions = json_decode( $interactions, true ) ?: [];
        }
        
        return [
            'interactions' => $interactions,
            'message' => 'Global interactions retrieved successfully.',
        ];
    }
}
