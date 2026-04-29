import { useEffect } from '@wordpress/element';
const useTextareaHeight = ( elementRef ) => {
	useEffect( () => {
		if ( ! elementRef ) {
			return;
		}

		elementRef.style.height = 'auto';
		const nextHeight = Math.min( elementRef.scrollHeight, 180 );
		elementRef.style.height = `${ nextHeight }px`;
	}, [ elementRef ] );

	return elementRef;
};

export default useTextareaHeight;
