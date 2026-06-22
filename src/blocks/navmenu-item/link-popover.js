import { Popover } from '@wordpress/components';
import { __experimentalLinkControl as LinkControl } from '@wordpress/block-editor';
import { useState, useRef, useEffect, createInterpolateElement } from '@wordpress/element';
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
	setShowLinkPopover,
	isEditingURL,
} ) {
	const [ showBackdrop, setShowBackdrop ] = useState( true );
	const popoverRef = useRef( null );
	const { selectPreviousBlock } = useDispatch( 'core/block-editor' );
	const { saveEntityRecord } = useDispatch( 'core' );
	const pagesPermissions = useResourcePermissions( 'pages' );
	const postsPermissions = useResourcePermissions( 'posts' );

	// New/empty items don't get focusOnMount (that's reserved for re-opening
	// an *existing* link below) — focus the search field manually instead.
	useEffect( () => {
		const searchInput = popoverRef.current?.querySelector(
			'.block-editor-url-input__input'
		);
		searchInput?.focus();
	}, [] );

	// The backdrop intercepts the *first* outside click to dismiss the
	// popover without that same click also doing something else jarring
	// (e.g. selecting a different block) — Popover's own onClose still
	// handles the rest. Without it, clicking away from an empty/unset item
	// could leave a dead "#" item behind instead of removing it.
	useEffect( () => {
		if ( ! showBackdrop && ! isEditingURL ) {
			onReplace( [] );
		}

		return () => setShowBackdrop( true );
	}, [ showBackdrop, isEditingURL ] );

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
			{ showBackdrop && (
				<div
					className="components-popover-pointer-events-trap"
					aria-hidden="true"
					onClick={ () => {
						setShowLinkPopover( false );
						setShowBackdrop( false );
					} }
				/>
			) }
			<Popover
				placement="bottom"
				anchor={ popoverAnchor }
				focusOnMount={ isEditingURL ? 'firstElement' : false }
				__unstableSlotName={ '__unstable-block-tools-after' }
				shift
				ref={ popoverRef }
				onClose={ () => {
					console.log({url});
					
					// Dismissing without ever picking a link removes the empty
					// item instead of leaving a dead "#" placeholder behind.
					if ( ! url || url === '#' ) {
						selectPreviousBlock( clientId, true );
						onReplace( [] );
					}

					setShowLinkPopover( false );
				} }
			>
				<LinkControl
					hasTextControl
					hasRichPreviews
					key={ `${ url }-${ linkId }` }
					withCreateSuggestion={ userCanCreate }
					createSuggestion={ handleCreate }
					createSuggestionButtonText={ ( searchTerm ) =>
						createInterpolateElement(
							sprintf(
								linkType === 'post'
									? /* translators: %s: search term. */ __( 'Create draft post: <mark>%s</mark>', 'blockish' )
									: /* translators: %s: search term. */ __( 'Create draft page: <mark>%s</mark>', 'blockish' ),
								searchTerm
							),
							{ mark: <mark /> }
						)
					}
					value={ {
						// "#" is just our internal placeholder for "no real
						// link yet" — passing it through would make
						// LinkControl render a rich-preview card for a
						// literal "#" link instead of its proper empty state.
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
							// Only auto-fill the first time — don't clobber a label
							// someone already typed.
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
