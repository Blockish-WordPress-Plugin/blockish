import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { Placeholder, Button } from '@wordpress/components';
import { menu as menuIcon } from '@wordpress/icons';
import { useResizeObserver } from '@wordpress/compose';
import { useSelect, useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import useDeviceType from '../../helpers/use-device-type';

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

const FALLBACK_ITEM = [ 'blockish/navmenu-item', { label: __( 'Home', 'blockish' ), url: '' } ];

export default function Edit( props ) {
	const { attributes, setAttributes, clientId } = props;
	const { hasStarted, menuBreakpoint, menuCustomBreakpoint } = attributes;

	const hasChildBlocks = useSelect(
		( select ) => select( blockEditorStore ).getBlockOrder( clientId ).length > 0,
		[ clientId ]
	);
	const { replaceInnerBlocks } = useDispatch( blockEditorStore );

	// Editor canvas width doesn't reliably map to the chosen device (sidebar,
	// zoom, window all change width), so tablet/mobile collapse off the
	// editor's device-preview selection. "Custom" has no device category, so
	// it falls back to measuring the canvas width.
	const deviceType = useDeviceType();
	const [ resizeListener, { width } ] = useResizeObserver();
	const isCustomCollapsed =
		menuBreakpoint === 'custom' && !! width && width <= menuCustomBreakpoint;

	const isCollapsed =
		menuBreakpoint === 'custom'
			? isCustomCollapsed
			: menuBreakpoint === 'mobile'
			? deviceType === 'Mobile'
			: deviceType === 'Tablet' || deviceType === 'Mobile';

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-navigation', {
			'is-collapsed': isCollapsed,
		} ),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-navigation-inner' },
		{
			allowedBlocks: [ 'blockish/navmenu', 'blockish/offcanvas' ],
			templateLock: false,
			orientation: 'horizontal',
		}
	);

	if ( ! hasStarted && ! hasChildBlocks ) {
		return (
			<div { ...blockProps }>
				<Inspector { ...props } />
				<Placeholder
					icon={ menuIcon }
					label={ __( 'Navigation', 'blockish' ) }
					instructions={ __(
						'Start with a blank menu — a desktop menu and a mobile offcanvas will be created together.',
						'blockish'
					) }
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

							const navmenu = createBlock(
								'blockish/navmenu',
								{},
								items.map( ( [ name, itemAttributes ] ) =>
									createBlock( name, itemAttributes )
								)
							);
							const offcanvas = createBlock( 'blockish/offcanvas', {} );

							replaceInnerBlocks( clientId, [ navmenu, offcanvas ] );
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
			{ resizeListener }
			<Inspector { ...props } />
			<div { ...innerBlocksProps } />
		</div>
	);
}
