import { useEntityProp } from '@wordpress/core-data';
import { useSelect, useDispatch, resolveSelect, dispatch, subscribe } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { createBlock, serialize } from '@wordpress/blocks';
import apiFetch from '@wordpress/api-fetch';

const META_KEY = '_blockish_block_schema';
const MAX_PREVIOUS_BLOCKS_JSON = 150000;

const schemaNodeToBlock = (node) => {
    if (!node || typeof node !== 'object' || !node.name) {
        return null;
    }

    try {
        const innerBlocks = Array.isArray(node.innerBlocks)
            ? node.innerBlocks.map(schemaNodeToBlock).filter(Boolean)
            : [];

        return createBlock(node.name, node.attributes || {}, innerBlocks);
    } catch (e) {
        console.error('Blockish AI: failed to create block from schema node', node?.name, e);
        return null;
    }
};


/**
 * Serialize a block tree to a lightweight JSON-serializable snapshot.
 * We store name, attributes, and innerBlocks (recursively).
 */
const blockToSnapshot = (block) => {
    return {
        name: block.name,
        attributes: block.attributes,
        innerBlocks: (block.innerBlocks || []).map(blockToSnapshot),
    };
};

const ApplyPendingSchema = () => {
    const { postType, postId, slug, isTemplateOrPart, pendingFromRecord } =
        useSelect((select) => {
            const editor = select('core/editor');
            const currentPost = editor ? editor.getCurrentPost() : null;
            const type = editor ? editor.getCurrentPostType() : null;
            const id = editor ? editor.getCurrentPostId() : null;
            let currentSlug =
                currentPost?.slug || currentPost?.post_name || id;

            if (
                currentSlug &&
                typeof currentSlug === 'string' &&
                currentSlug.includes('//')
            ) {
                currentSlug = currentSlug.split('//')[1];
            }

            let pendingMeta = null;
            if (
                type &&
                id &&
                type !== 'wp_template' &&
                type !== 'wp_template_part'
            ) {
                const edited = select('core').getEditedEntityRecord(
                    'postType',
                    type,
                    id
                );
                const raw = select('core').getEntityRecord(
                    'postType',
                    type,
                    id
                );
                pendingMeta =
                    edited?.meta?.[META_KEY] ||
                    raw?.meta?.[META_KEY] ||
                    null;
            }

            return {
                postType: type,
                postId: id,
                slug: currentSlug,
                isTemplateOrPart:
                    type === 'wp_template' || type === 'wp_template_part',
                pendingFromRecord: pendingMeta,
            };
        }, []);

    const [meta, setMeta] = useEntityProp('postType', postType, 'meta');
    const [stagedTemplate, setStagedTemplate] = useEntityProp(
        'root',
        'site',
        'blockish_mcp_staged_template'
    );
    const [stagedTemplatePart, setStagedTemplatePart] = useEntityProp(
        'root',
        'site',
        'blockish_mcp_staged_template_part'
    );

    // resetEditorBlocks (core/editor) — NOT block-editor resetBlocks.
    // block-editor resetBlocks updates the canvas only and leaves the post
    // entity clean, so Accept later never dirties the Save button.
    const { resetEditorBlocks } = useDispatch('core/editor');

    // Stable selector fn — call inside inject/subscribe for a fresh block list.
    // Keep it in a ref so the inject effect does not re-subscribe on every render.
    const getBlocks = useSelect(
        (select) => select('core/block-editor').getBlocks,
        []
    );
    const getBlocksRef = useRef(getBlocks);
    getBlocksRef.current = getBlocks;
    const resetEditorBlocksRef = useRef(resetEditorBlocks);
    resetEditorBlocksRef.current = resetEditorBlocks;

    let pendingSchema = null;
    if (isTemplateOrPart) {
        if (postType === 'wp_template') {
            pendingSchema = stagedTemplate?.[slug];
        } else {
            pendingSchema = stagedTemplatePart?.[slug];
        }
    } else {
        pendingSchema =
            (meta && meta[META_KEY] ? meta[META_KEY] : null) ||
            pendingFromRecord ||
            null;
    }

    // Stabilize pending key so effect does not re-fire when object identity churns.
    const pendingKey =
        typeof pendingSchema === 'string'
            ? pendingSchema
            : pendingSchema
                ? JSON.stringify(pendingSchema)
                : '';

    /**
     * Apply pending `_blockish_block_schema` on a nested entity (pattern or form),
     * then clear the meta. REST write keeps stringified JSON attrs intact
     * (unlike ad-hoc PHP serialize_blocks without wp_slash).
     */
    const resolvePendingEntity = async ({
        id,
        restBase,
        postType,
        label,
    }) => {
        // Direct REST fetch — core-data cache often omits large meta.
        const record = await apiFetch({
            path: `/wp/v2/${restBase}/${id}?context=edit`,
        });

        const pendingJson =
            record?.meta?.[META_KEY] ||
            record?.meta?._blockish_block_schema ||
            '';

        if (!pendingJson) {
            return;
        }

        const parsed =
            typeof pendingJson === 'string'
                ? JSON.parse(pendingJson)
                : pendingJson;
        const parsedArray = Array.isArray(parsed) ? parsed : [parsed];

        // Nested pattern/form refs inside this entity first.
        await resolveNestedPending(parsedArray);

        const blocks = parsedArray.map(schemaNodeToBlock).filter(Boolean);

        if (!blocks.length) {
            throw new Error(
                `${label} ${id}: pending schema produced 0 blocks`
            );
        }

        const html = serialize(blocks);

        // Two-step save is more reliable for large content:
        // 1) write content, 2) clear pending meta.
        await apiFetch({
            path: `/wp/v2/${restBase}/${id}`,
            method: 'POST',
            data: {
                content: html,
            },
        });

        await apiFetch({
            path: `/wp/v2/${restBase}/${id}`,
            method: 'POST',
            data: {
                meta: {
                    [META_KEY]: '',
                },
            },
        });

        // Refresh editor entity store so embeds/previews re-read content.
        dispatch('core').invalidateResolution('getEntityRecord', [
            'postType',
            postType,
            id,
        ]);
        await resolveSelect('core').getEntityRecord(
            'postType',
            postType,
            id,
            { context: 'edit' }
        );
    };

    const resolveNestedPending = async (schemaNode) => {
        if (!schemaNode) {
            return;
        }

        if (Array.isArray(schemaNode)) {
            // Sequential — parallel saves of large entities race / overwhelm REST.
            for (const node of schemaNode) {
                await resolveNestedPending(node);
            }
            return;
        }

        if (typeof schemaNode !== 'object') {
            return;
        }

        if (
            schemaNode.name === 'core/block' &&
            schemaNode.attributes?.ref
        ) {
            const ref = schemaNode.attributes.ref;
            try {
                await resolvePendingEntity({
                    id: ref,
                    restBase: 'blocks',
                    postType: 'wp_block',
                    label: 'Pattern',
                });
            } catch (e) {
                console.error(
                    'Blockish AI: Failed to resolve pattern',
                    ref,
                    e
                );
                throw e;
            }
        }

        if (
            schemaNode.name === 'blockish-forms/form' &&
            schemaNode.attributes?.formId
        ) {
            const formId = schemaNode.attributes.formId;
            try {
                await resolvePendingEntity({
                    id: formId,
                    restBase: 'blockish_form',
                    postType: 'blockish_form',
                    label: 'Form',
                });
            } catch (e) {
                console.error(
                    'Blockish AI: Failed to resolve form',
                    formId,
                    e
                );
                throw e;
            }
        }

        if (
            schemaNode.innerBlocks &&
            Array.isArray(schemaNode.innerBlocks)
        ) {
            for (const child of schemaNode.innerBlocks) {
                await resolveNestedPending(child);
            }
        }
    };

    const injectedForKey = useRef('');
    const isProcessingRef = useRef(false);

    useEffect(() => {
        if (!pendingKey) {
            return;
        }

        // Already injected this pending payload in this editor session.
        if (injectedForKey.current === pendingKey) {
            return;
        }

        let isCancelled = false;

        const processAndInject = async (force = false) => {
            if (isCancelled || isProcessingRef.current) {
                return;
            }
            if (injectedForKey.current === pendingKey) {
                return;
            }

            const allEditorBlocks = getBlocksRef.current();
            const hasAiPreview = allEditorBlocks.some(
                (block) => block.name === 'blockish/ai-preview'
            );

            if (!force && allEditorBlocks.length === 0) {
                return;
            }

            isProcessingRef.current = true;

            let schemaArray = [];
            try {
                const schema = JSON.parse(pendingKey);
                schemaArray = Array.isArray(schema) ? schema : [schema];

                // Always resolve nested pattern/form pending first — even when
                // ai-preview is already in the canvas (e.g. preview was saved
                // into post_content). The old early-return skipped resolve.
                await resolveNestedPending(schemaArray);

                if (isCancelled) {
                    isProcessingRef.current = false;
                    return;
                }
            } catch (e) {
                console.error('Blockish AI Schema resolve/parse error:', e);
                isProcessingRef.current = false;
                return;
            }

            const aiBlocks = schemaArray
                .map(schemaNodeToBlock)
                .filter(Boolean);

            if (!aiBlocks.length) {
                isProcessingRef.current = false;
                return;
            }

            // Re-inject (or refresh existing preview) so synced pattern refs
            // re-read the content we just wrote during resolve.
            const previousBlocksSnapshot = hasAiPreview
                ? []
                : allEditorBlocks.map(blockToSnapshot);
            let previousBlocksJson = '[]';
            try {
                const encoded = JSON.stringify(previousBlocksSnapshot);
                previousBlocksJson =
                    encoded.length > MAX_PREVIOUS_BLOCKS_JSON ? '[]' : encoded;
            } catch (e) {
                previousBlocksJson = '[]';
            }

            const wrapperBlock = createBlock(
                'blockish/ai-preview',
                {
                    previousBlocks: previousBlocksJson,
                },
                aiBlocks
            );

            resetEditorBlocksRef.current([wrapperBlock]);

            const after = getBlocksRef.current();
            const didInject = after.some(
                (block) => block.name === 'blockish/ai-preview'
            );

            if (!didInject) {
                isProcessingRef.current = false;
                console.error(
                    'Blockish AI: resetEditorBlocks failed to inject ai-preview'
                );
                return;
            }

            injectedForKey.current = pendingKey;
            isProcessingRef.current = false;
        };

        // One-shot tries: immediate (if blocks ready), then a longer force
        // fallback so large pattern resolves can finish before we give up.
        processAndInject(false);
        const fallbackTimer = setTimeout(() => {
            processAndInject(true);
        }, 8000);

        // Subscribe only until inject succeeds — then unsubscribe.
        const unsubscribe = subscribe(() => {
            if (injectedForKey.current === pendingKey) {
                unsubscribe();
                return;
            }
            processAndInject(false);
        });

        return () => {
            isCancelled = true;
            unsubscribe();
            clearTimeout(fallbackTimer);
        };
    }, [pendingKey]);

    return null;
};

export default ApplyPendingSchema;
