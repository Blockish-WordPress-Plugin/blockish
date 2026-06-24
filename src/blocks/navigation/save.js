import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save( { attributes } ) {
	const { menuBreakpoint, menuCustomBreakpoint } = attributes;

	// The is-collapsed toggle is applied by JS (editor: device preview;
	// frontend: matchMedia in a later view.js pass). These data attributes
	// carry the breakpoint config that frontend JS will read.
	const blockProps = useBlockProps.save( {
		className: clsx( 'blockish-navigation' ),
		'data-menu-breakpoint': menuBreakpoint || 'tablet',
		'data-custom-breakpoint':
			menuBreakpoint === 'custom' ? menuCustomBreakpoint : '',
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'blockish-navigation-inner',
	} );

	return (
		<div { ...blockProps }>
			<div { ...innerBlocksProps } />
		</div>
	);
}
