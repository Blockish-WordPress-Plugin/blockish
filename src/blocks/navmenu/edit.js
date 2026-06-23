import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Placeholder, Button } from '@wordpress/components';
import { menu as menuIcon } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import './editor.scss';

const fetchPageItems = async () => {
	const pages = await apiFetch( { path: '/wp/v2/pages?per_page=5&parent=0' } );

	return pages.map( ( page ) => [
		'blockish/navmenu-item',
		{
			label: page?.title?.rendered || page?.slug,
			url: page?.link,
			linkId: page?.id,
			linkKind: 'post-type',
			linkType: 'page',
		},
	] );
};

const FALLBACK_ITEM = [ 'blockish/navmenu-item', { label: __( 'Home', 'blockish' ), url: '/' } ];

export default function Edit( props ) {
	const { attributes, setAttributes, clientId } = props;
	const { hasStarted, isVertical, menuAnimation } = attributes;

	const hasChildBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlockOrder( clientId ).length > 0,
		[ clientId ]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-navmenu', {
			'is-vertical': isVertical,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: clsx( 'blockish-navmenu-nav', `menu-animation-${ menuAnimation || 'none' }` ) },
		{ orientation: 'horizontal' }
	);

	// Existing saved menus already have child blocks and should never show
	// the placeholder again just because they predate the `hasStarted` flag.
	if ( ! hasStarted && ! hasChildBlocks ) {
		return (
			<div { ...blockProps }>
				<Placeholder
					icon={ menuIcon }
					label={ __( 'Nav Menu', 'blockish' ) }
					instructions={ __( 'Start with a blank menu and add your own items.', 'blockish' ) }
				>
					<Button
						variant="primary"
						onClick={ async () => {
							let items;

							try {
								items = await fetchPageItems();
							} catch ( error ) {
								items = [];
							}

							if ( ! items.length ) {
								items = [ FALLBACK_ITEM ];
							}

							replaceInnerBlocks(
								clientId,
								items.map( ( [ name, itemAttributes ] ) =>
									createBlock( name, itemAttributes )
								)
							);
							setAttributes( { hasStarted: true } );
						} }
					>
						{ __( 'Start Blank', 'blockish' ) }
					</Button>
				</Placeholder>
			</div>
		);
	}

	return (
		<div { ...blockProps }>
			<Inspector { ...props } />
			<nav { ...innerBlocksProps } aria-label={ __( 'Navigation', 'blockish' ) } />
		</div>
	);
}
