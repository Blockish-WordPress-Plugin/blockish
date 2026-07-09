<?php

namespace Blockish\Mcp\Abilities\GetDesignerWorkflow;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_workflow( $_input ): array
    {
        return [
            'workflow' => [
                '1. Read the Manual: Before writing any schema, call blockish/get-block-docs. This document is your source of truth—it details all available Blockish blocks, their exact attribute schemas, dynamic bindings, and critical framework defaults (e.g., containers default to row layout).',
                '2. Clarify the Vision & Structure: Understand the goal, aesthetic, and brand identity.',
                '3. Set the Foundation (Global Styles): Call blockish/get-theme-json-docs to check existing global styles. Only use blockish/manage-theme-json to update global colors, typography, and spacing IF they are not already set or if the current settings do not match the requested design. Do not overwrite them unnecessarily.',
                '4. Plan Layouts & Sections: Map out which pages and how many sections each page needs before coding. (Optional but recommended: Call blockish/fetch-cloud-templates to search for and use pre-designed sections/patterns instead of building from scratch).',
                '5. Build Templates & Template Parts First: Design necessary FSE templates (like home, single, archive) and template parts (like header, footer) before building individual content pages. Actively use the Blockish Class Manager for reusable CSS classes to maintain a DRY design system.',
                '6. Handle Queries and Dynamic Content Conditionally: Whenever you need to query posts/data in any template, page, or post, check if the "Blockish Dynamicity" plugin blocks (like query-builder, loop) are available in the docs. If yes, you MUST use them for custom queries and bind dynamic data using the dynamicData attribute. If not available, fallback to standard WordPress core blocks (e.g., core/query).',
                '7. Design Content Pages: Create and stage layouts for individual pages (About, Contact, etc.) using blockish/manage-post.',
                '8. Handoff for Review: Provide the user with edit_url so they can review, apply the AI layout, and provide feedback.',
            ]
        ];
    }
}
