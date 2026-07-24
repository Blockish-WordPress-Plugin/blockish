import { registerBlockType, createBlock } from '@wordpress/blocks';
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const META_KEY = '_blockish_block_schema';

const schemaNodeToBlock = ( node ) => {
	if ( ! node || typeof node !== 'object' || ! node.name ) {
		return null;
	}
	const innerBlocks = Array.isArray( node.innerBlocks )
		? node.innerBlocks.map( schemaNodeToBlock ).filter( Boolean )
		: [];
	return createBlock( node.name, node.attributes || {}, innerBlocks );
};

registerBlockType( 'blockish/ai-preview', {
	title: __( 'AI Preview Wrapper', 'blockish' ),
	apiVersion: 3,
	category: 'design',
	icon: 'admin-appearance',
	supports: {
		inserter: false,
		html: false,
		reusable: false,
	},
	attributes: {
		/**
		 * JSON string — a snapshot of the blocks that existed in the editor
		 * BEFORE the AI preview was injected. Used by Discard to restore the
		 * previous state.
		 */
		previousBlocks: {
			type: 'string',
			default: '',
		},
	},
	edit: ( props ) => {
		const {
			clientId,
			attributes: { previousBlocks },
		} = props;

		const { editEntityRecord } = useDispatch( 'core' );
		const { resetEditorBlocks, lockPostSaving, unlockPostSaving } =
			useDispatch( 'core/editor' );

		// Prevent Update while preview is mounted — Accept/Discard first.
		useEffect( () => {
			lockPostSaving( 'blockish-ai-preview' );
			return () => {
				unlockPostSaving( 'blockish-ai-preview' );
			};
		}, [ lockPostSaving, unlockPostSaving ] );

		const { postType, postId, slug, stagedTemplate, stagedTemplatePart } =
			useSelect( ( select ) => {
				const editor = select( 'core/editor' );
				const currentPost = editor ? editor.getCurrentPost() : null;
				const type = editor ? editor.getCurrentPostType() : null;
				const id = editor ? editor.getCurrentPostId() : null;
				let currentSlug =
					currentPost?.slug || currentPost?.post_name || id;

				if (
					currentSlug &&
					typeof currentSlug === 'string' &&
					currentSlug.includes( '//' )
				) {
					currentSlug = currentSlug.split( '//' )[ 1 ];
				}

				const site = select( 'core' ).getEntityRecord( 'root', 'site' );

				return {
					postType: type,
					postId: id,
					slug: currentSlug,
					stagedTemplate: site?.blockish_mcp_staged_template || {},
					stagedTemplatePart:
						site?.blockish_mcp_staged_template_part || {},
				};
			}, [] );

		const innerBlockProps = useInnerBlocksProps( {
			className:
				'blockish-ai-preview-inner-blocks is-root-container is-layout-constrained',
		} );

		/**
		 * Apply the final block tree via resetEditorBlocks so the post entity
		 * becomes dirty (Save button). Do not auto-save — the user saves.
		 */
		const applyBlocksAndMarkDirty = useCallback(
			( nextBlocks ) => {
				resetEditorBlocks( nextBlocks );

				if ( postType === 'wp_template' ) {
					const next = { ...( stagedTemplate || {} ) };
					delete next[ slug ];
					editEntityRecord( 'root', 'site', undefined, {
						blockish_mcp_staged_template: next,
					} );
				} else if ( postType === 'wp_template_part' ) {
					const next = { ...( stagedTemplatePart || {} ) };
					delete next[ slug ];
					editEntityRecord( 'root', 'site', undefined, {
						blockish_mcp_staged_template_part: next,
					} );
				} else if ( postType && postId ) {
					editEntityRecord( 'postType', postType, postId, {
						meta: { [ META_KEY ]: '' },
					} );
				}
			},
			[
				postType,
				postId,
				slug,
				stagedTemplate,
				stagedTemplatePart,
				editEntityRecord,
				resetEditorBlocks,
			]
		);

		/**
		 * Accept: unwrap AI blocks into the canvas and clear pending (dirty only).
		 */
		const handleApprove = useCallback( () => {
			const block = window.wp.data
				.select( 'core/block-editor' )
				.getBlock( clientId );
			const nextBlocks =
				block && block.innerBlocks.length > 0 ? block.innerBlocks : [];
			applyBlocksAndMarkDirty( nextBlocks );
		}, [ clientId, applyBlocksAndMarkDirty ] );

		/**
		 * Discard: restore previous blocks and clear pending (dirty only).
		 */
		const handleReject = useCallback( () => {
			let nextBlocks = [];
			if ( previousBlocks ) {
				try {
					const snapshot = JSON.parse( previousBlocks );
					nextBlocks = snapshot
						.map( schemaNodeToBlock )
						.filter( Boolean );
				} catch ( e ) {
					console.error(
						'Blockish: failed to parse previousBlocks snapshot',
						e
					);
				}
			}
			applyBlocksAndMarkDirty( nextBlocks );
		}, [ previousBlocks, applyBlocksAndMarkDirty ] );

		return (
			<div className="blockish-ai-preview-wrapper alignfull">
				<div className="blockish-ai-preview-actions">
					<div className="blockish-ai-button-group">
						<Button variant="primary" onClick={ handleApprove }>
							<span>{ __( 'Accept', 'blockish' ) }</span>
						</Button>
						<Button
							variant="secondary"
							isDestructive
							onClick={ handleReject }
						>
							<span>{ __( 'Discard', 'blockish' ) }</span>
						</Button>
					</div>
				</div>
				<div { ...innerBlockProps }></div>
			</div>
		);
	},
	save: () => {
		const innerBlockProps = useInnerBlocksProps.save();
		return <div { ...innerBlockProps }></div>;
	},
} );
