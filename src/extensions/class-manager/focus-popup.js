import { useCallback, useRef } from '@wordpress/element';

export const focusPopupNode = ( node ) => {
	if ( ! node || typeof node.focus !== 'function' ) {
		return;
	}

	requestAnimationFrame( () => {
		if ( node.isConnected ) {
			node.focus( { preventScroll: true } );
		}
	} );
};

export const usePopupFocus = () => {
	const ref = useRef( null );

	const focusPopup = useCallback( () => {
		focusPopupNode( ref.current );
	}, [] );

	return [ ref, focusPopup ];
};
