import { registerBlockType, createBlock, serialize, parse } from '@wordpress/blocks';
import { useInnerBlocksProps } from '@wordpress/block-editor';
import { useDispatch, dispatch, resolveSelect } from '@wordpress/data';
import { useCallback, useEffect, useMemo, useRef } from '@wordpress/element';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { refreshClassEntities, resolveClassPrevious } from '../class-manager/wrap-ai-preview';

const schemaNodeToBlock = ( node ) => {
	if ( ! node || typeof node !== 'object' || ! node.name ) {
		return null;
	}
	try {
		const innerBlocks = Array.isArray( node.innerBlocks )
			? node.innerBlocks.map( schemaNodeToBlock ).filter( Boolean )
			: [];
		return createBlock( node.name, node.attributes || {}, innerBlocks );
	} catch ( e ) {
		console.error(
			'Blockish AI: failed to create block from schema node',
			node?.name,
			e
		);
		return null;
	}
};

/** Schema nodes → InnerBlocks template: [ name, attributes, innerTemplate? ] */
const schemaNodeToTemplate = ( node ) => {
	if ( ! node || typeof node !== 'object' || ! node.name ) {
		return null;
	}
	const attrs = node.attributes || {};
	const children = Array.isArray( node.innerBlocks )
		? node.innerBlocks.map( schemaNodeToTemplate ).filter( Boolean )
		: [];
	return children.length ? [ node.name, attrs, children ] : [ node.name, attrs ];
};

const parseSchemaAttr = ( value ) => {
	if ( ! value ) {
		return [];
	}
	if ( Array.isArray( value ) ) {
		return value;
	}
	try {
		const parsed = typeof value === 'string' ? JSON.parse( value ) : value;
		if ( Array.isArray( parsed ) ) {
			return parsed;
		}
		if ( parsed && typeof parsed === 'object' && parsed.name ) {
			return [ parsed ];
		}
	} catch ( e ) {
		console.error( 'Blockish AI: failed to parse schema attribute', e );
	}
	return [];
};

/**
 * Nested pattern/form still staged as ai-preview → write pending into their content
 * so parent refs resolve when previewing.
 */
const resolvePendingEntity = async ( { id, restBase, postType, label } ) => {
	const record = await apiFetch( {
		path: `/wp/v2/${ restBase }/${ id }?context=edit`,
	} );

	const rawContent =
		typeof record?.content === 'object'
			? record.content?.raw || ''
			: record?.content || '';

	if ( ! rawContent || ! rawContent.includes( 'blockish/ai-preview' ) ) {
		return;
	}

	const parsedBlocks = parse( rawContent );
	const preview = parsedBlocks.find( ( b ) => b.name === 'blockish/ai-preview' );
	if ( ! preview ) {
		return;
	}

	const pending = parseSchemaAttr( preview.attributes?.pendingSchema );
	if ( ! pending.length ) {
		return;
	}

	await resolveNestedPending( pending );

	const nextBlocks = pending.map( schemaNodeToBlock ).filter( Boolean );
	if ( ! nextBlocks.length ) {
		throw new Error( `${ label } ${ id }: pending schema produced 0 blocks` );
	}

	await apiFetch( {
		path: `/wp/v2/${ restBase }/${ id }`,
		method: 'POST',
		data: { content: serialize( nextBlocks ) },
	} );

	dispatch( 'core' ).invalidateResolution( 'getEntityRecord', [
		'postType',
		postType,
		id,
	] );
	await resolveSelect( 'core' ).getEntityRecord( 'postType', postType, id, {
		context: 'edit',
	} );
};

const resolveNestedPending = async ( schemaNode ) => {
	if ( ! schemaNode ) {
		return;
	}
	if ( Array.isArray( schemaNode ) ) {
		for ( const node of schemaNode ) {
			await resolveNestedPending( node );
		}
		return;
	}
	if ( typeof schemaNode !== 'object' ) {
		return;
	}

	if ( schemaNode.name === 'core/block' && schemaNode.attributes?.ref ) {
		await resolvePendingEntity( {
			id: schemaNode.attributes.ref,
			restBase: 'blocks',
			postType: 'wp_block',
			label: 'Pattern',
		} );
	}

	if (
		schemaNode.name === 'blockish-forms/form' &&
		schemaNode.attributes?.formId
	) {
		await resolvePendingEntity( {
			id: schemaNode.attributes.formId,
			restBase: 'blockish_form',
			postType: 'blockish_form',
			label: 'Form',
		} );
	}

	if ( Array.isArray( schemaNode.innerBlocks ) ) {
		for ( const child of schemaNode.innerBlocks ) {
			await resolveNestedPending( child );
		}
	}
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
		previousSchema: {
			type: 'string',
			default: '',
		},
		pendingSchema: {
			type: 'string',
			default: '',
		},
	},
	edit: ( props ) => {
		const {
			clientId,
			attributes: { previousSchema, pendingSchema },
		} = props;

		const { resetEditorBlocks, lockPostSaving, unlockPostSaving } =
			useDispatch( 'core/editor' );

		const resolvedKey = useRef( '' );

		const template = useMemo( () => {
			return parseSchemaAttr( pendingSchema )
				.map( schemaNodeToTemplate )
				.filter( Boolean );
		}, [ pendingSchema ] );

		useEffect( () => {
			lockPostSaving( 'blockish-ai-preview' );
			return () => {
				unlockPostSaving( 'blockish-ai-preview' );
			};
		}, [ lockPostSaving, unlockPostSaving ] );

		// Resolve nested pattern/form pending once per pendingSchema.
		useEffect( () => {
			if ( ! pendingSchema || resolvedKey.current === pendingSchema ) {
				return;
			}
			resolvedKey.current = pendingSchema;
			resolveNestedPending( parseSchemaAttr( pendingSchema ) ).catch(
				( e ) => {
					console.error( 'Blockish AI: nested resolve failed', e );
				}
			);
		}, [ pendingSchema ] );

		/** Accept: unwrap + commit Class Manager previousContent. */
		const handleApprove = useCallback( async () => {
			await resolveClassPrevious( 'accept' );
			await refreshClassEntities();
			const block = window.wp.data
				.select( 'core/block-editor' )
				.getBlock( clientId );
			const nextBlocks =
				block && block.innerBlocks.length > 0 ? block.innerBlocks : [];
			resetEditorBlocks( nextBlocks );
		}, [ clientId, resetEditorBlocks ] );

		/** Discard: restore page schema + Class Manager previousContent. */
		const handleReject = useCallback( async () => {
			const result = await resolveClassPrevious( 'discard' );
			const restoredIds = Array.isArray( result?.restored )
				? result.restored.flatMap( ( row ) => {
					const ids = [ row?.id ];
					( row?.records || [] ).forEach( ( record ) => {
						if ( record?.id ) {
							ids.push( record.id );
						}
					} );
					return ids.filter( Boolean );
				} )
				: [];
			await refreshClassEntities( restoredIds );
			const nextBlocks = parseSchemaAttr( previousSchema )
				.map( schemaNodeToBlock )
				.filter( Boolean );
			resetEditorBlocks( nextBlocks );
		}, [ previousSchema, resetEditorBlocks ] );

		const innerBlockProps = useInnerBlocksProps(
			{
				className:
					'blockish-ai-preview-inner-blocks is-root-container is-layout-constrained',
			},
			{
				template,
				templateLock: false,
			}
		);

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
	save: () => null,
} );
