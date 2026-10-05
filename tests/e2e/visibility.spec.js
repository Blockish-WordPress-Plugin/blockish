/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import { publishAndVisit } from './fixtures';

test.describe( 'Visibility', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'Hide on Desktop hides the block on desktop only', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{ name: 'blockish/paragraph', attributes: { content: 'Mobile only', hideOn: { Desktop: true, Tablet: false, Mobile: false } } },
			{ name: 'blockish/paragraph', attributes: { content: 'Everywhere' } },
		] );

		const hidden = page.getByText( 'Mobile only' );
		await expect( hidden ).toHaveClass( /blockish-hide-on-desktop/ );

		await page.setViewportSize( { width: 1440, height: 900 } );
		await expect( hidden ).toBeHidden();
		await expect( page.getByText( 'Everywhere' ) ).toBeVisible();

		await page.setViewportSize( { width: 375, height: 800 } );
		await expect( hidden ).toBeVisible();
	} );
} );
