<?php

namespace Blockish\Mcp\Abilities\GetDesignerWorkflow;

defined('ABSPATH') || exit;

class Callbacks
{
    public static function get_workflow( $_input ): array
    {
        $workflow = [
            '1. Clarify: If brand, layout, or goals are unclear, ask before building. Do not invent a new plot or section list the user already defined.',

            '2. See which blocks exist: Call `blockish/get-blocks-info` first (and `blockish/get-extensions-info` for addons). That catalog is the list of real `blockish/*` names on this site. Do not invent names. Then call `blockish/get-block-docs` with `block_names` for only the ones you will use. If you call get-block-docs with no names, it returns the same catalogs in the error — pick names and call again. Also call `get-class-manager-docs` before class CSS and `get-theme-json-docs` before globals. Never guess attributes or paste block HTML into post_content. If a `blockish/*` block exists for the job, use it — not `core/*`.',
            
            '2a. Right block for the job (read that block’s docs before building): site logo → `blockish/site-logo` (not image + heading). Site name → `blockish/site-title` (not a heading with the brand typed in). Tagline → `blockish/site-tagline`. Header/footer nav → `blockish/navigation` + `navmenu` + `navmenu-item` (not paragraph/heading links in a row). Clickable CTA → `blockish/button` (not a linked paragraph). Social row → `blockish/social-icons` (not a row of `icon` blocks). Icon + label list → `blockish/icon-list`. FAQ → `blockish/accordion`. Layout wrapper → `blockish/container`. Decorative photo → `blockish/image` (that is not the site logo).',

            '3. Globals: Set palette / typography / spacing with `blockish/manage-theme-json` before pages. Prefer theme CSS variables in Class Manager CSS.',

            '4. Styles: Class Manager first (full rules in get-class-manager-docs). Order: `get-classes` → `manage-class` `{css}` only → attach `"classManager": "name1, name2"`. convert-css `css_to_schema` only for true one-offs. Do not pack the Class Manager reference into this workflow.',

            '5. Assets: `get-media` for existing images. New remote image → temp HTTPS URL → `manage-media` `url` (never client path / base64). Cloud: call `fetch-cloud-templates` when you need layout/structure inspiration (hero, pricing, footer). Treat it as a starting schema — change copy, color, and sections to match the user. Recreate `dependencies` locally and remap pattern/form/class IDs. Never stage cloud IDs as-is. Skip the library if the user already supplied a full layout.',
        ];

        if ( defined('BLOCKISH_DYNAMICITY_VERSION') ) {
            $workflow[] = '6. Dynamicity is ACTIVE: Use `blockish-dynamicity/query-builder` + `loop` (not `core/query`). Prefer Blockish post blocks inside loops. Docs: include those names (or `"blockish-dynamicity"`) in get-block-docs. Display Conditions = `displayConditions`.';
            $workflow[] = '6a. ACF: Do not invent Blockish CPT/field tools. If ACF is missing and the user allows install, `blockish-dynamicity/install-acf` confirm:true, then reconnect. If ACF is active, use `acf/register-custom-post-type`, `acf/register-custom-taxonomy`, `acf/register-field-group` (and the acf list tools). Skip Options pages. Bind with Dynamicity `post_acf` / `term_acf` / `user_acf` + metaKey from `blockish-dynamicity/get-meta-list`.';
        } else {
            $workflow[] = '6. Dynamicity is NOT active: Use `core/query`. Tell the user Dynamicity exists for a real query builder. Site chrome can still use `blockish/site-logo`, `site-title`, `site-tagline`.';
        }

        if ( defined( 'BLOCKISH_FORMS_VERSION' ) ) {
            $workflow[] = '6b. Forms is ACTIVE: Never put field blocks on a page. `manage-post` `post_type:"blockish_form"` for the form CPT, embed with `blockish-forms/form` + numeric `formId`. Option/meta keys live in get-block-docs (`blockish-forms`).';
        } else {
            $workflow[] = '6b. Forms is NOT active: Do not invent `blockish-forms/*`. Tell the user the Forms add-on exists.';
        }

        $workflow = array_merge( $workflow, [
            '7. Build sections as patterns first (`manage-pattern`). Never a monolithic page/template tree. Large JSON → `schema_url` (or server `schema_file`). Use only real IDs returned from manage-pattern — never invent `ref`.',
            '8. Template parts — when: Customize the theme `header` and `footer` parts (`manage-template` `type:"wp_template_part"`, existing slugs, `area` header/footer) only if the user asked for a full site or global chrome (nav/footer on every template). Then put `core/template-part` on `wp_template` (front-page, page, …), not on the page. When not: page-only / section-only work — leave theme chrome; do not create parts, do not swap header/footer into page content as patterns. Do not invent extra parts (sidebar, header-2, footer-newsletter) unless asked. Do not set container `tagName` header/footer inside those parts.',
            '9. Pages (`manage-post`): Assemble with `core/block` refs. Full-bleed: `{"name":"core/block","attributes":{"ref":ID,"align":"full"}}`. Do NOT put `core/template-part` header/footer on pages (the template already renders them). Do NOT put pattern HTML in `post_content`. Do NOT set `attributes.content` on `core/block`.',
            '10. Templates (`manage-template` `wp_template`): `block_schema` only. After parts exist: `{"name":"core/template-part","attributes":{"slug":"header","theme":"<stylesheet>"}}` (and footer). Check `get-templates` first — edit the existing part/template rather than creating a duplicate slug.',
            '11. Handoff: After any stage — `trigger-refresh` + share `edit_url`. Stop. User Accept/Discard. Do not share `post_url` by default. Do not auto-accept unless the user asked (then `get-automation-guideline`).',
            '12. Undo: live content → `get-revisions` / `restore-revision` confirm:true. Pending neon → Discard, not revisions.',
            '13. Interactions: entrance presets (`inView`/`ready`) over animation CSS. Device hide = `hideOn`. Details in get-block-docs.',
            '14. Stuck: do not invent CSS. Re-read get-block-docs + get-class-manager-docs. Then only the versioned GitHub files in `stuck_recovery`. Retry once. Still stuck → report + issue draft (do not open the issue).',
        ] );

        $repo    = 'https://github.com/Blockish-WordPress-Plugin/blockish';
        $tag     = 'v' . BLOCKISH_VERSION;
        $blob    = $repo . '/blob/' . $tag . '/';

        return [
            'workflow'       => $workflow,
            'stuck_recovery' => [
                'plugin_version' => BLOCKISH_VERSION,
                'repo'           => $repo,
                'prefer_tag'     => $tag,
                'fallback_tag'   => BLOCKISH_VERSION,
                'blob_base'      => $blob,
                'paths'          => [
                    'block_docs' => 'includes/Mcp/docs/blocks/{slug}.md',
                    'block_json' => 'src/blocks/{slug}/block.json',
                    'block_json_built' => 'build/blocks/{slug}/block.json',
                    'core_docs'  => 'includes/Mcp/docs/core.md',
                ],
                'issues'         => $repo . '/issues',
                'support'        => 'https://wordpress.org/support/plugin/blockish/',
                'do_not'         => [
                    'Open GitHub issues or PRs yourself',
                    'Wander the whole repository',
                    'Invent CSS or attributes after a failed retry',
                    'Include site URLs or credentials in an issue draft',
                ],
            ],
        ];
    }
}
