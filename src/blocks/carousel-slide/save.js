import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

function parseOverlay( value ) {
	if ( ! value ) {
		return null;
	}
	if ( typeof value === 'object' ) {
		return value;
	}
	try {
		return JSON.parse( value );
	} catch ( e ) {
		return null;
	}
}

export default function Save( { attributes } ) {
	const overlay = parseOverlay( attributes?.slideBackgroundOverlay );

	const blockProps = useBlockProps.save( {
		className: clsx( 'blockish-carousel__slide', 'is-default-styled', {
			'has-background-overlay': !! overlay?.enabled,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'blockish-carousel__slide-inner',
	} );

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}
