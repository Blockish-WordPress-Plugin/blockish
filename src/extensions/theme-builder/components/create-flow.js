import { useMemo, useState, useRef } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { store as coreStore, useEntityRecords } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import { getInitialContent } from '../schema';
import {
	conditionsFromShowOn,
	firstAvailableShowOn,
	getMeta,
	getPartPlacementMap,
	getShowOnSelectOptions,
	isShowOnTaken,
	partPlacementKey,
	showOnLabel,
	suggestPartName,
	takenShowOnSummary,
} from '../utils/part-conditions';
import {
	Button,
	Modal,
	TextControl,
	SelectControl,
	Icon,
	Spinner,
	Notice,
} from '@wordpress/components';
import {
	page,
	people,
	category,
	calendar,
	tag,
	postList,
	home,
	archive,
	search,
	notFound,
	layout,
	header,
	footer,
	pencil,
	media,
	navigation,
	cart,
} from '@wordpress/icons';

const ICON_MAP = {
	page,
	author: people,
	category,
	date: calendar,
	tag,
	post: postList,
	home,
	archive,
	search,
	notFound,
	layout,
	header,
	footer,
	custom: pencil,
	media,
	'navigation-overlay': navigation,
	cart,
};

const DEFAULT_CONDITIONS = [ { type: 'include', rule: 'entire_site' } ];

function areaFromPartSlug( slug ) {
	if ( slug === 'header' ) {
		return 'header';
	}
	if ( slug === 'footer' ) {
		return 'footer';
	}
	return slug || 'header';
}

export default function CreateFlow( { kind = 'template', onCancel, onSuccess } ) {
	const config = window.blockishThemeBuilder || {};
	const postType = config.postType || 'blockish_tb';
	const libraryId = config.libraryId || 0;
	const options =
		kind === 'part' ? config.partSlugs || [] : config.templateSlugs || [];

	const [ selected, setSelected ] = useState( null );
	const [ customTitle, setCustomTitle ] = useState( '' );
	const [ partTitle, setPartTitle ] = useState( '' );
	const [ partShowOn, setPartShowOn ] = useState( 'entire_site' );
	const [ nameTouched, setNameTouched ] = useState( false );
	const [ isCreating, setIsCreating ] = useState( false );
	const [ error, setError ] = useState( '' );
	const suggestedNameRef = useRef( '' );
	const { saveEntityRecord } = useDispatch( coreStore );

	const { records, hasResolved } = useEntityRecords( 'postType', postType, {
		per_page: -1,
		status: 'publish',
		context: 'edit',
	} );

	const placementMap = useMemo(
		() => ( kind === 'part' ? getPartPlacementMap( records, libraryId ) : new Map() ),
		[ records, libraryId, kind ]
	);

	const partArea = useMemo(
		() => ( selected ? areaFromPartSlug( selected.slug ) : 'header' ),
		[ selected ]
	);

	const showOnOptions = useMemo(
		() => getShowOnSelectOptions( partArea, placementMap ),
		[ partArea, placementMap ]
	);

	const takenAtShowOn = placementMap.get(
		partPlacementKey( partArea, partShowOn )
	);

	const takenSummary = useMemo(
		() => takenShowOnSummary( partArea, placementMap ),
		[ partArea, placementMap ]
	);

	const allLocationsTaken = useMemo(
		() => firstAvailableShowOn( partArea, placementMap ) === null,
		[ partArea, placementMap ]
	);

	const usedSlugs = useMemo( () => {
		const set = new Set();
		( records || [] ).forEach( ( item ) => {
			if ( libraryId && item.id === libraryId ) {
				return;
			}
			if ( getMeta( item, 'blockish_tb_kind' ) !== kind ) {
				return;
			}
			const slug = getMeta( item, 'blockish_tb_slug' );
			if ( kind === 'part' ) {
				// WooCommerce parts: one override per catalog slug (resolved by slug).
				const catalogRow = options.find(
					( row ) => row.slug === slug && row.group === 'woocommerce'
				);
				if ( catalogRow ) {
					set.add( slug );
				}
				return;
			}
			// Hierarchy types are unique; custom can be created many times.
			if ( slug && slug !== 'custom' && slug !== 'shell' ) {
				set.add( slug );
			}
		} );
		return set;
	}, [ records, libraryId, kind, options ] );

	const standardOptions = useMemo(
		() =>
			options.filter(
				( row ) =>
					row.slug !== 'custom' &&
					row.group !== 'theme' &&
					row.group !== 'woocommerce' &&
					! usedSlugs.has( row.slug )
			),
		[ options, usedSlugs ]
	);
	const woocommerceOptions = useMemo(
		() =>
			options.filter(
				( row ) => row.group === 'woocommerce' && ! usedSlugs.has( row.slug )
			),
		[ options, usedSlugs ]
	);
	const themeOptions = useMemo(
		() =>
			options.filter(
				( row ) => row.group === 'theme' && ! usedSlugs.has( row.slug )
			),
		[ options, usedSlugs ]
	);
	const customOption = useMemo(
		() => options.find( ( row ) => row.slug === 'custom' ),
		[ options ]
	);

	const isPartDetails = kind === 'part' && !! selected;
	const needsTemplateTitle = kind !== 'part' && selected?.slug === 'custom';
	const nothingLeft =
		hasResolved &&
		standardOptions.length === 0 &&
		woocommerceOptions.length === 0 &&
		themeOptions.length === 0 &&
		! customOption;

	const createItem = async ( row, titleOverride, conditionsOverride ) => {
		const title = ( titleOverride || row.label || '' ).trim();
		if ( ! title || ! row?.slug ) {
			setError(
				kind === 'part'
					? __( 'Please enter a name for this part.', 'blockish' )
					: __( 'Please choose a template type.', 'blockish' )
			);
			return;
		}

		if ( kind !== 'part' && row.slug !== 'custom' && usedSlugs.has( row.slug ) ) {
			setError(
				__( 'This template type already exists. Only one is allowed.', 'blockish' )
			);
			return;
		}

		setIsCreating( true );
		setError( '' );

		try {
			const meta = {
				blockish_tb_kind: kind,
				blockish_tb_slug: row.slug,
				blockish_tb_active: true,
			};

			if ( kind === 'part' ) {
				meta.blockish_tb_area =
					row.group === 'woocommerce' ? row.slug : areaFromPartSlug( row.slug );
				if ( row.group !== 'woocommerce' ) {
					meta.blockish_tb_conditions =
						Array.isArray( conditionsOverride ) && conditionsOverride.length
							? conditionsOverride
							: DEFAULT_CONDITIONS;
				}
				meta.blockish_tb_priority = 10;
			}

			const item = await saveEntityRecord( 'postType', postType, {
				title,
				content:
					row.group === 'woocommerce'
						? ''
						: getInitialContent( kind, row.slug ),
				status: 'publish',
				meta,
			} );
			onSuccess?.( item );
		} catch ( err ) {
			console.error( err );
			const apiMessage =
				err?.message ||
				err?.data?.message ||
				( typeof err === 'string' ? err : '' );
			setError(
				apiMessage ||
					__( 'Could not create item. Please try again.', 'blockish' )
			);
			setIsCreating( false );
		}
	};

	const applySuggestedName = ( areaLabel, showOn ) => {
		const suggested = suggestPartName( areaLabel, showOn );
		suggestedNameRef.current = suggested;
		setPartTitle( suggested );
		setNameTouched( false );
	};

	const openPartDetails = ( row ) => {
		const area = areaFromPartSlug( row.slug );
		const showOn = firstAvailableShowOn( area, placementMap ) || 'entire_site';
		setSelected( row );
		setPartShowOn( showOn );
		applySuggestedName( row.label || area, showOn );
		setError( '' );
	};

	const handleShowOnChange = ( value ) => {
		if ( ! value || isShowOnTaken( partArea, value, placementMap ) ) {
			return;
		}
		setPartShowOn( value );
		setError( '' );
		if ( ! nameTouched || partTitle === suggestedNameRef.current ) {
			applySuggestedName( selected?.label || partArea, value );
		}
	};

	const handlePartTitleChange = ( value ) => {
		setPartTitle( value );
		setNameTouched( true );
	};

	const handleTileClick = ( row ) => {
		if ( kind === 'part' ) {
			// WooCommerce parts are slug-based — no Area + Show on placement.
			if ( row.group === 'woocommerce' ) {
				createItem( row, row.label );
				return;
			}
			openPartDetails( row );
			return;
		}
		if ( row.slug === 'custom' ) {
			setSelected( row );
			setCustomTitle( '' );
			setError( '' );
			return;
		}
		createItem( row );
	};

	const handleCustomSubmit = ( event ) => {
		event?.preventDefault?.();
		if ( ! customTitle.trim() ) {
			setError( __( 'Please enter a template name.', 'blockish' ) );
			return;
		}
		createItem( selected || customOption, customTitle );
	};

	const handlePartSubmit = ( event ) => {
		event?.preventDefault?.();
		if ( ! partTitle.trim() ) {
			setError( __( 'Please enter a name for this part.', 'blockish' ) );
			return;
		}
		if ( takenAtShowOn ) {
			setError(
				sprintf(
					/* translators: 1: show-on label, 2: existing part title */
					__(
						'“%1$s” is already used by “%2$s”. Pick another location, or edit that part instead.',
						'blockish'
					),
					showOnLabel( partShowOn ),
					takenAtShowOn.title
				)
			);
			return;
		}
		if ( allLocationsTaken ) {
			setError(
				__(
					'Every Show on location for this area is already taken. Edit an existing part instead.',
					'blockish'
				)
			);
			return;
		}
		createItem( selected, partTitle, conditionsFromShowOn( partShowOn ) );
	};

	const modalTitle =
		kind === 'part'
			? __( 'Add template part', 'blockish' )
			: __( 'Add template', 'blockish' );

	return (
		<Modal
			title={ modalTitle }
			onRequestClose={ onCancel }
			className="blockish-tb-add-modal"
			size="large"
		>
			{ isPartDetails ? (
				<form
					className="blockish-tb-add-modal__part-details"
					onSubmit={ handlePartSubmit }
				>
					<p className="blockish-tb-add-modal__hint">
						{ __(
							'Only one part can cover each Area + location. Locations already used are not listed.',
							'blockish'
						) }
					</p>
					<div className="blockish-tb-add-modal__part-area">
						<span className="blockish-tb-add-modal__part-area-label">
							{ __( 'Area', 'blockish' ) }
						</span>
						<strong>{ selected?.label || partArea }</strong>
					</div>
					<SelectControl
						label={ __( 'Show on', 'blockish' ) }
						help={
							takenSummary.length
								? sprintf(
										/* translators: %s: list of taken locations */
										__( 'Already used: %s', 'blockish' ),
										takenSummary.join( '; ' )
								  )
								: __(
										'Where this part appears on the front end. Each location can only be used once per area.',
										'blockish'
								  )
						}
						value={ partShowOn }
						options={ showOnOptions }
						onChange={ handleShowOnChange }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ takenAtShowOn ? (
						<Notice
							status="warning"
							isDismissible={ false }
							className="blockish-tb-add-modal__notice"
						>
							{ sprintf(
								/* translators: 1: show-on label, 2: existing part title */
								__(
									'“%1$s” is already used by “%2$s”. Choose a free location below.',
									'blockish'
								),
								showOnLabel( partShowOn ),
								takenAtShowOn.title
							) }
						</Notice>
					) : null }
					{ allLocationsTaken ? (
						<Notice
							status="error"
							isDismissible={ false }
							className="blockish-tb-add-modal__notice"
						>
							{ __(
								'All Show on locations for this area are taken. Edit an existing part instead of creating another.',
								'blockish'
							) }
						</Notice>
					) : null }
					<TextControl
						label={ __( 'Name', 'blockish' ) }
						help={ __(
							'Suggested from Area + location so you can tell parts apart in the list. Edit anytime.',
							'blockish'
						) }
						value={ partTitle }
						onChange={ handlePartTitleChange }
						placeholder={ suggestPartName(
							selected?.label || partArea,
							partShowOn
						) }
						__nextHasNoMarginBottom
						__next40pxDefaultSize
					/>
					{ error ? <p className="blockish-tb-create-error">{ error }</p> : null }
					<div className="blockish-tb-create-actions">
						<Button
							variant="tertiary"
							onClick={ () => {
								setSelected( null );
								setError( '' );
								setNameTouched( false );
							} }
							disabled={ isCreating }
						>
							{ __( 'Back', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ isCreating }
							disabled={
								isCreating || !! takenAtShowOn || allLocationsTaken
							}
						>
							{ __( 'Create', 'blockish' ) }
						</Button>
					</div>
				</form>
			) : needsTemplateTitle ? (
				<form className="blockish-tb-add-modal__custom" onSubmit={ handleCustomSubmit }>
					<p className="blockish-tb-add-modal__hint">
						{ __( 'Give your custom template a name:', 'blockish' ) }
					</p>
					<TextControl
						label={ __( 'Name', 'blockish' ) }
						value={ customTitle }
						onChange={ setCustomTitle }
						__nextHasNoMarginBottom
					/>
					{ error ? <p className="blockish-tb-create-error">{ error }</p> : null }
					<div className="blockish-tb-create-actions">
						<Button
							variant="tertiary"
							onClick={ () => setSelected( null ) }
							disabled={ isCreating }
						>
							{ __( 'Back', 'blockish' ) }
						</Button>
						<Button
							variant="primary"
							type="submit"
							isBusy={ isCreating }
							disabled={ isCreating }
						>
							{ __( 'Create', 'blockish' ) }
						</Button>
					</div>
				</form>
			) : ! hasResolved ? (
				<div className="blockish-tb-add-modal__loading">
					<Spinner />
				</div>
			) : nothingLeft ? (
				<p className="blockish-tb-add-modal__hint">
					{ __( 'All standard template types already exist.', 'blockish' ) }
				</p>
			) : (
				<>
					<p className="blockish-tb-add-modal__hint">
						{ kind === 'part'
							? __( 'Select a template part to create:', 'blockish' )
							: __( 'Select what the new template should apply to:', 'blockish' ) }
					</p>
					{ standardOptions.length > 0 ? (
						<div className="blockish-tb-add-modal__grid">
							{ standardOptions.map( ( row ) => (
								<button
									key={ row.slug }
									type="button"
									className="blockish-tb-add-tile"
									disabled={ isCreating }
									onClick={ () => handleTileClick( row ) }
								>
									<span className="blockish-tb-add-tile__icon">
										<Icon icon={ ICON_MAP[ row.icon ] || layout } size={ 24 } />
									</span>
									<span className="blockish-tb-add-tile__label">{ row.label }</span>
								</button>
							) ) }
						</div>
					) : null }
					{ woocommerceOptions.length > 0 ? (
						<div className="blockish-tb-add-modal__theme">
							<span className="blockish-tb-add-modal__section-label">
								{ __( 'WooCommerce', 'blockish' ) }
							</span>
							<p className="blockish-tb-add-modal__section-hint">
								{ kind === 'part'
									? __(
											'Store template parts from WooCommerce — Mini-Cart, Checkout Header, Add to Cart, and more.',
											'blockish'
									  )
									: __(
											'Store templates from WooCommerce — Product Catalog, Cart, Checkout, and more.',
											'blockish'
									  ) }
							</p>
							<div className="blockish-tb-add-modal__grid">
								{ woocommerceOptions.map( ( row ) => (
									<button
										key={ row.slug }
										type="button"
										className="blockish-tb-add-tile"
										disabled={ isCreating }
										title={ row.description }
										onClick={ () => handleTileClick( row ) }
									>
										<span className="blockish-tb-add-tile__icon">
											<Icon icon={ ICON_MAP[ row.icon ] || layout } size={ 24 } />
										</span>
										<span className="blockish-tb-add-tile__label">{ row.label }</span>
									</button>
								) ) }
							</div>
						</div>
					) : null }
					{ themeOptions.length > 0 ? (
						<div className="blockish-tb-add-modal__theme">
							<span className="blockish-tb-add-modal__section-label">
								{ __( 'From theme', 'blockish' ) }
							</span>
							<p className="blockish-tb-add-modal__section-hint">
								{ __(
									'Create an override for a custom template already provided by the active theme.',
									'blockish'
								) }
							</p>
							<div className="blockish-tb-add-modal__grid">
								{ themeOptions.map( ( row ) => (
									<button
										key={ row.slug }
										type="button"
										className="blockish-tb-add-tile"
										disabled={ isCreating }
										title={ row.description }
										onClick={ () => handleTileClick( row ) }
									>
										<span className="blockish-tb-add-tile__icon">
											<Icon icon={ ICON_MAP[ row.icon ] || pencil } size={ 24 } />
										</span>
										<span className="blockish-tb-add-tile__label">{ row.label }</span>
									</button>
								) ) }
							</div>
						</div>
					) : null }
					{ customOption ? (
						<button
							type="button"
							className="blockish-tb-add-custom"
							disabled={ isCreating }
							onClick={ () => handleTileClick( customOption ) }
						>
							<span className="blockish-tb-add-custom__icon">
								<Icon icon={ pencil } size={ 24 } />
							</span>
							<span className="blockish-tb-add-custom__copy">
								<strong>{ customOption.label }</strong>
								<span>{ customOption.description }</span>
							</span>
						</button>
					) : null }
					{ error ? <p className="blockish-tb-create-error">{ error }</p> : null }
				</>
			) }
		</Modal>
	);
}
