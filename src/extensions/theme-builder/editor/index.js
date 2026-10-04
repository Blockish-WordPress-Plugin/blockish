/**
 * Theme Builder item editor chrome:
 * hide document title + strip post-like sidebar (rename / trash).
 * Parts: area + display conditions.
 */
import { registerPlugin } from '@wordpress/plugins';
import {
	PluginDocumentSettingPanel,
	store as editorStore,
} from '@wordpress/editor';
import { store as editPostStore } from '@wordpress/edit-post';
import { store as blockEditorStore } from '@wordpress/block-editor';
import { store as coreStore, useEntityRecords } from '@wordpress/core-data';
import {
	SelectControl,
	Spinner,
	Notice,
} from '@wordpress/components';
import { useSelect, useDispatch, dispatch, select, subscribe } from '@wordpress/data';
import { createPortal, useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import domReady from '@wordpress/dom-ready';
import { Button, Modal } from '@wordpress/components';
import { backup } from '@wordpress/icons';
import { getSchemaForSlug } from '../schema';
import { schemaToBlocks } from '../schema/schema-to-markup';
import {
	conditionsFromShowOn,
	firstAvailableShowOn,
	getPartPlacementMap,
	getShowOnSelectOptions,
	isShowOnTaken,
	isSlugBasedPartSlug,
	partPlacementKey,
	showOnFromConditions,
	showOnLabel,
	takenShowOnSummary,
} from '../utils/part-conditions';

const POST_TYPE = window.blockishThemeBuilder?.postType || 'blockish_tb';

const PANELS_TO_REMOVE = [
	'post-status',
	'featured-image',
	'post-excerpt',
	'discussion-panel',
	'template',
	'page-attributes',
];

const TITLE_BLOCK_NAMES = [ 'blockish/post-title', 'core/post-title' ];

const AREA_OPTIONS = [
	{ label: __( 'Header', 'blockish' ), value: 'header' },
	{ label: __( 'Footer', 'blockish' ), value: 'footer' },
];

function removeEditorPanels() {
	const stores = [ editPostStore, editorStore ];
	stores.forEach( ( store ) => {
		const actions = dispatch( store );
		if ( ! actions?.removeEditorPanel ) {
			return;
		}
		PANELS_TO_REMOVE.forEach( ( panel ) => {
			try {
				actions.removeEditorPanel( panel );
			} catch ( e ) {
				// Panel may not exist on this WP version.
			}
		} );
	} );
}

function stripTitleSupportFromPostType() {
	const type = select( coreStore ).getPostType( POST_TYPE );
	if ( ! type ) {
		return false;
	}
	if ( ! type.supports || ! type.supports.title ) {
		return true;
	}

	const next = {
		...type,
		supports: { ...type.supports },
	};
	delete next.supports.title;

	dispatch( coreStore ).receiveEntityRecords( 'root', 'postType', [ next ], {
		context: 'edit',
	} );
	return true;
}

function watchStripTitleSupport() {
	if ( stripTitleSupportFromPostType() ) {
		return;
	}
	const unsubscribe = subscribe( () => {
		if ( stripTitleSupportFromPostType() ) {
			unsubscribe();
		}
	} );
}

function stripTitleBlocks( blocks ) {
	return ( blocks || [] )
		.filter( ( block ) => ! TITLE_BLOCK_NAMES.includes( block.name ) )
		.map( ( block ) => ( {
			...block,
			innerBlocks: stripTitleBlocks( block.innerBlocks ),
		} ) );
}

function hasTitleBlock( blocks ) {
	return ( blocks || [] ).some(
		( block ) =>
			TITLE_BLOCK_NAMES.includes( block.name ) ||
			hasTitleBlock( block.innerBlocks )
	);
}

function prepareEditorChrome() {
	domReady( () => {
		removeEditorPanels();
		watchStripTitleSupport();
	} );
}

function usePageNoTitleCleanup( slug ) {
	const didRun = useRef( false );
	const { resetBlocks } = useDispatch( blockEditorStore );
	const blocks = useSelect(
		( sel ) => sel( blockEditorStore ).getBlocks(),
		[]
	);

	useEffect( () => {
		if ( didRun.current || slug !== 'page-no-title' ) {
			return;
		}
		if ( ! blocks?.length ) {
			return;
		}
		didRun.current = true;
		if ( ! hasTitleBlock( blocks ) ) {
			return;
		}
		resetBlocks( stripTitleBlocks( blocks ) );
	}, [ slug, blocks, resetBlocks ] );
}

function updateMeta( editPost, meta, patch ) {
	editPost( {
		meta: {
			...meta,
			...patch,
		},
	} );
}

function PartSettings( { meta, editPost, postId } ) {
	const area = meta.blockish_tb_area || 'header';
	const conditions = Array.isArray( meta.blockish_tb_conditions )
		? meta.blockish_tb_conditions
		: [ { type: 'include', rule: 'entire_site' } ];
	const showOn = showOnFromConditions( conditions );

	const { records } = useEntityRecords( 'postType', POST_TYPE, {
		per_page: -1,
		status: 'publish',
		context: 'edit',
	} );

	const placementMap = useMemo(
		() => getPartPlacementMap( records, postId ),
		[ records, postId ]
	);

	const showOnOptions = useMemo(
		() => getShowOnSelectOptions( area, placementMap, showOn ),
		[ area, placementMap, showOn ]
	);

	const conflict = placementMap.get( partPlacementKey( area, showOn ) );
	const takenSummary = takenShowOnSummary( area, placementMap, showOn );
	const knownAreas = AREA_OPTIONS.map( ( o ) => o.value );
	const areaOptions = knownAreas.includes( area )
		? AREA_OPTIONS
		: [
				...AREA_OPTIONS,
				{
					label: area.charAt( 0 ).toUpperCase() + area.slice( 1 ),
					value: area,
				},
		  ];

	const setArea = ( nextArea ) => {
		if ( ! nextArea || nextArea === area ) {
			return;
		}
		let nextShowOn = showOn;
		if ( isShowOnTaken( nextArea, showOn, placementMap ) ) {
			nextShowOn = firstAvailableShowOn( nextArea, placementMap );
		}
		if ( ! nextShowOn ) {
			return;
		}
		updateMeta( editPost, meta, {
			blockish_tb_area: nextArea,
			blockish_tb_conditions: conditionsFromShowOn( nextShowOn ),
		} );
	};

	const setShowOn = ( value ) => {
		if ( ! value || isShowOnTaken( area, value, placementMap ) ) {
			return;
		}
		updateMeta( editPost, meta, {
			blockish_tb_conditions: conditionsFromShowOn( value ),
		} );
	};

	return (
		<>
			<p className="blockish-tb-doc-panel__hint">
				{ __(
					'Each Area can only use a Show on location once. Locations already used by other parts are hidden from this list.',
					'blockish'
				) }
			</p>
			<div className="blockish-tb-doc-panel__row">
				<span className="blockish-tb-doc-panel__label">
					{ __( 'Area', 'blockish' ) }
				</span>
				<SelectControl
					value={ area }
					options={ areaOptions }
					onChange={ setArea }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</div>

			<div className="blockish-tb-doc-panel__row">
				<span className="blockish-tb-doc-panel__label">
					{ __( 'Show on', 'blockish' ) }
				</span>
				<SelectControl
					value={ showOn }
					options={
						showOnOptions.length
							? showOnOptions
							: [
									{
										label: showOnLabel( showOn ),
										value: showOn,
									},
							  ]
					}
					help={
						takenSummary.length
							? sprintf(
									/* translators: %s: list of taken locations */
									__( 'Already used: %s', 'blockish' ),
									takenSummary.join( '; ' )
							  )
							: __(
									'Where this part appears on the front end.',
									'blockish'
							  )
					}
					onChange={ setShowOn }
					__nextHasNoMarginBottom
					__next40pxDefaultSize
				/>
			</div>
			{ conflict ? (
				<Notice
					status="error"
					isDismissible={ false }
					className="blockish-tb-doc-panel__notice"
				>
					{ sprintf(
						/* translators: 1: show-on label, 2: existing part title */
						__(
							'Conflicts with “%2$s” (%1$s). Pick a free location or change Area before saving.',
							'blockish'
						),
						showOnLabel( showOn ),
						conflict.title
					) }
				</Notice>
			) : null }
		</>
	);
}

function RestoreDefaultControl( { kind, slug } ) {
	const [ isOpen, setIsOpen ] = useState( false );
	const { resetBlocks } = useDispatch( blockEditorStore );

	const defaultBlocks = useMemo( () => {
		if ( kind !== 'template' && kind !== 'part' ) {
			return [];
		}
		const schema = getSchemaForSlug( kind, slug || '' );
		if ( ! Array.isArray( schema ) || ! schema.length ) {
			return [];
		}
		return schemaToBlocks( schema );
	}, [ kind, slug ] );

	if ( ! defaultBlocks.length ) {
		return null;
	}

	const handleRestore = () => {
		resetBlocks( defaultBlocks );
		setIsOpen( false );
	};

	return (
		<>
			<div className="blockish-tb-doc-panel__restore">
				<Button
					variant="secondary"
					icon={ backup }
					onClick={ () => setIsOpen( true ) }
					__next40pxDefaultSize
				>
					{ __( 'Restore default', 'blockish' ) }
				</Button>
			</div>
			{ isOpen ? (
				<Modal
					title={ __( 'Restore default layout?', 'blockish' ) }
					onRequestClose={ () => setIsOpen( false ) }
					className="blockish-tb-restore-modal"
					size="small"
				>
					<p className="blockish-tb-restore-modal__text">
						{ __(
							'Replace all blocks with the starter layout for this type. Your current design will be lost.',
							'blockish'
						) }
					</p>
					<div className="blockish-tb-restore-modal__actions">
						<Button variant="tertiary" onClick={ () => setIsOpen( false ) }>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button variant="primary" isDestructive onClick={ handleRestore }>
							{ __( 'Restore', 'blockish' ) }
						</Button>
					</div>
				</Modal>
			) : null }
		</>
	);
}

function ThemeBuilderInfoPanel() {
	const { editPost } = useDispatch( editorStore );
	const { kind, slug, title, meta, postId } = useSelect( ( sel ) => {
		const m = sel( editorStore ).getEditedPostAttribute( 'meta' ) || {};
		const rawTitle = sel( editorStore ).getEditedPostAttribute( 'title' );
		return {
			kind: m.blockish_tb_kind || '',
			slug: m.blockish_tb_slug || '',
			meta: m,
			postId: sel( editorStore ).getCurrentPostId(),
			title:
				typeof rawTitle === 'string'
					? rawTitle
					: rawTitle?.raw || rawTitle?.rendered || '',
		};
	}, [] );

	usePageNoTitleCleanup( slug );

	const isPart = kind === 'part';
	const partCatalog = window.blockishThemeBuilder?.partSlugs || [];
	const isSlugBasedPart = isPart && isSlugBasedPartSlug( slug, partCatalog );
	const kindLabel = isPart
		? __( 'Template part', 'blockish' )
		: __( 'Template', 'blockish' );

	return (
		<PluginDocumentSettingPanel
			name="blockish-tb-info"
			title={ __( 'Theme Builder', 'blockish' ) }
			className="blockish-tb-doc-panel"
		>
			<div className="blockish-tb-doc-panel__row">
				<span className="blockish-tb-doc-panel__label">
					{ __( 'Type', 'blockish' ) }
				</span>
				<span>{ kindLabel }</span>
			</div>
			<div className="blockish-tb-doc-panel__row">
				<span className="blockish-tb-doc-panel__label">
					{ __( 'Slug', 'blockish' ) }
				</span>
				<code>{ slug || '—' }</code>
			</div>
			<div className="blockish-tb-doc-panel__row">
				<span className="blockish-tb-doc-panel__label">
					{ __( 'Name', 'blockish' ) }
				</span>
				<span>{ title || '—' }</span>
			</div>

			<RestoreDefaultControl kind={ kind } slug={ slug } />

			{ isSlugBasedPart ? (
				<p className="blockish-tb-doc-panel__hint">
					{ __(
						'WooCommerce loads this part by slug when a matching template asks for it (e.g. Checkout template → Checkout Header). Show on rules do not apply. Only one part per slug is used.',
						'blockish'
					) }
				</p>
			) : isPart ? (
				<PartSettings meta={ meta } editPost={ editPost } postId={ postId } />
			) : slug.startsWith( 'blockish-tb-' ) || slug === 'custom' ? (
				<p className="blockish-tb-doc-panel__hint">
					{ __(
						'Assign this layout on any post or page from the editor Template control (Page attributes). It only renders where you apply it.',
						'blockish'
					) }
				</p>
			) : (
				<p className="blockish-tb-doc-panel__hint">
					{ __(
						'Add Part slot blocks where header/footer (or other areas) should render. Parts only push into those slots when conditions match. Rename or delete from the Theme Builder list.',
						'blockish'
					) }
				</p>
			) }
		</PluginDocumentSettingPanel>
	);
}

/**
 * Full-screen loading overlay until the block editor canvas is ready.
 */
function ThemeBuilderCanvasLoading() {
	const isReady = useSelect(
		( sel ) => sel( editorStore ).__unstableIsEditorReady(),
		[]
	);

	useEffect( () => {
		document.body.classList.toggle( 'blockish-tb-editor-loading', ! isReady );
		return () => {
			document.body.classList.remove( 'blockish-tb-editor-loading' );
		};
	}, [ isReady ] );

	if ( isReady || typeof document === 'undefined' ) {
		return null;
	}

	return createPortal(
		<div
			className="blockish-tb-canvas-loading"
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<div className="blockish-tb-canvas-loading__card">
				<Spinner />
				<p className="blockish-tb-canvas-loading__label">
					{ __( 'Loading preview…', 'blockish' ) }
				</p>
			</div>
		</div>,
		document.body
	);
}

/**
 * Match Site Editor canvas behavior:
 * root blocks are always full-bleed; Align toolbar is hidden at the root.
 * Nested blocks inside a constrained parent still get wide/full controls.
 */
function ThemeBuilderRootCanvas() {
	const { isRootSelected, rootClientIds } = useSelect( ( sel ) => {
		const selectedId = sel( blockEditorStore ).getSelectedBlockClientId();
		const roots = sel( blockEditorStore ).getBlockOrder() || [];
		const rootClientId = selectedId
			? sel( blockEditorStore ).getBlockRootClientId( selectedId )
			: null;
		return {
			isRootSelected: !! selectedId && ! rootClientId,
			rootClientIds: roots,
		};
	}, [] );

	const { updateBlockAttributes } = useDispatch( blockEditorStore );
	const didStripAlign = useRef( false );

	useEffect( () => {
		document.body.classList.toggle(
			'blockish-tb-root-selected',
			isRootSelected
		);
		return () => {
			document.body.classList.remove( 'blockish-tb-root-selected' );
		};
	}, [ isRootSelected ] );

	// One-shot: drop leftover align on root blocks (Site Editor root has none).
	useEffect( () => {
		if ( didStripAlign.current || ! rootClientIds.length ) {
			return;
		}
		didStripAlign.current = true;
		rootClientIds.forEach( ( clientId ) => {
			const attrs =
				select( blockEditorStore ).getBlockAttributes( clientId ) || {};
			if ( attrs.align ) {
				updateBlockAttributes( clientId, { align: undefined } );
			}
		} );
	}, [ rootClientIds, updateBlockAttributes ] );

	return null;
}

function ThemeBuilderEditorChrome() {
	return (
		<>
			<ThemeBuilderCanvasLoading />
			<ThemeBuilderRootCanvas />
			<ThemeBuilderInfoPanel />
		</>
	);
}

/**
 * Template/part editor chrome — document panel, title strip, loading overlay.
 */
export function mountEditor() {
	prepareEditorChrome();
	registerPlugin( 'blockish-theme-builder-editor', {
		render: ThemeBuilderEditorChrome,
	} );
}
