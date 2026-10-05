/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import { inViewFadeUp, publishAndVisit } from './fixtures';

const RUNTIME = 'script[src*="extensions/interactions/view"]';

test.describe( 'Interactions', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'pages without interactions load no interactions runtime', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{ name: 'blockish/paragraph', attributes: { content: 'Plain paragraph' } },
		] );

		await expect( page.getByText( 'Plain paragraph' ) ).toBeVisible();
		await expect( page.locator( RUNTIME ) ).toHaveCount( 0 );
		await expect( page.locator( '[data-blockish-interactions]' ) ).toHaveCount( 0 );
	} );

	test( 'an in-view entrance tags the block, loads the runtime and reveals it', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{
				name: 'blockish/paragraph',
				attributes: { content: 'Animated paragraph', interactionData: [ inViewFadeUp() ] },
			},
		] );

		const block = page.locator( '[data-blockish-interactions]' );
		await expect( block ).toHaveCount( 1 );
		await expect( block ).toHaveAttribute( 'data-blockish-interactions', /ix_e2e_fade_up/ );
		await expect( page.locator( RUNTIME ) ).toHaveCount( 1 );

		// The entrance ends fully visible.
		await block.scrollIntoViewIfNeeded();
		await expect
			.poll( () => block.evaluate( ( el ) => getComputedStyle( el ).opacity ) )
			.toBe( '1' );
	} );
} );
