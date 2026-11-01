/**
 * Shared test data and helpers for Blockish e2e tests.
 */

/**
 * An "in view" entrance interaction, in the exact shape the Interactions
 * builder saves (interactionData attribute).
 *
 * @param {Object} overrides Fields merged into the interaction.
 */
export const inViewFadeUp = ( overrides = {} ) => ( {
	id: 'ix_e2e_fade_up',
	title: 'E2E fade up',
	scope: 'block',
	when: { source: 'dom', event: 'inView', selector: '', eventName: '', phase: 'start' },
	action: {
		type: 'preset',
		preset: 'fade-up',
		motion: {
			tweens: [
				{
					from: { opacity: 0, y: 30 },
					to: { opacity: 1, y: 0 },
					duration: 0.4,
					delay: 0,
					ease: 'power2.out',
				},
			],
		},
		presetOptions: { duration: 0.4, delay: 0, once: true },
		applyTo: '',
		eventName: '',
		phase: 'end',
		callbacks: [ '' ],
	},
	...overrides,
} );

/**
 * Build a post in the editor from block objects, publish it and open it on
 * the front end. Content goes through the editor so static blocks save real
 * markup, exactly as when a user builds the page.
 *
 * @param {Object} fixtures        Playwright fixtures ({ admin, editor, page }).
 * @param {Array}  blocks          Blocks as { name, attributes, innerBlocks }.
 * @param {string} [title]         Post title.
 * @return {Promise<number>} Published post id.
 */
export async function publishAndVisit( { admin, editor, page }, blocks, title = 'Blockish e2e' ) {
	await admin.createNewPost( { title } );
	for ( const block of blocks ) {
		await editor.insertBlock( block );
	}
	const postId = await editor.publishPost();
	await page.goto( `/?p=${ postId }` );
	return postId;
}

/**
 * Open a Blockish dashboard route. A fresh site first shows the Freemius
 * opt-in screen; skip it the way a user would (Freemius remembers it).
 *
 * @param {Object} fixtures       Playwright fixtures ({ admin, page }).
 * @param {string} [route]        Dashboard route, e.g. "extensions".
 */
export async function visitDashboard( { admin, page }, route = '' ) {
	const query = `page=blockish-dashboard${ route ? `&route=${ route }` : '' }`;
	await admin.visitAdminPage( 'admin.php', query );
	const skip = page.getByRole( 'link', { name: 'Skip', exact: true } );
	if ( await skip.isVisible() ) {
		await skip.click();
		await page.waitForLoadState();
		await admin.visitAdminPage( 'admin.php', query );
	}
}
