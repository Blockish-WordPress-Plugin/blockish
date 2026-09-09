import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	RecursionProvider,
	useHasRecursion,
	Warning,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import {
	Placeholder,
	Spinner,
	ToolbarButton,
	ToolbarGroup,
} from '@wordpress/components';
import { useSelect, useDispatch } from '@wordpress/data';
import {
	store as coreStore,
	useEntityRecord,
	useEntityBlockEditor,
} from '@wordpress/core-data';
import { __ } from '@wordpress/i18n';
import { useEffect, useState, useMemo, useRef } from '@wordpress/element';
import { plus, replace } from '@wordpress/icons';
import clsx from 'clsx';
import Inspector from './inspector';
import MegamenuPickerModal from './megamenu-picker-modal';
import CreateMegamenuFlow from './create-megamenu-flow';
import { scheduleNavmenuSubmenuPosition } from '../navmenu-item/position-submenu';
import './editor.scss';

function repositionHostFromMegamenuNode( node ) {
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

const NOOP = () => {};

const MEGAMENUS_QUERY = {
	per_page: -1,
	status: 'publish',
	orderby: 'title',
	order: 'asc',
	context: 'edit',
};
const MEGAMENUS_SELECTOR_ARGS = [
	'postType',
	'blockish_megamenu',
	MEGAMENUS_QUERY,
];

function getMegamenuEditUrl( id ) {
	return `post.php?post=${ encodeURIComponent( id ) }&action=edit`;
}

/**
 * Mirror core/block and blockish-forms synced behavior:
 * Gutenberg auto-sets children of `core/block` to editingMode "disabled".
 * We apply the same modes so the editor does not track active editing states
 * for inner preview blocks.
 */
function useDisableInnerBlockEditing( clientId, enabled ) {
	const { setBlockEditingMode, unsetBlockEditingMode } =
		useDispatch( blockEditorStore );

	const descendantIds = useSelect(
		( select ) => {
			if ( ! enabled || ! clientId ) {
				return [];
			}
			return (
				select( blockEditorStore ).getClientIdsOfDescendants(
					clientId
				) || []
			);
		},
		[ clientId, enabled ]
	);

	const descendantKey = descendantIds.join( ',' );

	useEffect( () => {
		if ( ! enabled || ! descendantIds.length ) {
			return undefined;
		}

		descendantIds.forEach( ( id ) => {
			setBlockEditingMode( id, 'disabled' );
		} );

		return () => {
			descendantIds.forEach( ( id ) => {
				unsetBlockEditingMode( id );
			} );
		};
	}, [
		enabled,
		descendantKey,
		setBlockEditingMode,
		unsetBlockEditingMode,
	] );
}

function RecursionWarning() {
	const blockProps = useBlockProps( {
		className: 'blockish-navmenu-megamenu',
	} );
	return (
		<div { ...blockProps }>
			<Warning>
				{ __(
					'Mega Menu cannot be rendered inside itself.',
					'blockish'
				) }
			</Warning>
		</div>
	);
}

function MegamenuToolbar( {
	canEdit,
	megamenuId,
	editOriginalUrl,
	onReplace,
	onCreateNew,
} ) {
	return (
		<>
			{ canEdit && megamenuId ? (
				<BlockControls group="other">
					<ToolbarGroup>
						<ToolbarButton
							href={ editOriginalUrl }
							target="_blank"
							rel="noopener noreferrer"
						>
							{ __( 'Edit original', 'blockish' ) }
						</ToolbarButton>
					</ToolbarGroup>
				</BlockControls>
			) : null }

			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ replace }
						label={ __( 'Replace Mega Menu', 'blockish' ) }
						onClick={ onReplace }
					>
						{ __( 'Replace', 'blockish' ) }
					</ToolbarButton>
					<ToolbarButton
						icon={ plus }
						label={ __( 'Create new Mega Menu', 'blockish' ) }
						onClick={ onCreateNew }
					>
						{ __( 'Create new', 'blockish' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>
		</>
	);
}

function MegamenuEdit( {
	attributes,
	setAttributes,
	advancedControls,
	clientId,
} ) {
	const {
		megamenuId,
		widthMode,
		positionAlign,
		alignRelativeTo,
		customWidth,
		offsetY,
		offsetX,
	} = attributes;
	const [ isPickerOpen, setIsPickerOpen ] = useState( false );
	const [ isCreateOpen, setIsCreateOpen ] = useState( false );

	const widthModeValue =
		typeof widthMode === 'string'
			? widthMode
			: widthMode?.value || 'navigation';

	const { record, hasResolved: hasRecordResolved } = useEntityRecord(
		'postType',
		'blockish_megamenu',
		megamenuId || undefined
	);

	const editorOptions = useMemo(
		() => ( { id: megamenuId || undefined } ),
		[ megamenuId ]
	);

	const [ blocks ] = useEntityBlockEditor(
		'postType',
		'blockish_megamenu',
		editorOptions
	);

	const isMissing = !! megamenuId && hasRecordResolved && ! record;

	useDisableInnerBlockEditing(
		clientId,
		Boolean( megamenuId && hasRecordResolved && ! isMissing )
	);

	const { canUserEdit } = useSelect(
		( select ) => {
			return {
				canUserEdit: megamenuId
					? !! select( coreStore ).canUser( 'update', {
							kind: 'postType',
							name: 'blockish_megamenu',
							id: megamenuId,
					  } )
					: false,
			};
		},
		[ megamenuId ]
	);

	const { megamenus, hasMegamenusResolved } = useSelect(
		( select ) => {
			// Full list is only needed for the picker modal.
			if ( ! isPickerOpen ) {
				return {
					megamenus: [],
					hasMegamenusResolved: true,
				};
			}
			const core = select( coreStore );
			return {
				megamenus:
					core.getEntityRecords( ...MEGAMENUS_SELECTOR_ARGS ) || [],
				hasMegamenusResolved: core.hasFinishedResolution(
					'getEntityRecords',
					MEGAMENUS_SELECTOR_ARGS
				),
			};
		},
		[ isPickerOpen ]
	);

	const selectedTitle = record?.title?.rendered || '';

	const serializeAttr = ( attr ) => {
		if ( attr == null || attr === '' ) {
			return '';
		}
		if ( typeof attr === 'string' || typeof attr === 'number' ) {
			return String( attr );
		}
		if ( typeof attr !== 'object' ) {
			return '';
		}
		// Flat RangeUnit: { value, unit }.
		if ( Object.prototype.hasOwnProperty.call( attr, 'value' ) ) {
			if ( attr.value == null || attr.value === '' ) {
				return '';
			}
			return `${ attr.value }${ attr.unit != null ? attr.unit : '' }`;
		}
		// Responsive: { Desktop: { value, unit } | string }.
		const device =
			attr.Desktop ?? attr.desktop ?? Object.values( attr )[ 0 ];
		if ( device == null || device === '' ) {
			return '';
		}
		if ( typeof device === 'string' || typeof device === 'number' ) {
			return String( device );
		}
		if ( typeof device === 'object' && device.value != null && device.value !== '' ) {
			return `${ device.value }${ device.unit != null ? device.unit : '' }`;
		}
		return '';
	};

	const customWidthStr = serializeAttr( customWidth );
	const offsetYStr = serializeAttr( offsetY );
	const offsetXStr = serializeAttr( offsetX );

	const normalizedWidthMode = [ 'navigation', 'full', 'custom' ].includes(
		widthModeValue
	)
		? widthModeValue
		: 'navigation';

	const megamenuNodeRef = useRef( null );

	// Ref (not document.getElementById) — canvas lives in an iframe.
	// Deps are serialized attr values so RangeUnit object identity does not miss updates.
	useEffect( () => {
		const node = megamenuNodeRef.current;
		if ( ! node ) {
			return undefined;
		}

		const win = node.ownerDocument?.defaultView || window;
		let raf2 = 0;
		const raf1 = win.requestAnimationFrame( () => {
			raf2 = win.requestAnimationFrame( () => {
				repositionHostFromMegamenuNode( node );
			} );
		} );

		return () => {
			win.cancelAnimationFrame( raf1 );
			win.cancelAnimationFrame( raf2 );
		};
	}, [
		normalizedWidthMode,
		positionAlign,
		alignRelativeTo,
		customWidthStr,
		offsetYStr,
		offsetXStr,
	] );

	const blockProps = useBlockProps( {
		ref: megamenuNodeRef,
		className: clsx(
			'blockish-navmenu-megamenu',
			`is-width-${ normalizedWidthMode }`
		),
		'data-width-mode': normalizedWidthMode,
		'data-position-align': positionAlign || 'left',
		'data-align-relative-to': alignRelativeTo || 'navigation',
		'data-custom-width': customWidthStr,
		'data-offset-y': offsetYStr,
		'data-offset-x': offsetXStr,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		value: blocks,
		onInput: NOOP,
		onChange: NOOP,
		templateLock: 'all',
		renderAppender: false,
	} );

	const openPicker = () => {
		setIsCreateOpen( false );
		setIsPickerOpen( true );
	};

	const openCreate = () => {
		setIsPickerOpen( false );
		setIsCreateOpen( true );
	};

	const applyMegamenu = ( id ) => {
		setAttributes( { megamenuId: id } );
		setIsPickerOpen( false );
	};

	const handleCreated = ( megamenu ) => {
		if ( ! megamenu?.id ) {
			return;
		}
		setAttributes( { megamenuId: megamenu.id } );
		setIsCreateOpen( false );
	};

	let children = null;

	if ( ! megamenuId ) {
		children = (
			<Placeholder
				icon="columns"
				label={ __( 'Blockish Mega Menu', 'blockish' ) }
				instructions={ __(
					'Choose a mega menu to embed in this navigation item.',
					'blockish'
				) }
			>
				<button
					type="button"
					className="components-button is-primary"
					onClick={ openPicker }
				>
					{ __( 'Select Mega Menu', 'blockish' ) }
				</button>
			</Placeholder>
		);
	} else if ( isMissing ) {
		children = (
			<Warning>
				{ __(
					'The selected Mega Menu has been deleted or is unavailable.',
					'blockish'
				) }
			</Warning>
		);
	} else if ( ! hasRecordResolved ) {
		children = (
			<Placeholder>
				<Spinner />
			</Placeholder>
		);
	}

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
				selectedTitle={ selectedTitle }
				hasResolved={ hasRecordResolved }
				onOpenPicker={ openPicker }
			/>

			{ megamenuId && ! isMissing ? (
				<MegamenuToolbar
					canEdit={ canUserEdit }
					megamenuId={ megamenuId }
					editOriginalUrl={ getMegamenuEditUrl( megamenuId ) }
					onReplace={ openPicker }
					onCreateNew={ openCreate }
				/>
			) : (
				<MegamenuToolbar
					canEdit={ false }
					onReplace={ openPicker }
					onCreateNew={ openCreate }
				/>
			) }

			{ children === null ? (
				<div { ...innerBlocksProps } />
			) : (
				<div { ...blockProps }>{ children }</div>
			) }

			{ isPickerOpen ? (
				<MegamenuPickerModal
					items={ megamenus }
					hasResolved={ hasMegamenusResolved }
					currentId={ megamenuId }
					onApply={ applyMegamenu }
					onCancel={ () => setIsPickerOpen( false ) }
					onCreateNew={ openCreate }
				/>
			) : null }

			{ isCreateOpen ? (
				<CreateMegamenuFlow
					onCancel={ () => {
						setIsCreateOpen( false );
						if ( ! megamenuId ) {
							setIsPickerOpen( true );
						}
					} }
					onSuccess={ handleCreated }
				/>
			) : null }
		</>
	);
}

export default function Edit( props ) {
	const { megamenuId } = props.attributes;
	const hasAlreadyRendered = useHasRecursion( megamenuId );

	if ( megamenuId && hasAlreadyRendered ) {
		return <RecursionWarning />;
	}

	return (
		<RecursionProvider uniqueId={ megamenuId || 'blockish-megamenu-empty' }>
			<MegamenuEdit { ...props } />
		</RecursionProvider>
	);
}
