import { __ } from '@wordpress/i18n';

function buildContent( blocks ) {
	return blocks.join( '\n\n' );
}

const blankContainer = buildContent( [
	'<!-- wp:blockish/container {"flexDirection":"column"} -->',
	'<div class="wp-block-blockish-container blockish-block-container blockish-container"><!-- wp:blockish/paragraph -->',
	'<p class="wp-block-blockish-paragraph blockish-block-paragraph">Add mega menu content…</p>',
	'<!-- /wp:blockish/paragraph --></div>',
	'<!-- /wp:blockish/container -->',
] );

const threeColumn = buildContent( [
	'<!-- wp:blockish/container {"flexDirection":"row","customCss":".{{WRAPPER}}{gap:24px;flex-wrap:wrap;}"} -->',
	'<div class="wp-block-blockish-container blockish-block-container blockish-container">',
	'<!-- wp:blockish/container {"flexDirection":"column","customCss":".{{WRAPPER}}{flex:1 1 200px;min-width:180px;}"} -->',
	'<div class="wp-block-blockish-container blockish-block-container blockish-container"><!-- wp:blockish/heading {"level":4} -->',
	'<h4 class="wp-block-blockish-heading blockish-block-heading">Column one</h4>',
	'<!-- /wp:blockish/heading --><!-- wp:blockish/paragraph -->',
	'<p class="wp-block-blockish-paragraph blockish-block-paragraph">Short description.</p>',
	'<!-- /wp:blockish/paragraph --></div>',
	'<!-- /wp:blockish/container -->',
	'<!-- wp:blockish/container {"flexDirection":"column","customCss":".{{WRAPPER}}{flex:1 1 200px;min-width:180px;}"} -->',
	'<div class="wp-block-blockish-container blockish-block-container blockish-container"><!-- wp:blockish/heading {"level":4} -->',
	'<h4 class="wp-block-blockish-heading blockish-block-heading">Column two</h4>',
	'<!-- /wp:blockish/heading --><!-- wp:blockish/paragraph -->',
	'<p class="wp-block-blockish-paragraph blockish-block-paragraph">Short description.</p>',
	'<!-- /wp:blockish/paragraph --></div>',
	'<!-- /wp:blockish/container -->',
	'<!-- wp:blockish/container {"flexDirection":"column","customCss":".{{WRAPPER}}{flex:1 1 200px;min-width:180px;}"} -->',
	'<div class="wp-block-blockish-container blockish-block-container blockish-container"><!-- wp:blockish/heading {"level":4} -->',
	'<h4 class="wp-block-blockish-heading blockish-block-heading">Column three</h4>',
	'<!-- /wp:blockish/heading --><!-- wp:blockish/paragraph -->',
	'<p class="wp-block-blockish-paragraph blockish-block-paragraph">Short description.</p>',
	'<!-- /wp:blockish/paragraph --></div>',
	'<!-- /wp:blockish/container -->',
	'</div>',
	'<!-- /wp:blockish/container -->',
] );

export const MEGAMENU_PRESETS = [
	{
		id: 'blank',
		title: __( 'Blank Canvas', 'blockish' ),
		description: __(
			'Start from scratch with an empty container.',
			'blockish'
		),
		suggestedTitle: __( 'Custom Mega Menu', 'blockish' ),
		content: blankContainer,
	},
	{
		id: 'three-column',
		title: __( 'Three Columns', 'blockish' ),
		description: __(
			'A simple three-column layout for featured links.',
			'blockish'
		),
		suggestedTitle: __( 'Featured Links', 'blockish' ),
		content: threeColumn,
	},
];

export function getPresetById( id ) {
	return MEGAMENU_PRESETS.find( ( preset ) => preset.id === id ) || null;
}
