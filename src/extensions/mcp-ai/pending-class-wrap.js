import { subscribe, select } from '@wordpress/data';
import { maybeWrapPendingClasses } from '../class-manager/wrap-ai-preview';

let started = false;

const startPendingClassWrap = () => {
	if ( started ) {
		return;
	}
	started = true;

	let wrapping = false;
	const unsubscribe = subscribe( () => {
		if ( wrapping ) {
			return;
		}

		const editor = select( 'core/editor' );
		const blocks = select( 'core/block-editor' )?.getBlocks?.() || [];
		const ready = typeof editor?.__unstableIsEditorReady === 'function'
			? editor.__unstableIsEditorReady()
			: !! editor?.getCurrentPostId?.();

		if ( ! ready || ! blocks.length ) {
			return;
		}

		wrapping = true;
		unsubscribe();
		maybeWrapPendingClasses().catch( ( e ) => {
			console.error( 'Blockish AI: pending class wrap failed', e );
		} );
	} );
};

startPendingClassWrap();
