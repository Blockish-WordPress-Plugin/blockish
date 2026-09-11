import {
	useMemo,
	useState,
	useCallback,
	useEffect,
	memo,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { parse } from '@wordpress/blocks';
import { BlockPreview } from '@wordpress/block-editor';
import { Button, Modal, SearchControl, Spinner } from '@wordpress/components';
import { plus } from '@wordpress/icons';
import { useSelect } from '@wordpress/data';
import { EditorProvider } from '@wordpress/editor';
import {
	CLASS_CSS_REGEN_EVENT,
	fetchClassManagerCssBundle,
} from '../../extensions/class-manager/wrap-ai-preview';

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

function PreviewLoading() {
	return (
		<div
			className="page-templates-preview-field--loading megamenu-preview-field--loading"
			aria-busy="true"
			aria-live="polite"
		>
			<Spinner />
			<span className="megamenu-preview-field__loading-label">
				{ __( 'Loading preview…', 'blockish' ) }
			</span>
		</div>
	);
}

function MegamenuPreviewField( { item, classCss } ) {
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

	const rawContent = useMemo( () => {
		if ( typeof item?.content === 'string' ) {
			return item.content;
		}
		return item?.content?.raw || item?.content?.rendered || '';
	}, [ item ] );

	const blocks = useMemo( () => {
		if ( ! rawContent ) {
			return [];
		}
		return parse( rawContent );
	}, [ rawContent ] );

	if ( ! blocks.length ) {
		return (
			<div className="page-templates-preview-field--empty megamenu-preview-field--empty">
				{ __( 'Empty', 'blockish' ) }
			</div>
		);
	}

	return (
		<EditorProvider post={ item } settings={ settings }>
			<div
				className="page-templates-preview-field"
				style={ { backgroundColor } }
			>
				<BlockPreview.Async placeholder={ <PreviewLoading /> }>
					<BlockPreview blocks={ blocks } viewportWidth={ 1200 } />
				</BlockPreview.Async>
			</div>
		</EditorProvider>
	);
}

const MemoMegamenuPreviewField = memo( MegamenuPreviewField );

export default function MegamenuPickerModal( {
	items,
	hasResolved,
	currentId = 0,
	onApply,
	onCancel,
	onCreateNew,
} ) {
	const [ search, setSearch ] = useState( '' );
	const [ selectedId, setSelectedId ] = useState( currentId || 0 );
	const classCss = useClassManagerPreviewCss();

	const filtered = useMemo( () => {
		const query = search.trim().toLowerCase();
		const list = items || [];
		if ( ! query ) {
			return list;
		}
		return list.filter( ( item ) => {
			const title = ( item.title?.rendered || '' ).toLowerCase();
			return title.includes( query );
		} );
	}, [ items, search ] );

	return (
		<Modal
			title={ __( 'Select Mega Menu', 'blockish' ) }
			onRequestClose={ onCancel }
			className="blockish-megamenu-picker-modal"
		>
			<div className="blockish-megamenu-picker-modal__layout">
				<div className="blockish-megamenu-picker-modal__toolbar">
					<SearchControl
						value={ search }
						onChange={ setSearch }
						placeholder={ __( 'Search mega menus…', 'blockish' ) }
						__nextHasNoMarginBottom
					/>
				</div>

				<div className="blockish-megamenu-picker-modal__body">
					{ ! hasResolved ? (
						<div className="blockish-megamenu-picker-modal__loading">
							<Spinner />
						</div>
					) : null }

					{ hasResolved && filtered.length === 0 ? (
						<p className="blockish-megamenu-picker-modal__empty">
							{ __( 'No mega menus found.', 'blockish' ) }
						</p>
					) : null }

					{ hasResolved && filtered.length > 0 ? (
						<div className="blockish-megamenu-picker-modal__grid dataviews-view-grid">
							{ filtered.map( ( item ) => {
								const isSelected = selectedId === item.id;
								return (
									<button
										key={ item.id }
										type="button"
										className={ `blockish-megamenu-picker-card dataviews-view-grid__card${
											isSelected ? ' is-selected' : ''
										}` }
										onClick={ () =>
											setSelectedId( item.id )
										}
										onDoubleClick={ () => {
											setSelectedId( item.id );
											onApply( item.id );
										} }
										aria-pressed={ isSelected }
									>
										<div className="blockish-megamenu-picker-card__preview dataviews-view-grid__media">
											<MemoMegamenuPreviewField
												item={ item }
												classCss={ classCss }
											/>
										</div>
										<span className="blockish-megamenu-picker-card__title">
											{ item.title?.rendered ||
												__( '(Untitled)', 'blockish' ) }
										</span>
									</button>
								);
							} ) }
						</div>
					) : null }
				</div>

				<div className="blockish-megamenu-picker-modal__footer">
					<Button
						variant="secondary"
						icon={ plus }
						onClick={ onCreateNew }
					>
						{ __( 'Create new', 'blockish' ) }
					</Button>
					<div className="blockish-megamenu-picker-modal__footer-actions">
						<Button variant="tertiary" onClick={ onCancel }>
							{ __( 'Cancel', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							disabled={ ! selectedId }
							onClick={ () => onApply( selectedId ) }
						>
							{ __( 'Apply', 'blockish' ) }
						</Button>
					</div>
				</div>
			</div>
		</Modal>
	);
}
