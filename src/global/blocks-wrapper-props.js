import { createHigherOrderComponent } from '@wordpress/compose';
import { applyFilters } from '@wordpress/hooks';
import clsx from 'clsx';
import { useMemo } from '@wordpress/element';

const BlockishBlocksWrapperProps = createHigherOrderComponent(
	( BlockListBlock ) => ( props ) => {
		const { attributes, name, clientId } = props;

		// Synced pattern: apply alignfull/alignwide only when align is set.
		if ( name === 'core/block' ) {
			const align = attributes?.align;
			if ( align === 'full' || align === 'wide' ) {
				const wrapperProps = {
					...props.wrapperProps,
					className: clsx(
						props.wrapperProps?.className,
						align === 'full' ? 'alignfull' : 'alignwide'
					),
				};
				return (
					<BlockListBlock { ...props } wrapperProps={ wrapperProps } />
				);
			}
			return <BlockListBlock { ...props } />;
		}

		if ( name?.includes( 'blockish' ) ) {
			const hash = useMemo( () => {
				return clientId?.slice( -6 );
			}, [ clientId ] );

			const globalWrapperProps = {
				...props.wrapperProps,
				className: clsx( `bb-${ hash }`, 'blockish-block-wrapper' ),
			};

			const wrapperProps = applyFilters(
				'blockish.blockWrapper.attributes',
				globalWrapperProps,
				attributes
			);
			return <BlockListBlock { ...props } wrapperProps={ wrapperProps } />;
		}
		return <BlockListBlock { ...props } />;
	},
	'BlockishBlocksWrapperProps'
);
export default BlockishBlocksWrapperProps;
