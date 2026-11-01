/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import { publishAndVisit } from './fixtures';

const item = ( content, filterTerms, searchKeywords ) => ( {
	name: 'blockish/paragraph',
	attributes: {
		content,
		...( filterTerms ? { filterTerms } : {} ),
		...( searchKeywords ? { searchKeywords } : {} ),
	},
} );

test.describe( 'Filter Container', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'filters its blocks by term buttons and search', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{
				name: 'blockish/filter-container',
				attributes: { emptyMessage: 'Nothing matches.' },
				innerBlocks: [
					item( 'Logo refresh', 'Design, Branding', 'logo, refresh' ),
					item( 'Checkout rebuild', 'Development', 'checkout, store' ),
					item( 'Poster series', 'Design' ),
					item( 'Always visible note' ),
				],
			},
		] );

		const container = page.locator( '.blockish-filter-container' );
		const buttons = container.locator( '.blockish-filter-button' );
		const visible = () => container.locator( '[data-blockish-filter-terms]:visible' );

		// One "All" button plus one per unique term, in order of appearance.
		await expect( buttons ).toHaveText( [ 'All', 'Design', 'Branding', 'Development' ] );
		await expect( buttons.first() ).toHaveAttribute( 'aria-pressed', 'true' );
		await expect( visible() ).toHaveCount( 3 );

		await buttons.filter( { hasText: /^Design$/ } ).click();
		await expect( visible() ).toHaveText( [ 'Logo refresh', 'Poster series' ] );
		// Blocks without terms are never filtered.
		await expect( container.getByText( 'Always visible note' ) ).toBeVisible();

		// Clicking the active button again shows everything.
		await buttons.filter( { hasText: /^Design$/ } ).click();
		await expect( visible() ).toHaveCount( 3 );

		const search = container.getByRole( 'searchbox' );
		await search.fill( 'checkout' ); // a search keyword
		await expect( visible() ).toHaveText( [ 'Checkout rebuild' ] );
		await search.fill( 'brand' ); // a filter term
		await expect( visible() ).toHaveText( [ 'Logo refresh' ] );
		await search.fill( 'logo brand' ); // every word must match
		await expect( visible() ).toHaveText( [ 'Logo refresh' ] );
		await search.fill( 'series' ); // block text is not searched by default
		await expect( visible() ).toHaveCount( 0 );

		await search.fill( 'zzz' );
		await expect( visible() ).toHaveCount( 0 );
		await expect( container.getByText( 'Nothing matches.' ) ).toBeVisible();
	} );

	test( 'a card is filtered as a whole, even with tagged blocks inside it', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{
				name: 'blockish/filter-container',
				innerBlocks: [
					{
						name: 'blockish/container',
						attributes: { isVariationPicked: true, filterTerms: 'Design' },
						innerBlocks: [
							{
								name: 'blockish/container',
								attributes: { isVariationPicked: true, filterTerms: 'Branding' },
								innerBlocks: [ item( 'Nested card text' ) ],
							},
							item( 'Card footer', 'Print' ),
						],
					},
					item( 'Plain item', 'Development' ),
				],
			},
		] );

		const container = page.locator( '.blockish-filter-container' );
		const buttons = container.locator( '.blockish-filter-button' );
		// Inner terms belong to the card: one item with Design, Branding and Print.
		await expect( buttons ).toHaveText( [ 'All', 'Design', 'Branding', 'Print', 'Development' ] );

		for ( const term of [ 'Branding', 'Print', 'Design' ] ) {
			await buttons.filter( { hasText: new RegExp( `^${ term }$` ) } ).click();
			await expect( container.getByText( 'Nested card text' ) ).toBeVisible();
			await expect( container.getByText( 'Card footer' ) ).toBeVisible();
			await expect( container.getByText( 'Plain item' ) ).toBeHidden();
		}

		await buttons.filter( { hasText: /^Development$/ } ).click();
		await expect( container.getByText( 'Nested card text' ) ).toBeHidden();
		await expect( container.getByText( 'Plain item' ) ).toBeVisible();
		await expect( container.locator( '.blockish-filter-status' ) ).toHaveText( '1 / 2' );
	} );

	test( 'blocks inside get a Filter terms field in the editor', async ( { admin, editor, page } ) => {
		await admin.createNewPost();
		await editor.insertBlock( {
			name: 'blockish/filter-container',
			innerBlocks: [
				item( 'Tagged item', 'Design' ),
				item( 'Untagged item' ),
				{
					name: 'blockish/container',
					attributes: { isVariationPicked: true, filterTerms: 'Design, Branding' },
					innerBlocks: [ item( 'Card text' ) ],
				},
			],
		} );
		await editor.selectBlocks( editor.canvas.getByText( 'Untagged item' ) );

		const field = page.getByLabel( 'Filter terms' );
		await expect( field ).toBeVisible();
		// Terms used elsewhere in the container are offered as one-click chips.
		await page.getByRole( 'button', { name: '+ Design' } ).click();
		await expect( field ).toHaveValue( 'Design' );

		// Container blocks (first tab "Layout") get the panel too.
		await editor.selectBlocks( editor.canvas.locator( '[data-type="blockish/container"]' ).first() );
		await expect( page.getByLabel( 'Filter terms' ) ).toHaveValue( 'Design, Branding' );
	} );
} );
