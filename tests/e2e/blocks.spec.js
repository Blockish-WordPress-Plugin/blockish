/**
 * WordPress dependencies
 */
const { test, expect } = require( '@wordpress/e2e-test-utils-playwright' );

// PHP notices/warnings/fatals as printed with WP_DEBUG on.
const PHP_ERROR = /(Fatal error|Warning|Notice|Deprecated|Parse error)<\/b>:|Uncaught (Error|Exception)/;

/**
 * Every Blockish block that can be inserted at the top level: insert it,
 * save, reload the editor (static blocks must still validate), then render
 * the post (no PHP errors, no JS errors).
 */
test.describe( 'All Blockish blocks', () => {
	test.afterAll( async ( { requestUtils } ) => {
		await requestUtils.deleteAllPosts();
	} );

	test( 'insert, save, reload and render without errors', async ( { admin, editor, page } ) => {
		test.setTimeout( 300_000 );

		await admin.createNewPost( { title: 'All blocks' } );
		const names = await page.evaluate( () =>
			window.wp.blocks
				.getBlockTypes()
				.filter(
					( type ) =>
						type.name.startsWith( 'blockish' ) &&
						! type.parent?.length &&
						! type.ancestor?.length &&
						type.supports?.inserter !== false
				)
				.map( ( type ) => type.name )
		);
		expect( names.length ).toBeGreaterThan( 10 );
		test.info().annotations.push( { type: 'blocks', description: `${ names.length }: ${ names.join( ', ' ) }` } );

		for ( const name of names ) {
			await editor.insertBlock( { name } );
		}
		const crashed = await editor.canvas.locator( '.block-editor-warning' ).allInnerTexts();
		expect.soft( crashed, 'blocks crashing in the editor' ).toEqual( [] );

		const postId = await editor.publishPost();

		// Reload: the editor re-parses saved markup, so broken save() output shows here.
		await admin.visitAdminPage( 'post.php', `post=${ postId }&action=edit` );
		await page.waitForFunction( () => window.wp?.data?.select( 'core/block-editor' )?.getBlocks()?.length > 0 );
		const invalid = await page.evaluate( () => {
			const out = [];
			const walk = ( blocks ) =>
				blocks.forEach( ( block ) => {
					if ( block.isValid === false ) {
						out.push( block.name );
					}
					walk( block.innerBlocks );
				} );
			walk( window.wp.data.select( 'core/block-editor' ).getBlocks() );
			return out;
		} );
		expect.soft( invalid, 'blocks invalid after reload' ).toEqual( [] );

		const jsErrors = [];
		page.on( 'pageerror', ( error ) => jsErrors.push( error.message ) );
		const response = await page.goto( `/?p=${ postId }` );
		expect( response.status() ).toBe( 200 );
		const html = await page.content();
		expect.soft( html.match( PHP_ERROR )?.[ 0 ] ?? null, 'PHP error on the front end' ).toBeNull();
		await page.waitForLoadState( 'networkidle' );
		expect.soft( jsErrors, 'JS errors on the front end' ).toEqual( [] );
	} );
} );
