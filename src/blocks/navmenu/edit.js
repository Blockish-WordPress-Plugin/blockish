import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

export default function Edit( props ) {
	const { attributes } = props;
	const { isVertical } = attributes;

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-navmenu', {
			'is-vertical': isVertical,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-navmenu-nav' },
		{ orientation: 'horizontal' }
	);

	return (
		<div { ...blockProps }>
			<Inspector { ...props } />
			<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
		</div>
	);
}
