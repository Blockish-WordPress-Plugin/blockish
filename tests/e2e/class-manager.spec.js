/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

/**
 * Internal dependencies
 */
import { publishAndVisit } from './fixtures';

const STYLESHEET = 'link#blockish-class-manager-css';

test.describe( 'Class Manager', () => {
	let classId;

	test.beforeAll( async ( { requestUtils } ) => {
		const created = await requestUtils.rest( {
			path: '/wp/v2/blockish-classes',
			method: 'POST',
			data: {
				title: 'e2e-red',
				status: 'publish',
				content: '{}',
				meta: { blockishClassManagerStyles: '.e2e-red{color:rgb(255, 0, 0)}' },
			},
		} );
		classId = created.id;
	} );

	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.rest( { path: `/wp/v2/blockish-classes/${ classId }`, method: 'DELETE', params: { force: true } } );
		await requestUtils.deleteAllPosts();
	} );

	test( 'an assigned class is added to the block and its CSS applies', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{ name: 'blockish/paragraph', attributes: { content: 'Styled by a class', classManager: [ { id: classId, title: 'e2e-red' } ] } },
		] );

		const block = page.getByText( 'Styled by a class' );
		await expect( block ).toHaveClass( /\be2e-red\b/ );
		await expect( block ).toHaveCSS( 'color', 'rgb(255, 0, 0)' );
		await expect( page.locator( STYLESHEET ) ).toHaveCount( 1 );
	} );

	test( 'pages without classes load no class stylesheet', async ( { admin, editor, page } ) => {
		await publishAndVisit( { admin, editor, page }, [
			{ name: 'blockish/paragraph', attributes: { content: 'No classes here' } },
		] );
		await expect( page.locator( STYLESHEET ) ).toHaveCount( 0 );
	} );
} );
