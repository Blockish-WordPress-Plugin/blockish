import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import Inspector from './inspector';
import { scheduleNavmenuSubmenuPosition } from '../navmenu-item/position-submenu';
import './editor.scss';

const TEMPLATE = [
	[
		'blockish/navmenu-item',
		{
			label: __( 'Submenu Item', 'blockish' ),
			url: '#',
		},
	],
];

function serializeAttr( attr ) {
	if ( attr == null || attr === '' ) {
		return '';
	}
	if ( typeof attr === 'string' || typeof attr === 'number' ) {
		return String( attr );
	}
	if ( typeof attr !== 'object' ) {
		return '';
	}
	if ( Object.prototype.hasOwnProperty.call( attr, 'value' ) ) {
		if ( attr.value == null || attr.value === '' ) {
			return '';
		}
		return `${ attr.value }${ attr.unit != null ? attr.unit : '' }`;
	}
	const device = attr.Desktop ?? attr.desktop ?? Object.values( attr )[ 0 ];
	if ( device == null || device === '' ) {
		return '';
	}
	if ( typeof device === 'string' || typeof device === 'number' ) {
		return String( device );
	}
	if (
		typeof device === 'object' &&
		device.value != null &&
		device.value !== ''
	) {
		return `${ device.value }${ device.unit != null ? device.unit : '' }`;
	}
	return '';
}

function repositionHostFromSubmenuNode( node ) {
	if ( node?.closest?.( '.blockish-offcanvas' ) ) {
		return;
	}
	const hostItem = node?.closest?.(
		'.blockish-block-navmenu-item, .wp-block-blockish-navmenu-item'
	);
	if ( hostItem ) {
		scheduleNavmenuSubmenuPosition( hostItem );
	}
}

export default function Edit( {
	attributes,
	advancedControls,
	setAttributes,
	clientId,
	...props
} ) {
	const { positionAlign, offsetY, offsetX } = attributes;
	const offsetYStr = serializeAttr( offsetY );
	const offsetXStr = serializeAttr( offsetX );
	const submenuNodeRef = useRef( null );

	const isInOffcanvas = useSelect(
		( select ) => {
			const { getBlockParents, getBlockName } = select( blockEditorStore );
			return getBlockParents( clientId ).some(
				( id ) => getBlockName( id ) === 'blockish/offcanvas'
			);
		},
		[ clientId ]
	);

	useEffect( () => {
		if ( isInOffcanvas ) {
			return undefined;
		}
		const node = submenuNodeRef.current;
		if ( ! node ) {
			return undefined;
		}

		const win = node.ownerDocument?.defaultView || window;
		let raf2 = 0;
		const raf1 = win.requestAnimationFrame( () => {
			raf2 = win.requestAnimationFrame( () => {
				repositionHostFromSubmenuNode( node );
			} );
		} );

		return () => {
			win.cancelAnimationFrame( raf1 );
			win.cancelAnimationFrame( raf2 );
		};
	}, [ positionAlign, offsetYStr, offsetXStr, isInOffcanvas ] );

	const blockProps = useBlockProps( {
		ref: submenuNodeRef,
		className: 'blockish-navmenu-submenu',
		'data-position-align': positionAlign || 'left',
		'data-offset-y': offsetYStr,
		'data-offset-x': offsetXStr,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-navmenu-submenu__list' },
		{
			allowedBlocks: [ 'blockish/navmenu-item' ],
			template: TEMPLATE,
			orientation: 'vertical',
		}
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
				isInOffcanvas={ isInOffcanvas }
				{ ...props }
			/>
			<div { ...blockProps }>
				<div className="blockish-navmenu-submenu__panel">
					<ul { ...innerBlocksProps } />
				</div>
			</div>
		</>
	);
}
