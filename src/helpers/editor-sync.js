/**
 * Editor Sync (MCP AI)
 *
 * Polls for trigger-refresh flags and soft-syncs the open editor from the
 * server — no full page reload, and never savePost over MCP-staged content.
 */
( function () {
	if (
		typeof wp === 'undefined' ||
		typeof wp.data === 'undefined' ||
		typeof wp.apiFetch === 'undefined' ||
		typeof wp.blocks === 'undefined'
	) {
		return;
	}

	let isPolling = false;
	let pollInterval = null;
	let isBusy = false;
	let coalesceTimer = null;
	let pendingSync = false;

	const COALESCE_MS = 750;

	const getEditorContext = () => {
		const editorSelect = wp.data.select( 'core/editor' );
		if ( ! editorSelect ) {
			return null;
		}
		const postType = editorSelect.getCurrentPostType
			? editorSelect.getCurrentPostType()
			: null;
		const postId = editorSelect.getCurrentPostId
			? editorSelect.getCurrentPostId()
			: null;
		if ( ! postType || postId === null || postId === undefined || postId === '' ) {
			return null;
		}
		return { postType, postId };
	};

	/**
	 * Pull latest post_content from the server into the block canvas.
	 * Skips savePost so in-memory editor state cannot overwrite MCP staging.
	 *
	 * @return {Promise<boolean>}
	 */
	const softSyncFromServer = async () => {
		const ctx = getEditorContext();
		if ( ! ctx ) {
			return false;
		}

		const { postType, postId } = ctx;
		const coreDispatch = wp.data.dispatch( 'core' );
		const blockEditorDispatch = wp.data.dispatch( 'core/block-editor' );
		const editorDispatch = wp.data.dispatch( 'core/editor' );

		if ( ! blockEditorDispatch || typeof blockEditorDispatch.resetBlocks !== 'function' ) {
			return false;
		}

		if ( coreDispatch && typeof coreDispatch.invalidateResolution === 'function' ) {
			coreDispatch.invalidateResolution( 'getEntityRecord', [
				'postType',
				postType,
				postId,
			] );
		}

		let record = null;
		if ( wp.data.resolveSelect ) {
			try {
				record = await wp.data
					.resolveSelect( 'core' )
					.getEntityRecord( 'postType', postType, postId, {
						context: 'edit',
					} );
			} catch ( e ) {
				record = null;
			}
		}

		if ( ! record ) {
			try {
				let restBase = postType;
				if ( wp.data.resolveSelect ) {
					const type = await wp.data
						.resolveSelect( 'core' )
						.getPostType( postType );
					if ( type?.rest_base ) {
						restBase = type.rest_base;
					}
				}
				record = await wp.apiFetch( {
					path: `/wp/v2/${ encodeURIComponent(
						restBase
					) }/${ encodeURIComponent( postId ) }?context=edit`,
				} );
			} catch ( e ) {
				console.error( 'Blockish AI Refresh: failed to fetch post', e );
				return false;
			}
		}

		const raw =
			typeof record?.content === 'string'
				? record.content
				: record?.content?.raw;

		if ( typeof raw !== 'string' ) {
			console.error( 'Blockish AI Refresh: missing content.raw on record' );
			return false;
		}

		const blocks = wp.blocks.parse( raw );
		blockEditorDispatch.resetBlocks( blocks );

		// Keep editor entity edits aligned with the server snapshot so the
		// canvas is not marked dirty against stale local content.
		if ( editorDispatch && typeof editorDispatch.editPost === 'function' ) {
			const patch = { content: raw };
			if ( record.modified ) {
				patch.modified = record.modified;
			}
			if ( record.modified_gmt ) {
				patch.modified_gmt = record.modified_gmt;
			}
			try {
				editorDispatch.editPost( patch, { undoIgnore: true } );
			} catch ( e ) {
				// Older WP may not accept the second arg.
				editorDispatch.editPost( patch );
			}
		}

		return true;
	};

	const runPendingSync = async () => {
		if ( isBusy ) {
			pendingSync = true;
			return;
		}

		isBusy = true;
		pendingSync = false;

		try {
			const ok = await softSyncFromServer();
			if ( ! ok ) {
				console.error(
					'Blockish AI Refresh: soft sync failed — leaving editor as-is (no hard reload)'
				);
			} else {
				console.log( 'Blockish AI Refresh: soft-synced from server' );
			}
		} catch ( error ) {
			console.error( 'Blockish AI Refresh: soft sync error', error );
		} finally {
			isBusy = false;
			if ( pendingSync ) {
				pendingSync = false;
				scheduleSync();
			}
		}
	};

	const scheduleSync = () => {
		pendingSync = true;
		if ( coalesceTimer ) {
			clearTimeout( coalesceTimer );
		}
		coalesceTimer = setTimeout( () => {
			coalesceTimer = null;
			runPendingSync();
		}, COALESCE_MS );
	};

	wp.data.subscribe( () => {
		if ( isPolling ) {
			return;
		}

		const editor = wp.data.select( 'core/editor' );
		let isReady = false;

		if ( editor && editor.__unstableIsEditorReady && editor.__unstableIsEditorReady() ) {
			isReady = true;
		}

		const initialPostId = editor ? editor.getCurrentPostId() : null;
		if ( ! isReady || ! initialPostId ) {
			return;
		}

		isPolling = true;

		pollInterval = setInterval( () => {
			if ( isBusy ) {
				return;
			}

			const editorStore = wp.data.select( 'core/editor' );
			if (
				editorStore &&
				editorStore.isSavingPost &&
				editorStore.isSavingPost()
			) {
				return;
			}

			const postId = editorStore ? editorStore.getCurrentPostId() : null;
			if ( ! postId ) {
				return;
			}

			wp.apiFetch( {
				path: `/blockish/v1/check-refresh?post_id=${ encodeURIComponent(
					postId
				) }`,
			} )
				.then( ( response ) => {
					if ( response && response.refresh ) {
						scheduleSync();
					}
				} )
				.catch( () => {
					// Ignore transient network errors
				} );
		}, 3000 );
	} );
} )();
