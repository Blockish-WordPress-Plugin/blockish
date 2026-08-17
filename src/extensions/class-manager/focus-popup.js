import { useCallback, useRef } from '@wordpress/element';

export const focusPopupNode = ( node ) => {
	if ( ! node || typeof node.focus !== 'function' ) {
		return;
	}

	requestAnimationFrame( () => {
		if ( ! node.isConnected ) {
			return;
		}

		const active = document.activeElement;
		if ( active && node.contains( active ) && active !== node ) {
			return;
		}

		node.focus( { preventScroll: true } );
	} );
};

export const focusMainClassPopover = () => {
	focusPopupNode( document.querySelector( '.blockish-class-manager-popover-focus' ) );
};

export const usePopupFocus = () => {
	const ref = useRef( null );

	const focusPopup = useCallback( () => {
		focusPopupNode( ref.current );
	}, [] );

	return [ ref, focusPopup ];
};
