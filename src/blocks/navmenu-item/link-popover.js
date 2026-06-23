import { Popover } from '@wordpress/components';
import { LinkControl } from '@wordpress/block-editor';
import { useRef, useEffect, createInterpolateElement } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { useResourcePermissions } from '@wordpress/core-data';
import { __, sprintf } from '@wordpress/i18n';
import { decodeEntities } from '@wordpress/html-entities';
import { getSuggestionsQuery } from './get-suggestion-query';


export default function LinkPopover( {
	url,
	label,
	openInNewTab,
	linkId,
	linkKind,
	linkType,
	setAttributes,
	onReplace,
	clientId,
	popoverAnchor,
	isAnchoredToSidebar,
	setShowLinkPopover,
	isEditingURL,
} ) {
	const popoverRef = useRef( null );
	const { selectPreviousBlock } = useDispatch( 'core/block-editor' );
	const { saveEntityRecord } = useDispatch( 'core' );
	const pagesPermissions = useResourcePermissions( 'pages' );
	const postsPermissions = useResourcePermissions( 'posts' );

	useEffect( () => {
		const searchInput = popoverRef.current?.querySelector(
			'.block-editor-url-input__input'
		);
		searchInput?.focus();
	}, [] );

	const closePopover = () => {
		if ( ! url || url === '#' ) {
			selectPreviousBlock( clientId, true );
			onReplace( [] );
		}

		setShowLinkPopover( false );
	};

	let userCanCreate = false;
	if ( ! linkType || linkType === 'page' ) {
		userCanCreate = pagesPermissions.canCreate;
	} else if ( linkType === 'post' ) {
		userCanCreate = postsPermissions.canCreate;
	}

	const handleCreate = async ( pageTitle ) => {
		const postType = linkType || 'page';
		const page = await saveEntityRecord( 'postType', postType, {
			title: pageTitle,
			status: 'draft',
		} );

		return {
			id: page.id,
			type: postType,
			title: decodeEntities( page.title.rendered ),
			url: page.link,
			kind: 'post-type',
		};
	};

	return (
		<>
			<div
				className="components-popover-pointer-events-trap"
				aria-hidden="true"
				onClick={ closePopover }
			/>
			<Popover
				placement={ isAnchoredToSidebar ? 'left-start' : 'bottom' }
				offset={ isAnchoredToSidebar ? 36 : 0 }
				anchor={ popoverAnchor }
				focusOnMount={ isEditingURL ? 'firstElement' : false }
				__unstableSlotName={ '__unstable-block-tools-after' }
				shift
				ref={ popoverRef }
				onClose={ closePopover }
			>
				<LinkControl
					hasTextControl
					hasRichPreviews={ ! isAnchoredToSidebar }
					forceIsEditingLink={ isAnchoredToSidebar ? true : undefined }
					key={ `${ url }-${ linkId }` }
					withCreateSuggestion={ userCanCreate }
					createSuggestion={ handleCreate }
					createSuggestionButtonText={ ( searchTerm ) =>
						createInterpolateElement(
							sprintf(
								linkType === 'post'
									? __( 'Create draft post: <mark>%s</mark>', 'blockish' )
									: __( 'Create draft page: <mark>%s</mark>', 'blockish' ),
								searchTerm
							),
							{ mark: <mark /> }
						)
					}
					value={ {
						url: url && url !== '#' ? url : undefined,
						title: label || undefined,
						opensInNewTab: openInNewTab,
						id: linkId || undefined,
						kind: linkKind || undefined,
						type: linkType || undefined,
					} }
					onChange={ ( { url: newUrl, opensInNewTab, id, kind, type, title } ) => {
						setAttributes( {
							url: newUrl || '#',
							openInNewTab: !! opensInNewTab,
							linkId: id || 0,
							linkKind: kind || '',
							linkType: type || '',
							...( ! label && { label: title || newUrl || '' } ),
						} );
					} }
					showSuggestions
					showInitialSuggestions
					suggestionsQuery={ getSuggestionsQuery( linkType, linkKind ) }
					noDirectEntry={ !! linkType }
					noURLSuggestion={ !! linkType }
				/>
			</Popover>
		</>
	);
}
