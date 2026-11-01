/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import { visitDashboard } from './fixtures';

test.describe( 'Dashboard', () => {
	test( 'Extensions page lists the extensions without errors', async ( { admin, page } ) => {
		const errors = [];
		page.on( 'pageerror', ( error ) => errors.push( error.message ) );

		await visitDashboard( { admin, page }, 'extensions' );

		await expect( page.getByRole( 'heading', { name: 'Extensions', level: 1 } ) ).toBeVisible();
		await expect( page.locator( '.blockish-block-card' ).filter( { hasText: 'Interactions' } ).first() ).toBeVisible();
		expect( errors ).toEqual( [] );
	} );

	test( 'turning a block off removes it from the editor', async ( { admin, page } ) => {
		const toggleCounter = async ( on ) => {
			await visitDashboard( { admin, page }, 'blocks' );
			const toggle = page.locator( '.blockish-block-card' ).filter( { hasText: 'Counter' } ).first().getByRole( 'checkbox' );
			if ( ( await toggle.isChecked() ) !== on ) {
				const saved = page.waitForResponse( ( r ) => r.url().includes( 'blockish/v1/blocks' ) && r.request().method() === 'POST' );
				await toggle.click();
				await saved;
			}
		};
		const counterInEditor = async () => {
			await admin.createNewPost();
			return page.evaluate( () => !! window.wp.blocks.getBlockType( 'blockish/counter' ) );
		};

		try {
			await toggleCounter( false );
			expect( await counterInEditor() ).toBe( false );
		} finally {
			await toggleCounter( true );
		}
		expect( await counterInEditor() ).toBe( true );
	} );
} );
