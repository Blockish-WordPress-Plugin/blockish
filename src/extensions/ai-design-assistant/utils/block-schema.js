import { store as blockEditorStore } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { dispatch, select } from '@wordpress/data';
import apiFetch from '@wordpress/api-fetch';

const FALLBACK_IMAGE_URL = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='800' viewBox='0 0 1200 800'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop stop-color='%23f4f7fb'/%3E%3Cstop offset='.55' stop-color='%23dfe8f7'/%3E%3Cstop offset='1' stop-color='%23111827'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='1200' height='800' fill='url(%23g)'/%3E%3Ccircle cx='920' cy='190' r='190' fill='%23ffffff' opacity='.18'/%3E%3Ccircle cx='230' cy='630' r='260' fill='%230f172a' opacity='.08'/%3E%3Cpath d='M220 520 390 350l130 130 120-120 340 340H220z' fill='%23ffffff' opacity='.76'/%3E%3Ccircle cx='425' cy='260' r='58' fill='%23ffffff' opacity='.82'/%3E%3C/svg%3E";

const isUsableImageUrl = (value) => {
	if (typeof value !== 'string') {
		return false;
	}

	const url = value.trim();

	if (! /^(https?:\/\/|data:image\/)/i.test(url) || /[\s{}]/.test(url)) {
		return false;
	}

	if (url.startsWith('data:image/')) {
		return true;
	}

	try {
		const parsedUrl = new URL(url);
		const hostname = parsedUrl.hostname.toLowerCase();

		return ! [
			'example.com',
			'example.org',
			'example.net',
			'yourdomain.com',
			'localhost',
		].includes(hostname);
	} catch (error) {
		return false;
	}
};

export const serializeBlock = (block, includeInnerBlocks = true) => {
	if (!block) {
		return null;
	}

	return {
		clientId: block.clientId,
		name: block.name,
		attributes: block.attributes || {},
		innerBlocks: includeInnerBlocks
			? (block.innerBlocks || [])
				.map((innerBlock) => serializeBlock(innerBlock, true))
				.filter(Boolean)
			: [],
	};
};

export const getCurrentPageSchema = () => (
	(select(blockEditorStore).getBlocks() || [])
		.map((block) => serializeBlock(block, true))
		.filter(Boolean)
);

export const getFullPageAssistantContext = () => ({
	source: 'editor',
	scope: 'full_page',
	mode: 'blocks_with_inner_blocks',
	createdAt: new Date().toISOString(),
	blocks: getCurrentPageSchema(),
});

const getSchemaBlocks = (schemaPart) => {
	if (Array.isArray(schemaPart)) {
		return schemaPart;
	}

	if (Array.isArray(schemaPart?.blocks)) {
		return schemaPart.blocks;
	}

	return [];
};

const getClassTitle = (item) => (
	typeof item?.title === 'string'
		? item.title
		: item?.title?.raw || item?.title?.rendered || ''
);

const getClassContent = (item) => {
	if (!item) {
		return {};
	}

	const content = item.content;

	if (content && typeof content === 'object' && !Array.isArray(content)) {
		return content;
	}

	const rawContent = typeof content === 'string'
		? content
		: content?.raw || content?.rendered || '';

	try {
		const parsed = JSON.parse(rawContent || '{}');
		return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
			? parsed
			: {};
	} catch (error) {
		return rawContent ? { customCss: rawContent } : {};
	}
};

const normalizeClassRecord = (item) => ({
	id: item?.id,
	title: getClassTitle(item),
	content: getClassContent(item),
	parent: item?.parent || 0,
});

const normalizeClassPayload = (item) => ({
	title: item?.title || '',
	content: JSON.stringify(
		item?.content && typeof item.content === 'object' && !Array.isArray(item.content)
			? item.content
			: {}
	),
	parent: item?.parent || 0,
	status: item?.status || 'publish',
});

const getClassManagerOperations = (schemaPart) => (
	schemaPart?.extensions?.classManager ||
	schemaPart?.extensions?.['class-manager'] ||
	{}
);

const createTempClassResolver = () => {
	const classMap = new Map();

	return {
		add(key, value) {
			if (key && value?.id) {
				classMap.set(String(key), value);
			}
		},
		get(key) {
			return key ? classMap.get(String(key)) : null;
		},
	};
};

const resolveClassReference = (item, resolver) => {
	if (!item || typeof item !== 'object') {
		return item;
	}

	const resolvedClass = resolver.get(item.tempId) || resolver.get(item.title);

	if (!resolvedClass) {
		return item;
	}

	return {
		...item,
		id: resolvedClass.id,
		title: resolvedClass.title || item.title,
		tempId: undefined,
	};
};

const resolveBlockClassReferences = (schemaBlock, resolver) => {
	if (!schemaBlock || typeof schemaBlock !== 'object') {
		return schemaBlock;
	}

	const attributes = { ...(schemaBlock.attributes || {}) };

	if (Array.isArray(attributes.classManager)) {
		attributes.classManager = attributes.classManager.map((item) => (
			resolveClassReference(item, resolver)
		));
	}

	if (Array.isArray(attributes.classManagerSubselector)) {
		attributes.classManagerSubselector = attributes.classManagerSubselector.map((item) => {
			const resolved = resolveClassReference(item, resolver);
			const parentClass = resolver.get(resolved?.parent);

			return parentClass
				? { ...resolved, parent: parentClass.id }
				: resolved;
		});
	}

	return {
		...schemaBlock,
		attributes,
		innerBlocks: getSchemaBlocks(schemaBlock.innerBlocks).map((innerBlock) => (
			resolveBlockClassReferences(innerBlock, resolver)
		)),
	};
};

const applyClassManagerExtensions = async (schema, schemaPart) => {
	const operations = getClassManagerOperations(schemaPart);
	const createItems = Array.isArray(operations.create) ? operations.create : [];
	const updateItems = Array.isArray(operations.update) ? operations.update : [];
	const resolver = createTempClassResolver();
	const applied = {
		createdIds: [],
		updatedBefore: [],
	};
	const previousClasses = (schema?.prev?.extensions?.classManager || [])
		.map(normalizeClassRecord);

	for (const item of updateItems) {
		if (!item?.id) {
			continue;
		}

		const previousClass = previousClasses.find(
			(classItem) => Number(classItem.id) === Number(item.id)
		);

		if (previousClass) {
			applied.updatedBefore.push(previousClass);
		}

		const updated = await apiFetch({
			path: `/wp/v2/blockish-classes/${item.id}`,
			method: 'POST',
			data: normalizeClassPayload(item),
		});
		const normalized = normalizeClassRecord(updated);
		resolver.add(item.id, normalized);
		resolver.add(item.title, normalized);
	}

	for (const item of createItems) {
		const parentClass = resolver.get(item?.parent);
		const created = await apiFetch({
			path: '/wp/v2/blockish-classes',
			method: 'POST',
			data: normalizeClassPayload({
				...item,
				parent: parentClass?.id || item?.parent || 0,
			}),
		});
		const normalized = normalizeClassRecord(created);

		applied.createdIds.push(normalized.id);
		resolver.add(item?.tempId, normalized);
		resolver.add(item?.title, normalized);
		resolver.add(normalized.id, normalized);
	}

	return {
		applied,
		resolver,
	};
};

const restoreClassManagerExtensions = async (schema) => {
	const applied = schema?._applied?.classManager;

	if (!applied) {
		return;
	}

	for (const previousClass of applied.updatedBefore || []) {
		if (!previousClass?.id) {
			continue;
		}

		await apiFetch({
			path: `/wp/v2/blockish-classes/${previousClass.id}`,
			method: 'POST',
			data: normalizeClassPayload(previousClass),
		});
	}

	for (const createdId of applied.createdIds || []) {
		if (!createdId) {
			continue;
		}

		await apiFetch({
			path: `/wp/v2/blockish-classes/${createdId}?force=true`,
			method: 'DELETE',
		});
	}
};

const normalizeImageAttributes = (attributes) => {
	const imageValue = attributes.image;
	const image = (
		imageValue &&
		typeof imageValue === 'object' &&
		! Array.isArray(imageValue)
	) ? imageValue : {};
	const media = (
		attributes.media &&
		typeof attributes.media === 'object' &&
		! Array.isArray(attributes.media)
	) ? attributes.media : {};
	const rawUrl = (
		typeof imageValue === 'string' && imageValue.trim()
			? imageValue.trim()
			: null
	) || image.url || image.source_url || image.src || media.url || media.source_url || media.src || attributes.url || attributes.imageUrl || attributes.src;
	const url = isUsableImageUrl(rawUrl) ? rawUrl.trim() : FALLBACK_IMAGE_URL;
	const alt = attributes.alt || image.alt || attributes.title || image.title || 'Generated section image';

	return {
		...attributes,
		image: {
			...image,
			url,
			alt,
			width: typeof image.width === 'number' ? image.width : 1200,
			height: typeof image.height === 'number' ? image.height : 800,
		},
		alt,
		imageSize: attributes.imageSize || { value: 'full', label: 'Full Size' },
	};
};

const normalizeSchemaBlockForEditor = (schemaBlock) => {
	const attributes = { ...(schemaBlock.attributes || {}) };

	if (schemaBlock.name === 'blockish/container') {
		attributes.isVariationPicked = true;
	}

	if (schemaBlock.name === 'blockish/image') {
		return {
			...schemaBlock,
			attributes: normalizeImageAttributes(attributes),
		};
	}

	return {
		...schemaBlock,
		attributes,
	};
};

const createEditorBlock = (schemaBlock) => {
	if (!schemaBlock?.name) {
		return null;
	}

	const normalizedBlock = normalizeSchemaBlockForEditor(schemaBlock);

	const innerBlocks = getSchemaBlocks(normalizedBlock.innerBlocks)
		.map(createEditorBlock)
		.filter(Boolean);

	return createBlock(
		normalizedBlock.name,
		normalizedBlock.attributes || {},
		innerBlocks
	);
};

const resetEditorBlocks = (blocks) => {
	const editorDispatch = dispatch(blockEditorStore);

	if (typeof editorDispatch.resetBlocks === 'function') {
		editorDispatch.resetBlocks(blocks);
		return;
	}

	const currentClientIds = (select(blockEditorStore).getBlocks() || [])
		.map((block) => block.clientId)
		.filter(Boolean);

	if (currentClientIds.length) {
		editorDispatch.replaceBlocks(currentClientIds, blocks);
		return;
	}

	editorDispatch.insertBlocks(blocks);
};

export const applyAssistantSchema = async (schema, target = 'new') => {
	const schemaPart = schema?.[target] || schema;
	const nextSchema = { ...schema };
	let schemaBlocks = getSchemaBlocks(schemaPart);
	let didApplyClassManager = false;

	if (target === 'new') {
		const { applied, resolver } = await applyClassManagerExtensions(schema, schemaPart);
		didApplyClassManager = Boolean(
			applied.createdIds.length || applied.updatedBefore.length
		);

		schemaBlocks = schemaBlocks.map((block) => (
			resolveBlockClassReferences(block, resolver)
		));
		nextSchema._applied = {
			...(nextSchema._applied || {}),
			classManager: applied,
		};
		nextSchema.new = {
			...(nextSchema.new || {}),
			blocks: schemaBlocks,
		};
	} else {
		await restoreClassManagerExtensions(schema);
	}

	let blocks = [];

	try {
		blocks = schemaBlocks.map(createEditorBlock).filter(Boolean);
	} catch (error) {
		if (target === 'new') {
			await restoreClassManagerExtensions(nextSchema);
		}

		throw error;
	}

	if (!blocks.length) {
		if (target === 'prev' && schemaPart?.scope === 'full_page') {
			resetEditorBlocks([]);
			return {
				applied: true,
				schema: nextSchema,
			};
		}

		return {
			applied: didApplyClassManager,
			schema: nextSchema,
		};
	}

	const editorDispatch = dispatch(blockEditorStore);
	const prevBlocks = getSchemaBlocks(schema?.prev);
	const selectedClientIds = prevBlocks
		.map((block) => block.clientId)
		.filter(Boolean);
	const shouldReplaceSelection = (
		target === 'new'
			? schema?.prev?.scope === 'selection'
			: schemaPart?.scope === 'selection'
	) && selectedClientIds.length;

	try {
		if (shouldReplaceSelection) {
			editorDispatch.replaceBlocks(selectedClientIds, blocks);
			return {
				applied: true,
				schema: nextSchema,
			};
		}

		resetEditorBlocks(blocks);
	} catch (error) {
		if (target === 'new') {
			await restoreClassManagerExtensions(nextSchema);
		}

		throw error;
	}

return {
	applied: true,
	schema: nextSchema,
};
};
