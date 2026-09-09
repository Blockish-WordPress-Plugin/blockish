import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import metadata from './block.json';

/**
 * @deprecated Static save markup — migrated to dynamic render.php.
 */
const deprecated = [
	{
		attributes: metadata.attributes,
		supports: metadata.supports,
		save( { attributes } ) {
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
		},
	},
];

export default deprecated;
