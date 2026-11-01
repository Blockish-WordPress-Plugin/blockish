import { useEffect, useMemo, useState } from '@wordpress/element';
import { useEntityRecords } from '@wordpress/core-data';
import { useDispatch } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import {
	Button,
	SearchControl,
	Spinner,
	Icon,
	Dropdown,
	SelectControl,
	RangeControl,
	__experimentalToggleGroupControl as ToggleGroupControl,
	__experimentalToggleGroupControlOption as ToggleGroupControlOption,
} from '@wordpress/components';
import { layout, settings, arrowUp, arrowDown } from '@wordpress/icons';
import ItemCard from './item-card';
import { getItemEditUrl, navigateToUrl } from '../library/navigation';

const DEFAULT_VIEW = {
	sortBy: 'title',
	sortOrder: 'asc',
	density: 'balanced',
	previewSize: 280,
	perPage: 20,
};

function getMeta( item, key ) {
	return item?.meta?.[ key ] ?? item?.[ key ] ?? '';
}

function getTitle( item ) {
	if ( typeof item.title === 'string' ) {
		return item.title;
	}
	return item.title?.raw || item.title?.rendered || '';
}

function getAuthor( item ) {
	return (
		item?._embedded?.author?.[ 0 ]?.name ||
		item?.author_name ||
		__( 'admin', 'blockish' )
	);
}

function getDescription( item, catalog ) {
	const slug = getMeta( item, 'blockish_tb_slug' );
	const kind = getMeta( item, 'blockish_tb_kind' );
	const list = kind === 'part' ? catalog.parts : catalog.templates;
	const match = ( list || [] ).find( ( row ) => row.slug === slug );
	return match?.description || '';
}

function pageTitle( filter ) {
	if ( filter === 'template' ) {
		return __( 'Templates', 'blockish' );
	}
	if ( filter === 'part' ) {
		return __( 'Parts', 'blockish' );
	}
	return __( 'Theme Builder', 'blockish' );
}

function addButtonLabel( filter ) {
	if ( filter === 'part' ) {
		return __( 'Add Template Part', 'blockish' );
	}
	return __( 'Add Template', 'blockish' );
}

function compareItems( a, b, sortBy, sortOrder, catalog ) {
	let av = '';
	let bv = '';
	if ( sortBy === 'author' ) {
		av = getAuthor( a );
		bv = getAuthor( b );
	} else if ( sortBy === 'description' ) {
		av = getDescription( a, catalog );
		bv = getDescription( b, catalog );
	} else {
		av = getTitle( a );
		bv = getTitle( b );
	}
	const cmp = String( av ).localeCompare( String( bv ), undefined, {
		sensitivity: 'base',
		numeric: true,
	} );
	return sortOrder === 'desc' ? -cmp : cmp;
}

export default function LibraryList( { filter, onCreate } ) {
	const [ search, setSearch ] = useState( '' );
	const [ selected, setSelected ] = useState( [] );
	const [ page, setPage ] = useState( 1 );
	const [ view, setView ] = useState( DEFAULT_VIEW );
	const [ isDeleting, setIsDeleting ] = useState( false );
	const postType = window.blockishThemeBuilder?.postType || 'blockish_tb';
	const libraryId = window.blockishThemeBuilder?.libraryId || 0;
	const catalog = useMemo(
		() => ( {
			templates: window.blockishThemeBuilder?.templateSlugs || [],
			parts: window.blockishThemeBuilder?.partSlugs || [],
		} ),
		[]
	);
	const { deleteEntityRecord } = useDispatch( 'core' );

	const { records, hasResolved } = useEntityRecords( 'postType', postType, {
		per_page: -1,
		status: 'publish',
		context: 'edit',
		search: search || undefined,
		_embed: true,
	} );

	const items = useMemo( () => {
		return ( records || [] )
			.filter( ( item ) => ! libraryId || item.id !== libraryId )
			.filter( ( item ) => {
				const kind = getMeta( item, 'blockish_tb_kind' );
				// Library host post (meta kind stored as legacy value "shell").
				if ( kind === 'shell' ) {
					return false;
				}
				if ( filter === 'all' ) {
					return true;
				}
				return kind === filter;
			} )
			.slice()
			.sort( ( a, b ) =>
				compareItems( a, b, view.sortBy, view.sortOrder, catalog )
			);
	}, [ records, libraryId, filter, view.sortBy, view.sortOrder, catalog ] );

	const totalPages = Math.max( 1, Math.ceil( items.length / view.perPage ) );
	const currentPage = Math.min( page, totalPages );
	const pagedItems = useMemo( () => {
		const start = ( currentPage - 1 ) * view.perPage;
		return items.slice( start, start + view.perPage );
	}, [ items, currentPage, view.perPage ] );

	useEffect( () => {
		setSelected( [] );
		setPage( 1 );
	}, [ filter, search, view.sortBy, view.sortOrder, view.perPage ] );

	const handleDeleteSelected = async () => {
		if ( ! selected.length ) {
			return;
		}
		if (
			! window.confirm(
				__(
					'Delete selected items? This cannot be undone.',
					'blockish'
				)
			)
		) {
			return;
		}

		const ids = [ ...selected ];
		setIsDeleting( true );
		setSelected( [] );

		try {
			await Promise.all(
				ids.map( ( id ) =>
					deleteEntityRecord( 'postType', postType, id, {
						force: true,
					} )
				)
			);
		} finally {
			setIsDeleting( false );
		}
	};

	const handleDelete = async ( id ) => {
		if (
			! window.confirm(
				__( 'Delete this Theme Builder item? This cannot be undone.', 'blockish' )
			)
		) {
			return;
		}
		await deleteEntityRecord( 'postType', postType, id, { force: true } );
		setSelected( ( prev ) => prev.filter( ( x ) => x !== id ) );
	};

	const toggleSelect = ( id, checked ) => {
		setSelected( ( prev ) => {
			if ( checked ) {
				return prev.includes( id ) ? prev : [ ...prev, id ];
			}
			return prev.filter( ( x ) => x !== id );
		} );
	};

	const allSelected =
		pagedItems.length > 0 && pagedItems.every( ( item ) => selected.includes( item.id ) );
	const someSelected =
		selected.length > 0 && pagedItems.some( ( item ) => selected.includes( item.id ) ) && ! allSelected;

	const isEmpty = hasResolved && items.length === 0;

	return (
		<div className="blockish-tb-items">
			<header className="blockish-tb-items__header">
				<h1>{ pageTitle( filter ) }</h1>
				<Button variant="primary" onClick={ onCreate }>
					{ addButtonLabel( filter ) }
				</Button>
			</header>

			<div className="blockish-tb-items__toolbar">
				<div className="blockish-tb-items__toolbar-left">
					<SearchControl
						value={ search }
						onChange={ setSearch }
						placeholder={ __( 'Search', 'blockish' ) }
						__nextHasNoMarginBottom
					/>
					<Dropdown
						className="blockish-tb-appearance"
						popoverProps={ { placement: 'bottom-start' } }
						renderToggle={ ( { isOpen, onToggle } ) => (
							<Button
								icon={ settings }
								label={ __( 'Appearance', 'blockish' ) }
								onClick={ onToggle }
								aria-expanded={ isOpen }
								isPressed={ isOpen }
							/>
						) }
						renderContent={ () => (
							<div className="blockish-tb-appearance__panel">
								<div className="blockish-tb-appearance__head">
									<strong>{ __( 'Appearance', 'blockish' ) }</strong>
									<Button
										variant="secondary"
										size="small"
										onClick={ () => setView( { ...DEFAULT_VIEW } ) }
									>
										{ __( 'Reset view', 'blockish' ) }
									</Button>
								</div>

								<div className="blockish-tb-appearance__section blockish-tb-appearance__sort">
									<div className="blockish-tb-appearance__sort-field">
										<span className="blockish-tb-appearance__label">
											{ __( 'Sort by', 'blockish' ) }
										</span>
										<SelectControl
											value={ view.sortBy }
											options={ [
												{ label: __( 'Template', 'blockish' ), value: 'title' },
												{ label: __( 'Author', 'blockish' ), value: 'author' },
												{
													label: __( 'Description', 'blockish' ),
													value: 'description',
												},
											] }
											onChange={ ( sortBy ) =>
												setView( ( prev ) => ( { ...prev, sortBy } ) )
											}
											__nextHasNoMarginBottom
											__next40pxDefaultSize
										/>
									</div>
									<div className="blockish-tb-appearance__order">
										<span className="blockish-tb-appearance__label">
											{ __( 'Order', 'blockish' ) }
										</span>
										<div className="blockish-tb-appearance__order-buttons">
											<Button
												icon={ arrowUp }
												label={ __( 'Ascending', 'blockish' ) }
												isPressed={ view.sortOrder === 'asc' }
												onClick={ () =>
													setView( ( prev ) => ( {
														...prev,
														sortOrder: 'asc',
													} ) )
												}
											/>
											<Button
												icon={ arrowDown }
												label={ __( 'Descending', 'blockish' ) }
												isPressed={ view.sortOrder === 'desc' }
												onClick={ () =>
													setView( ( prev ) => ( {
														...prev,
														sortOrder: 'desc',
													} ) )
												}
											/>
										</div>
									</div>
								</div>

								<div className="blockish-tb-appearance__section">
									<span className="blockish-tb-appearance__label">
										{ __( 'Density', 'blockish' ) }
									</span>
									<ToggleGroupControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										isBlock
										value={ view.density }
										onChange={ ( density ) =>
											setView( ( prev ) => ( { ...prev, density } ) )
										}
										aria-label={ __( 'Density', 'blockish' ) }
									>
										<ToggleGroupControlOption
											value="comfortable"
											label={ __( 'Comfortable', 'blockish' ) }
										/>
										<ToggleGroupControlOption
											value="balanced"
											label={ __( 'Balanced', 'blockish' ) }
										/>
										<ToggleGroupControlOption
											value="compact"
											label={ __( 'Compact', 'blockish' ) }
										/>
									</ToggleGroupControl>
								</div>

								<div className="blockish-tb-appearance__section">
									<span className="blockish-tb-appearance__label">
										{ __( 'Preview size', 'blockish' ) }
									</span>
									<RangeControl
										value={ view.previewSize }
										onChange={ ( previewSize ) =>
											setView( ( prev ) => ( {
												...prev,
												previewSize: previewSize || DEFAULT_VIEW.previewSize,
											} ) )
										}
										min={ 200 }
										max={ 400 }
										step={ 10 }
										withInputField={ false }
										__nextHasNoMarginBottom
										__next40pxDefaultSize
									/>
								</div>

								<div className="blockish-tb-appearance__section">
									<span className="blockish-tb-appearance__label">
										{ __( 'Items per page', 'blockish' ) }
									</span>
									<ToggleGroupControl
										__nextHasNoMarginBottom
										__next40pxDefaultSize
										isBlock
										value={ String( view.perPage ) }
										onChange={ ( value ) =>
											setView( ( prev ) => ( {
												...prev,
												perPage: Number( value ),
											} ) )
										}
										aria-label={ __( 'Items per page', 'blockish' ) }
									>
										{ [ 10, 20, 50, 100 ].map( ( size ) => (
											<ToggleGroupControlOption
												key={ size }
												value={ String( size ) }
												label={ String( size ) }
											/>
										) ) }
									</ToggleGroupControl>
								</div>
							</div>
						) }
					/>
				</div>
			</div>

			{ ! hasResolved ? (
				<div className="blockish-tb-items__loading">
					<Spinner />
				</div>
			) : isEmpty ? (
				<div className="blockish-tb-items__empty">
					<div className="blockish-tb-items__empty-icon" aria-hidden="true">
						<Icon icon={ layout } size={ 40 } />
					</div>
					<h3>
						{ filter === 'part'
							? __( 'No template parts yet', 'blockish' )
							: __( 'No templates yet', 'blockish' ) }
					</h3>
					<p>
						{ filter === 'part'
							? __( 'Add a header or footer to start building site chrome.', 'blockish' )
							: __( 'Add a template to control how your site pages render.', 'blockish' ) }
					</p>
					<Button variant="primary" onClick={ onCreate }>
						{ addButtonLabel( filter ) }
					</Button>
				</div>
			) : (
				<>
					<div className="blockish-tb-items__scroll">
						<div
							className={ `blockish-tb-items__grid is-density-${ view.density }` }
							style={ {
								gridTemplateColumns: `repeat(auto-fill, minmax(${ view.previewSize }px, 1fr))`,
							} }
						>
							{ pagedItems.map( ( item ) => (
								<ItemCard
									key={ item.id }
									item={ item }
									catalog={ catalog }
									isSelected={ selected.includes( item.id ) }
									onSelect={ ( checked ) => toggleSelect( item.id, checked ) }
									onEdit={ () => navigateToUrl( getItemEditUrl( item.id ) ) }
									onDelete={ () => handleDelete( item.id ) }
								/>
							) ) }
						</div>
					</div>
					<footer className="blockish-tb-items__footer">
						<div className="blockish-tb-items__footer-left">
							<label className="blockish-tb-items__footer-select">
								<input
									type="checkbox"
									checked={ allSelected }
									ref={ ( input ) => {
										if ( input ) {
											input.indeterminate = someSelected;
										}
									} }
									onChange={ ( e ) => {
										if ( e.target.checked ) {
											setSelected( ( prev ) => {
												const ids = new Set( prev );
												pagedItems.forEach( ( item ) => ids.add( item.id ) );
												return [ ...ids ];
											} );
										} else {
											const pageIds = new Set( pagedItems.map( ( item ) => item.id ) );
											setSelected( ( prev ) =>
												prev.filter( ( id ) => ! pageIds.has( id ) )
											);
										}
									} }
								/>
								<span>
									{ selected.length > 0
										? `${ selected.length } ${ __( 'selected', 'blockish' ) }`
										: `${ items.length } ${
												items.length === 1
													? __( 'Item', 'blockish' )
													: __( 'Items', 'blockish' )
										  }` }
								</span>
							</label>
							{ selected.length > 0 ? (
								<Button
									isDestructive
									variant="link"
									disabled={ isDeleting }
									onClick={ handleDeleteSelected }
								>
									{ isDeleting
										? __( 'Deleting…', 'blockish' )
										: __( 'Delete', 'blockish' ) }
								</Button>
							) : null }
						</div>
						{ items.length > 0 ? (
							<div className="blockish-tb-items__pagination">
								<Button
									size="small"
									disabled={ currentPage <= 1 }
									onClick={ () => setPage( ( p ) => Math.max( 1, p - 1 ) ) }
								>
									{ __( 'Previous', 'blockish' ) }
								</Button>
								<span>
									{ currentPage } / { totalPages }
								</span>
								<Button
									size="small"
									disabled={ currentPage >= totalPages }
									onClick={ () =>
										setPage( ( p ) => Math.min( totalPages, p + 1 ) )
									}
								>
									{ __( 'Next', 'blockish' ) }
								</Button>
							</div>
						) : null }
					</footer>
				</>
			) }
		</div>
	);
}
