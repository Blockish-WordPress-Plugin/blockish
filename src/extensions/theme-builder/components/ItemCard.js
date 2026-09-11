import { __, sprintf } from '@wordpress/i18n';
import { DropdownMenu, MenuGroup, MenuItem, Icon } from '@wordpress/components';
import { moreVertical, pencil, trash, layout } from '@wordpress/icons';
import ItemPreview from './ItemPreview';
import { showOnFromConditions, showOnLabel } from '../utils/partConditions';

function getMeta( item, key ) {
	return item?.meta?.[ key ] ?? '';
}

function getTitle( item ) {
	if ( typeof item.title === 'string' ) {
		return item.title;
	}
	return (
		item.title?.raw ||
		item.title?.rendered ||
		__( '(no title)', 'blockish' )
	);
}

function getContent( item ) {
	if ( typeof item.content === 'string' ) {
		return item.content;
	}
	return item.content?.raw || '';
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

function areaDisplayLabel( area ) {
	if ( area === 'header' ) {
		return __( 'Header', 'blockish' );
	}
	if ( area === 'footer' ) {
		return __( 'Footer', 'blockish' );
	}
	if ( ! area ) {
		return __( 'Part', 'blockish' );
	}
	return area.charAt( 0 ).toUpperCase() + area.slice( 1 );
}

function getPartShowOn( item ) {
	const conditions = getMeta( item, 'blockish_tb_conditions' );
	return showOnFromConditions(
		Array.isArray( conditions ) ? conditions : []
	);
}

function stopCardNav( event ) {
	event.stopPropagation();
}

export default function ItemCard( {
	item,
	catalog,
	showTitle = true,
	showDescription = true,
	showAuthor = true,
	showPreview = true,
	isSelected,
	onSelect,
	onEdit,
	onDelete,
} ) {
	const kind = getMeta( item, 'blockish_tb_kind' );
	const slug = getMeta( item, 'blockish_tb_slug' );
	const area = (
		getMeta( item, 'blockish_tb_area' ) ||
		slug ||
		''
	).toLowerCase();
	const title = getTitle( item );
	const isPart = kind === 'part';
	const showOn = isPart ? getPartShowOn( item ) : '';
	const description = isPart
		? sprintf(
				/* translators: %s: Show on location label */
				__( 'Shows on: %s', 'blockish' ),
				showOnLabel( showOn )
		  )
		: getDescription( item, catalog );
	const sourceLabel = isPart
		? areaDisplayLabel( area )
		: `${ __( 'Template', 'blockish' ) }${ slug ? ` · ${ slug }` : '' }`;

	const actionsMenu = (
		<div
			className="blockish-tb-card__menu"
			onClick={ stopCardNav }
			onMouseDown={ stopCardNav }
			role="presentation"
		>
			<DropdownMenu
				icon={ moreVertical }
				label={ __( 'Actions', 'blockish' ) }
				popoverProps={ { placement: 'bottom-end' } }
				toggleProps={ {
					size: 'small',
					onClick: stopCardNav,
					onMouseDown: stopCardNav,
				} }
			>
				{ ( { onClose } ) => (
					<MenuGroup>
						<MenuItem
							icon={ pencil }
							onClick={ () => {
								onClose();
								onEdit?.();
							} }
						>
							{ __( 'Edit', 'blockish' ) }
						</MenuItem>
						<MenuItem
							icon={ trash }
							isDestructive
							onClick={ () => {
								onClose();
								onDelete?.();
							} }
						>
							{ __( 'Delete', 'blockish' ) }
						</MenuItem>
					</MenuGroup>
				) }
			</DropdownMenu>
		</div>
	);

	const selectControl = (
		<label
			className="blockish-tb-card__check"
			onClick={ stopCardNav }
			onMouseDown={ stopCardNav }
			onKeyDown={ ( e ) => e.stopPropagation() }
		>
			<input
				type="checkbox"
				checked={ !! isSelected }
				onChange={ ( e ) => {
					e.stopPropagation();
					onSelect?.( e.target.checked );
				} }
				onClick={ stopCardNav }
			/>
		</label>
	);

	return (
		<article
			className={ `blockish-tb-card ${
				isSelected ? 'is-selected' : ''
			}` }
		>
			{ showPreview ? (
				<div className="blockish-tb-card__preview-wrap">
					{ selectControl }
					{ actionsMenu }
					<button
						type="button"
						className="blockish-tb-card__preview-hit"
						onClick={ onEdit }
						aria-label={ __( 'Edit', 'blockish' ) }
					>
						<ItemPreview
							item={ item }
							content={ getContent( item ) }
						/>
					</button>
				</div>
			) : (
				<div className="blockish-tb-card__toolbar">
					{ selectControl }
					{ actionsMenu }
				</div>
			) }

			<div className="blockish-tb-card__body">
				{ showTitle ? (
					<button
						type="button"
						className="blockish-tb-card__title"
						onClick={ onEdit }
					>
						{ title }
					</button>
				) : null }
				{ showDescription && description ? (
					<p
						className={
							isPart
								? 'blockish-tb-card__description blockish-tb-card__description--show-on'
								: 'blockish-tb-card__description'
						}
					>
						{ description }
					</p>
				) : null }
				{ showAuthor ? (
					<div className="blockish-tb-card__meta">
						<span className="blockish-tb-card__author">
							{ __( 'Author', 'blockish' ) }{ ' ' }
							<strong>{ getAuthor( item ) }</strong>
						</span>
						<span className="blockish-tb-card__source">
							<Icon icon={ layout } size={ 16 } />
							{ sourceLabel }
						</span>
					</div>
				) : null }
			</div>
		</article>
	);
}
