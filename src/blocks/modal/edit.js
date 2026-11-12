import {
	BlockControls,
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useMergeRefs } from '@wordpress/compose';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { acquireFixedEscape } from '../navmenu-item/fixed-escape';
import Inspector from './inspector';
import './editor.scss';

const TEMPLATE = [
	[
		'blockish/paragraph',
		{
			content: __( 'Add any blocks here—text, media, buttons, or forms.', 'blockish' ),
		},
	],
];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const [ isPreviewOpen, setIsPreviewOpen ] = useState( false );
	const blockRef = useRef( null );
	const { selectBlock } = useDispatch( blockEditorStore );

	const hasSelectedChild = useSelect(
		( select ) => select( blockEditorStore ).hasSelectedInnerBlock( clientId, true ),
		[ clientId ]
	);

	const isOpen = isPreviewOpen || hasSelectedChild;

	const closePreview = useCallback( () => {
		setIsPreviewOpen( false );
		if ( hasSelectedChild ) {
			selectBlock( clientId );
		}
	}, [ clientId, hasSelectedChild, selectBlock ] );

	const togglePreview = useCallback( () => {
		if ( isOpen ) {
			closePreview();
		} else {
			setIsPreviewOpen( true );
		}
	}, [ closePreview, isOpen ] );

	useEffect( () => {
		if ( ! isOpen || ! blockRef.current ) {
			return undefined;
		}
		return acquireFixedEscape( blockRef.current, {
			overflow: false,
			containingBlock: true,
		} );
	}, [ isOpen ] );

	const { BlockishIcon } = window?.blockish?.helpers || {};
	const iconNode =
		attributes?.triggerIcon && BlockishIcon ? (
			<span className="blockish-modal-trigger-icon" aria-hidden="true">
				<BlockishIcon icon={ attributes.triggerIcon } width={ 18 } height={ 18 } fill="currentColor" />
			</span>
		) : null;

	const blockProps = useBlockProps( {
		ref: useMergeRefs( [ blockRef ] ),
		className: clsx(
			'blockish-modal',
			`modal-pos-${ attributes?.modalPosition || 'center' }`,
			`modal-anim-${ attributes?.modalAnimation || 'scale' }`,
			`trigger-align-${ attributes?.triggerAlign || 'left' }`,
			{ 'is-open': isOpen }
		),
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{ className: 'blockish-modal-body' },
		{ template: TEMPLATE }
	);

	return (
		<>
			<BlockControls>
				<ToolbarGroup>
					<ToolbarButton
						isPressed={ isOpen }
						onClick={ togglePreview }
					>
						{ isOpen ? __( 'Close Modal Preview', 'blockish' ) : __( 'Open Modal Preview', 'blockish' ) }
					</ToolbarButton>
				</ToolbarGroup>
			</BlockControls>

			<Inspector attributes={ attributes } advancedControls={ advancedControls } />

			<div { ...blockProps }>
				{ attributes?.showTrigger ? (
					<div className="blockish-modal-trigger-wrap">
						<button
							type="button"
							className="blockish-modal-trigger"
							onClick={ togglePreview }
						>
							{ attributes?.triggerIconPosition !== 'right' && iconNode }
							<span className="blockish-modal-trigger-label">
								{ attributes?.triggerText || __( 'Open Modal', 'blockish' ) }
							</span>
							{ attributes?.triggerIconPosition === 'right' && iconNode }
						</button>
					</div>
				) : (
					<div className="blockish-modal-editor-placeholder">
						<span>
							{ attributes?.triggerSelector
								? `${ __( 'Modal triggered by:', 'blockish' ) } ${ attributes.triggerSelector }`
								: __( 'Modal trigger button hidden (set external selector or show button)', 'blockish' ) }
						</span>
						<button
							type="button"
							className="blockish-modal-editor-toggle"
							onClick={ togglePreview }
						>
							{ isOpen ? __( 'Hide Modal', 'blockish' ) : __( 'Edit Modal', 'blockish' ) }
						</button>
					</div>
				) }

				<div className="blockish-modal-backdrop" aria-hidden={ ! isOpen }>
					<div
						className="blockish-modal-overlay"
						aria-hidden="true"
						onClick={ closePreview }
					/>
					<div className="blockish-modal-dialog" role="dialog" aria-modal="false">
						{ ( attributes?.showHeader || attributes?.showCloseButton ) && (
							<div className="blockish-modal-header">
								{ attributes?.showHeader ? (
									<h2 className="blockish-modal-title">
										{ attributes?.modalTitle || __( 'Modal Title', 'blockish' ) }
									</h2>
								) : (
									<span />
								) }
								{ attributes?.showCloseButton && (
									<button
										type="button"
										className="blockish-modal-close"
										aria-label={ __( 'Close modal', 'blockish' ) }
										onClick={ closePreview }
									>
										&times;
									</button>
								) }
							</div>
						) }
						<div { ...innerBlocksProps } />
					</div>
				</div>
			</div>
		</>
	);
}

