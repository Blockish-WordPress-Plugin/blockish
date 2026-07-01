<?php

namespace Blockish\Mcp\Abilities\GetDesignerWorkflow;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_workflow( $_input ): array
    {
        return [
            'workflow' => [
                '1. Clarify the Vision & Structure: Understand the goal, aesthetic, and brand identity.',
                '2. Set the Foundation (Global Styles): Use blockish/manage-theme-json to establish global colors, typography, and spacing.',
                '3. Plan Layouts & Sections: Map out which pages and how many sections each page needs before coding.',
                '4. Build Templates & Template Parts First: Design Header, Footer, and Home/Frontpage templates before any content pages. CRITICAL: While designing, actively look for duplicated styling and use the Blockish Class Manager to create reusable CSS classes for a DRY design system.',
                '5. Design Content Pages: Once global styles, templates, and classes are established, create and stage layouts for individual pages (About, Contact, etc.) using blockish/manage-post.',
                '6. Handoff for Review: Provide the user with edit_url so they can review, apply the AI layout, and provide feedback.',
                '7. On-Demand Tasks: Handle dynamic content (posts), media management, and mobile-responsive fine-tuning when necessary.',
            ]
        ];
    }
}
