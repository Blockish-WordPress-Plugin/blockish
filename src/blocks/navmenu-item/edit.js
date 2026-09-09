import {
	useBlockProps,
	RichText,
	BlockControls,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { link, linkOff } from '@wordpress/icons';
import { useState, useRef, useEffect, useCallback } from '@wordpress/element';
import { useMergeRefs } from '@wordpress/compose';
import { useEntityRecord } from '@wordpress/core-data';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import LinkPopover from './link-popover';
import SubmenuToolbar from './submenu-toolbar';
import SubmenuIndicator from './submenu-indicator';
import {
	clearListOpenSubmenuId,
	clearNavmenuSubmenuPosition,
	positionNavmenuSubmenu,
	scheduleNavmenuSubmenuPosition,
	setListOpenSubmenuId,
} from './position-submenu';
import './editor.scss';

const CLOSE_DELAY_MS = 600;

export default function Edit( {
	attributes,
	setAttributes,
	clientId,
	advancedControls,
	onReplace,
} ) {
	const {
		label,
		url,
		openInNewTab,
		linkId,
		linkKind,
		linkType,
		icon,
		iconPosition,
	} = attributes;
	const hasRealLink = !! url;

	const { hasSubmenu, isInNavmenu, isInOffcanvas, isSelected, hasChildSelected } =
		useSelect(
			( select ) => {
				const {
					getBlocks,
					getBlockParents,
					getBlockName,
					isBlockSelected,
					hasSelectedInnerBlock,
				} = select( blockEditorStore );
				const parents = getBlockParents( clientId );
				return {
					hasSubmenu: getBlocks( clientId ).length > 0,
					isInNavmenu: parents.some(
						( id ) => getBlockName( id ) === 'blockish/navmenu'
					),
					isInOffcanvas: parents.some(
						( id ) => getBlockName( id ) === 'blockish/offcanvas'
					),
					isSelected: isBlockSelected( clientId ),
					hasChildSelected: hasSelectedInnerBlock( clientId, true ),
				};
			},
			[ clientId ]
		);

	const useDesktopHover = hasSubmenu && isInNavmenu;

	const { BlockishIcon } = window?.blockish?.helpers || {};
	const iconMarkup =
		icon && BlockishIcon ? (
			<span className="blockish-navmenu-item-icon" aria-hidden="true">
				<BlockishIcon
					icon={ icon }
					width={ 18 }
					height={ 18 }
					fill="currentColor"
				/>
			</span>
		) : null;

	const [ showLinkPopover, setShowLinkPopover ] = useState( false );
	const [ popoverAnchor, setPopoverAnchor ] = useState( null );
	const [ linkPopoverAnchor, setLinkPopoverAnchor ] = useState( null );
	const [ isSubmenuOpen, setIsSubmenuOpen ] = useState( false );
	const closeTimerRef = useRef( null );
	const intentTimerRef = useRef( null );

	// Open canvas link UI only for the selected empty item (not every mounted empty child).
	useEffect( () => {
		if ( isSelected && ! hasRealLink ) {
			setShowLinkPopover( true );
			setLinkPopoverAnchor( null );
		}
	}, [ isSelected, hasRealLink ] );

	const clearCloseTimer = useCallback( () => {
		if ( closeTimerRef.current ) {
			clearTimeout( closeTimerRef.current );
			closeTimerRef.current = null;
		}
	}, [] );

	const clearIntentTimer = useCallback( () => {
		if ( intentTimerRef.current ) {
			clearTimeout( intentTimerRef.current );
			intentTimerRef.current = null;
		}
	}, [] );

	const scheduleClose = useCallback( () => {
		clearCloseTimer();
		closeTimerRef.current = setTimeout( () => {
			setIsSubmenuOpen( false );
			if ( popoverAnchor ) {
				clearListOpenSubmenuId( popoverAnchor, clientId );
			}
			closeTimerRef.current = null;
		}, CLOSE_DELAY_MS );
	}, [ clearCloseTimer, popoverAnchor, clientId ] );

	const openSubmenu = useCallback( () => {
		clearCloseTimer();
		clearIntentTimer();
		if ( popoverAnchor ) {
			setListOpenSubmenuId( popoverAnchor, clientId );
			// Nested under this item must not stay / become open.
			popoverAnchor
				.querySelectorAll( '.blockish-block-navmenu-item.has-submenu' )
				.forEach( ( nested ) => {
					if ( nested !== popoverAnchor ) {
						nested.dataset.blockishForceClose = String(
							Date.now()
						);
					}
				} );
		}
		setIsSubmenuOpen( true );
	}, [ clearCloseTimer, clearIntentTimer, popoverAnchor, clientId ] );

	useEffect(
		() => () => {
			clearCloseTimer();
			clearIntentTimer();
		},
		[ clearCloseTimer, clearIntentTimer ]
	);

	// Close when a sibling claims the list, or a parent force-closes nested.
	useEffect( () => {
		if ( ! popoverAnchor ) {
			return;
		}

		const closeSelf = () => {
			clearCloseTimer();
			clearIntentTimer();
			setIsSubmenuOpen( false );
			clearListOpenSubmenuId( popoverAnchor, clientId );
		};

		const list = popoverAnchor.parentElement;
		const syncFromList = () => {
			const openId = list?.dataset?.blockishOpenSubmenu || '';
			if ( openId && openId !== clientId ) {
				closeSelf();
			}
		};

		const onForceClose = () => {
			if ( popoverAnchor.dataset.blockishForceClose ) {
				closeSelf();
			}
		};

		syncFromList();
		const listObserver = list
			? new window.MutationObserver( syncFromList )
			: null;
		listObserver?.observe( list, {
			attributes: true,
			attributeFilter: [ 'data-blockish-open-submenu' ],
		} );

		const selfObserver = new window.MutationObserver( onForceClose );
		selfObserver.observe( popoverAnchor, {
			attributes: true,
			attributeFilter: [ 'data-blockish-force-close' ],
		} );

		return () => {
			listObserver?.disconnect();
			selfObserver.disconnect();
		};
	}, [ popoverAnchor, clientId, clearCloseTimer, clearIntentTimer ] );

	// Strip any leftover desktop dropdown geometry if this item lives in offcanvas.
	useEffect( () => {
		if ( isInOffcanvas && popoverAnchor ) {
			clearNavmenuSubmenuPosition( popoverAnchor );
		}
	}, [ isInOffcanvas, popoverAnchor ] );

	// Calculated fixed position in editor (same util as frontend).
	// Re-run when open/selection changes — avoid full `attributes` object deps.
	useEffect( () => {
		if ( ! popoverAnchor || ! isInNavmenu || isInOffcanvas || ! hasSubmenu ) {
			return;
		}

		const shouldShow = isSubmenuOpen || isSelected || hasChildSelected;
		if ( ! shouldShow ) {
			clearNavmenuSubmenuPosition( popoverAnchor );
			return;
		}

		scheduleNavmenuSubmenuPosition( popoverAnchor );

		const win = popoverAnchor.ownerDocument.defaultView || window;
		let raf = 0;
		const onReposition = () => {
			if ( raf ) {
				return;
			}
			raf = win.requestAnimationFrame( () => {
				raf = 0;
				positionNavmenuSubmenu( popoverAnchor );
			} );
		};

		win.addEventListener( 'resize', onReposition );
		win.addEventListener( 'scroll', onReposition, true );

		// Observe nav shell only — observing the item itself feedback-loops on style writes.
		const resizeObserver =
			typeof win.ResizeObserver === 'function'
				? new win.ResizeObserver( onReposition )
				: null;
		const navmenu = popoverAnchor.closest( '.blockish-navmenu' );
		if ( navmenu ) {
			resizeObserver?.observe( navmenu );
		}

		return () => {
			win.removeEventListener( 'resize', onReposition );
			win.removeEventListener( 'scroll', onReposition, true );
			resizeObserver?.disconnect();
			if ( raf ) {
				win.cancelAnimationFrame( raf );
			}
		};
	}, [
		popoverAnchor,
		isInNavmenu,
		isInOffcanvas,
		hasSubmenu,
		isSubmenuOpen,
		isSelected,
		hasChildSelected,
	] );

	useEffect(
		() => () => {
			if ( popoverAnchor ) {
				clearNavmenuSubmenuPosition( popoverAnchor );
			}
		},
		[ popoverAnchor ]
	);

	const entityKind = linkKind === 'post-type' ? 'postType' : linkKind;
	const { record } = useEntityRecord(
		entityKind || 'postType',
		linkType || 'page',
		linkId || 0
	);

	const blockProps = useBlockProps( {
		className: clsx( 'blockish-block-navmenu-item', {
			'has-submenu': hasSubmenu,
			// Hover/click only — never mix selection into this class (that opened all nested).
			'is-submenu-open': hasSubmenu && isSubmenuOpen,
			// Gutenberg select / child-select — editor chrome only.
			'is-submenu-editing':
				hasSubmenu && ( isSelected || hasChildSelected ),
		} ),
		ref: useMergeRefs( [ setPopoverAnchor ] ),
		onMouseEnter: useDesktopHover
			? ( event ) => {
					clearCloseTimer();
					clearIntentTimer();
					const nearest = event.target.closest?.(
						'.blockish-block-navmenu-item'
					);
					if ( nearest && nearest !== event.currentTarget ) {
						return;
					}
					const isClick = Boolean(
						event.currentTarget
							.closest( '.blockish-navmenu' )
							?.classList.contains( 'is-submenu-trigger-click' )
					);
					if ( ! isClick ) {
						const list = event.currentTarget.parentElement;
						const openId = list?.dataset?.blockishOpenSubmenu || '';
						if ( openId && openId !== clientId ) {
							intentTimerRef.current = window.setTimeout( () => {
								openSubmenu();
								intentTimerRef.current = null;
							}, 150 );
						} else {
							openSubmenu();
						}
					}
			  }
			: undefined,
		onMouseLeave: useDesktopHover
			? ( event ) => {
					clearIntentTimer();
					const toElement = event.relatedTarget;
					if (
						toElement &&
						( event.currentTarget.contains( toElement ) ||
							popoverAnchor?.contains( toElement ) )
					) {
						return;
					}
					const isClick = Boolean(
						event.currentTarget
							.closest( '.blockish-navmenu' )
							?.classList.contains( 'is-submenu-trigger-click' )
					);
					if ( ! isClick || isSubmenuOpen ) {
						scheduleClose();
					}
			  }
			: undefined,
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			className: 'blockish-navmenu-item-children',
			onMouseEnter: useDesktopHover
				? () => {
						clearCloseTimer();
						clearIntentTimer();
				  }
				: undefined,
			onMouseLeave: useDesktopHover
				? ( event ) => {
						const toElement = event.relatedTarget;
						if (
							toElement &&
							popoverAnchor?.contains( toElement )
						) {
							return;
						}
						const isClick = !! popoverAnchor
							?.closest( '.blockish-navmenu' )
							?.classList.contains( 'is-submenu-trigger-click' );
						if ( ! isClick || isSubmenuOpen ) {
							scheduleClose();
						}
				  }
				: undefined,
		},
		{
			allowedBlocks: [
				'blockish/navmenu-submenu',
				'blockish/navmenu-megamenu',
			],
			renderAppender: false,
		}
	);

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
				hasRealLink={ hasRealLink }
				hasSubmenu={ hasSubmenu }
				record={ record }
				setShowLinkPopover={ setShowLinkPopover }
				setLinkPopoverAnchor={ setLinkPopoverAnchor }
			/>
			<BlockControls group="block">
				<ToolbarGroup>
					<ToolbarButton
						icon={ hasRealLink ? link : linkOff }
						label={ __( 'Link', 'blockish' ) }
						isActive={ hasRealLink }
						onClick={ () => {
							setLinkPopoverAnchor( null );
							setShowLinkPopover( ( v ) => ! v );
						} }
					/>
				</ToolbarGroup>
			</BlockControls>
			<SubmenuToolbar clientId={ clientId } />
			<div { ...blockProps }>
				<a
					className={ clsx( 'blockish-navmenu-item-link', {
						'has-icon': !! icon,
						'icon-position-right': iconPosition === 'right',
					} ) }
					href={ url }
					onClick={ ( e ) => e.preventDefault() }
					rel={ openInNewTab ? 'noopener noreferrer' : undefined }
				>
					{ iconPosition !== 'right' && iconMarkup }
					<RichText
						tagName="span"
						identifier="label"
						value={ label }
						onChange={ ( value ) =>
							setAttributes( { label: value } )
						}
						withoutInteractiveFormatting
						placeholder={ __( 'Add Link', 'blockish' ) }
						allowedFormats={ [ 'core/bold', 'core/italic' ] }
						aria-label={ __( 'Navigation link text', 'blockish' ) }
					/>
					{ iconPosition === 'right' && iconMarkup }
				</a>
				{ hasSubmenu ? (
					<button
						type="button"
						className="blockish-navmenu-submenu-toggle"
						aria-expanded={ isSubmenuOpen }
						aria-label={ __( 'Toggle submenu', 'blockish' ) }
						onMouseDown={
							isInOffcanvas
								? ( event ) => {
										// Keep click for toggle; don't let editor selection steal it.
										event.preventDefault();
										event.stopPropagation();
								  }
								: undefined
						}
						onClick={ ( event ) => {
							event.preventDefault();
							event.stopPropagation();
							if ( isSubmenuOpen ) {
								clearCloseTimer();
								setIsSubmenuOpen( false );
								if ( popoverAnchor ) {
									clearListOpenSubmenuId(
										popoverAnchor,
										clientId
									);
								}
							} else {
								openSubmenu();
							}
						} }
					>
						<SubmenuIndicator />
					</button>
				) : null }
				<div { ...innerBlocksProps } />
			</div>
			{ showLinkPopover &&
				( isSelected || linkPopoverAnchor ) &&
				( linkPopoverAnchor || popoverAnchor ) && (
					<LinkPopover
						url={ url }
						label={ label }
						openInNewTab={ openInNewTab }
						linkId={ linkId }
						linkKind={ linkKind }
						linkType={ linkType }
						setAttributes={ setAttributes }
						onReplace={ onReplace }
						clientId={ clientId }
						popoverAnchor={ linkPopoverAnchor || popoverAnchor }
						isAnchoredToSidebar={ !! linkPopoverAnchor }
						setShowLinkPopover={ setShowLinkPopover }
						isEditingURL={ hasRealLink }
					/>
				) }
		</>
	);
}
