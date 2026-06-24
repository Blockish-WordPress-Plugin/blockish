import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';

export default function Save( { attributes } ) {
	const { isVertical } = attributes;

	const blockProps = useBlockProps.save( {
		className: clsx( 'blockish-navmenu', {
			'is-vertical': isVertical,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps.save( {
		className: 'blockish-navmenu-nav',
	} );

	return (
		<div { ...blockProps }>
			<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
		</div>
	);
}
