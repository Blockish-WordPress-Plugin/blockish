import {
	useMemo,
	useState,
	memo,
	useCallback,
	useEffect,
} from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import {
	Button,
	Modal,
	SearchControl,
	Spinner,
	Icon,
} from '@wordpress/components';
import { plus, trash, external, update, columns } from '@wordpress/icons';
import { useSelect, useDispatch } from '@wordpress/data';
import { store as coreStore } from '@wordpress/core-data';
import { addFilter } from '@wordpress/hooks';
import { EditorProvider } from '@wordpress/editor';
import {
	CLASS_CSS_REGEN_EVENT,
	fetchClassManagerCssBundle,
} from '../../extensions/class-manager/wrap-ai-preview';
import CreateMegamenuFlow from './create-megamenu-flow';
import './settings-tab.scss';

const useClassManagerPreviewCss = () => {
	const [ classCss, setClassCss ] = useState( '' );

	const loadCss = useCallback( async () => {
		try {
			const bundle = await fetchClassManagerCssBundle( 0 );
			setClassCss( typeof bundle?.css === 'string' ? bundle.css : '' );
		} catch ( _err ) {
			// silent fallback
		}
	}, [] );

	useEffect( () => {
		loadCss();
		const onRegen = () => {
			loadCss();
		};
		window.addEventListener( CLASS_CSS_REGEN_EVENT, onRegen );
		return () => {
			window.removeEventListener( CLASS_CSS_REGEN_EVENT, onRegen );
		};
	}, [ loadCss ] );

	return classCss;
};

function PreviewField( { item, classCss } ) {
	const editorSettings = useSelect( ( select ) => {
		return (
			select( 'core/block-editor' )?.getSettings?.() ||
			select( 'core/editor' )?.getEditorSettings?.() ||
			{}
		);
	}, [] );

	const settings = useMemo( () => {
		const baseStyles = Array.isArray( editorSettings.styles )
			? [ ...editorSettings.styles ]
			: [];
		if ( classCss ) {
			baseStyles.push( { css: classCss } );
		}
		return {
			...editorSettings,
			styles: baseStyles,
			isPreviewMode: true,
		};
	}, [ editorSettings, classCss ] );

	const backgroundColor = useMemo( () => {
		return editorSettings?.colors?.background || 'white';
	}, [ editorSettings ] );

	const blocks = useMemo( () => {
		const raw =
			item?.content?.raw ??
			( typeof item?.content === 'string'
				? item.content
				: item?.content?.rendered || '' );
		return raw ? parse( raw ) : [];
	}, [ item?.content?.raw, item?.content ] );

	const isEmpty = ! blocks?.length;

	// Wrap everything in a block editor provider to ensure 'styles' that are needed
	// for the previews are synced between the site editor store and the block editor store.
	return (
		<EditorProvider post={ item } settings={ settings }>
			<div
				className="page-templates-preview-field"
				style={ { backgroundColor } }
			>
				{ isEmpty && __( 'Empty template', 'blockish' ) }
				{ ! isEmpty && (
					<BlockPreview.Async>
						<BlockPreview blocks={ blocks } />
					</BlockPreview.Async>
				) }
			</div>
		</EditorProvider>
	);
}

const MemoPreviewField = memo( PreviewField );

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

function MegamenuSettingsTab() {
	const [ search, setSearch ] = useState( '' );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ deletingItem, setDeletingItem ] = useState( null );
	const [ isDeleting, setIsDeleting ] = useState( false );

	const { deleteEntityRecord, invalidateResolution } =
		useDispatch( coreStore );
	const classCss = useClassManagerPreviewCss();

	const { items: megamenus, hasResolved } = useSelect( ( select ) => {
		const { getEntityRecords, hasFinishedResolution } = select( coreStore );
		return {
			items: getEntityRecords( ...MEGAMENUS_SELECTOR_ARGS ),
			hasResolved: hasFinishedResolution(
				'getEntityRecords',
				MEGAMENUS_SELECTOR_ARGS
			),
		};
	}, [] );

	const list = useMemo( () => {
		return Array.isArray( megamenus ) ? megamenus : [];
	}, [ megamenus ] );

	const filtered = useMemo( () => {
		const q = search.trim().toLowerCase();
		if ( ! q ) {
			return list;
		}
		return list.filter( ( item ) => {
			const title = ( item.title?.rendered || '' ).toLowerCase();
			return title.includes( q ) || String( item.id ).includes( q );
		} );
	}, [ list, search ] );

	const handleRefresh = () => {
		invalidateResolution( 'getEntityRecords', MEGAMENUS_SELECTOR_ARGS );
	};

	const handleCreateSuccess = ( newMegamenu ) => {
		setIsCreating( false );
		handleRefresh();
		if ( newMegamenu?.id ) {
			window.open( getMegamenuEditUrl( newMegamenu.id ), '_blank' );
		}
	};

	const confirmDelete = async () => {
		if ( ! deletingItem?.id ) {
			return;
		}
		setIsDeleting( true );
		try {
			await deleteEntityRecord(
				'postType',
				'blockish_megamenu',
				deletingItem.id,
				{ force: true }
			);
			setDeletingItem( null );
			handleRefresh();
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( 'Failed to delete mega menu:', err );
		} finally {
			setIsDeleting( false );
		}
	};

	return (
		<div className="blockish-settings-megamenus">
			<div className="blockish-settings-megamenus__toolbar">
				<div className="blockish-settings-megamenus__toolbar-left">
					<h2 className="blockish-settings-megamenus__title">
						{ __( 'Mega Menus', 'blockish' ) }
					</h2>
					{ hasResolved && (
						<span className="blockish-settings-megamenus__badge">
							{ list.length }
						</span>
					) }
				</div>

				<div className="blockish-settings-megamenus__toolbar-right">
					<SearchControl
						className="blockish-settings-megamenus__search"
						value={ search }
						onChange={ setSearch }
						placeholder={ __( 'Search mega menus…', 'blockish' ) }
						__nextHasNoMarginBottom
					/>
					<Button
						variant="secondary"
						icon={ update }
						onClick={ handleRefresh }
						label={ __( 'Refresh list', 'blockish' ) }
					/>
					<Button
						variant="primary"
						icon={ plus }
						onClick={ () => setIsCreating( true ) }
					>
						{ __( 'Add New', 'blockish' ) }
					</Button>
				</div>
			</div>

			<div className="blockish-settings-megamenus__body">
				{ ! hasResolved ? (
					<div className="blockish-settings-megamenus__loading">
						<Spinner />
					</div>
				) : null }

				{ hasResolved && filtered.length === 0 ? (
					<div className="blockish-settings-megamenus__empty">
						<div className="blockish-settings-megamenus__empty-icon">
							<Icon icon={ columns } size={ 32 } />
						</div>
						<h3 className="blockish-settings-megamenus__empty-title">
							{ list.length === 0
								? __( 'No mega menus created yet', 'blockish' )
								: __(
										'No matching mega menus found',
										'blockish'
								  ) }
						</h3>
						<p className="blockish-settings-megamenus__empty-description">
							{ list.length === 0
								? __(
										'Create flexible, multi-column mega menu layouts and connect them to your navigation menu items.',
										'blockish'
								  )
								: __(
										'Try searching for a different keyword or clear the search field.',
										'blockish'
								  ) }
						</p>
						{ list.length === 0 && (
							<Button
								variant="primary"
								icon={ plus }
								onClick={ () => setIsCreating( true ) }
							>
								{ __(
									'Create your first Mega Menu',
									'blockish'
								) }
							</Button>
						) }
					</div>
				) : null }

				{ hasResolved && filtered.length > 0 ? (
					<div className="blockish-settings-megamenus__grid dataviews-view-grid">
						{ filtered.map( ( item ) => {
							const title =
								item.title?.rendered ||
								__( '(Untitled)', 'blockish' );
							const editUrl = getMegamenuEditUrl( item.id );

							return (
								<article
									key={ item.id }
									className="dataviews-view-grid__card blockish-settings-megamenus__card"
								>
									<div className="dataviews-view-grid__media blockish-settings-megamenus__media">
										<a
											href={ editUrl }
											target="_blank"
											rel="noopener noreferrer"
											className="blockish-settings-megamenus__preview-link"
											title={ sprintf(
												/* translators: %s: mega menu title */
												__(
													'Edit %s in new tab',
													'blockish'
												),
												title
											) }
										>
											<MemoPreviewField
												item={ item }
												classCss={ classCss }
											/>
										</a>

										<div className="dataviews-view-grid__media-actions blockish-settings-megamenus__media-actions">
											<Button
												size="compact"
												variant="tertiary"
												icon={ external }
												href={ editUrl }
												target="_blank"
												rel="noopener noreferrer"
												label={ __(
													'Edit in new tab',
													'blockish'
												) }
												showTooltip
											/>
											<Button
												size="compact"
												variant="tertiary"
												isDestructive
												icon={ trash }
												label={ __(
													'Delete',
													'blockish'
												) }
												onClick={ ( e ) => {
													e.preventDefault();
													e.stopPropagation();
													setDeletingItem( item );
												} }
												showTooltip
											/>
										</div>
									</div>

									<div className="dataviews-view-grid__title-actions blockish-settings-megamenus__title-actions">
										<a
											href={ editUrl }
											target="_blank"
											rel="noopener noreferrer"
											className="dataviews-view-grid__title-field blockish-settings-megamenus__title-field"
											title={ title }
										>
											{ title }
										</a>
									</div>

									<div className="dataviews-view-grid__fields blockish-settings-megamenus__fields">
										<span className="blockish-settings-megamenus__card-meta">
											{ sprintf(
												/* translators: %d: mega menu post ID */
												__( 'ID: #%d', 'blockish' ),
												item.id
											) }
										</span>
									</div>
								</article>
							);
						} ) }
					</div>
				) : null }
			</div>

			{ isCreating && (
				<CreateMegamenuFlow
					onCancel={ () => setIsCreating( false ) }
					onSuccess={ handleCreateSuccess }
				/>
			) }

			{ deletingItem && (
				<Modal
					title={ __( 'Delete Mega Menu', 'blockish' ) }
					onRequestClose={ () =>
						! isDeleting && setDeletingItem( null )
					}
					className="blockish-delete-modal"
					size="small"
				>
					<p className="blockish-delete-modal__lead">
						{ sprintf(
							/* translators: %s: mega menu title */
							__(
								'Are you sure you want to permanently delete "%s"? This action cannot be undone.',
								'blockish'
							),
							deletingItem.title?.rendered ||
								__( '(Untitled)', 'blockish' )
						) }
					</p>
					<div className="blockish-delete-modal__actions">
						<Button
							variant="tertiary"
							disabled={ isDeleting }
							onClick={ () => setDeletingItem( null ) }
						>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							isDestructive
							disabled={ isDeleting }
							onClick={ confirmDelete }
						>
							{ isDeleting
								? __( 'Deleting…', 'blockish' )
								: __( 'Delete', 'blockish' ) }
						</Button>
					</div>
				</Modal>
			) }
		</div>
	);
}

addFilter(
	'blockish.editorSettingsTabs',
	'blockish/megamenus',
	( tabs ) => {
		tabs.push( {
			name: 'megamenus',
			title: __( 'Mega Menus', 'blockish' ),
			description: __(
				'Manage and preview mega menu layouts.',
				'blockish'
			),
			render: MegamenuSettingsTab,
		} );
		return tabs;
	},
	15
);

export default MegamenuSettingsTab;
