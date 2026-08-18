import { dispatch, resolveSelect, select } from '@wordpress/data';

const CLASS_POST_TYPE = 'blockish-classes';
const CLASS_META_KEY = 'blockishClassManagerStyles';
const CLASS_STYLE_TYPE = 'blockish-classes-styles';
const CLASS_ENTITY_QUERY = { per_page: -1 };

/**
 * After REST class import, Gutenberg still holds a stale getEntityRecords cache.
 * Rebuild editor settings.styles from fresh Class Manager meta so inserts are
 * styled immediately (without requiring a full page reload).
 *
 * @return {Promise<void>}
 */
export async function syncClassManagerEditorStyles() {
	try {
		const coreDispatch = dispatch('core');
		if (typeof coreDispatch.invalidateResolution === 'function') {
			coreDispatch.invalidateResolution('getEntityRecords', [
				'postType',
				CLASS_POST_TYPE,
				CLASS_ENTITY_QUERY,
			]);
		}

		const records =
			(await resolveSelect('core').getEntityRecords(
				'postType',
				CLASS_POST_TYPE,
				CLASS_ENTITY_QUERY
			)) || [];

		let css = '';
		records.forEach((record) => {
			const edited =
				select('core').getEditedEntityRecord(
					'postType',
					CLASS_POST_TYPE,
					record?.id
				) || record;
			const metaCss = edited?.meta?.[CLASS_META_KEY];
			if (typeof metaCss === 'string' && metaCss.trim()) {
				css += metaCss;
			}
		});

		const editorSelect = select('core/editor');
		const editorDispatch = dispatch('core/editor');
		if (
			typeof editorSelect?.getEditorSettings !== 'function' ||
			typeof editorDispatch?.updateEditorSettings !== 'function'
		) {
			return;
		}

		const settings = editorSelect.getEditorSettings() || {};
		const styles = Array.isArray(settings.styles) ? [...settings.styles] : [];
		const index = styles.findIndex(
			(style) => style?.__unstableType === CLASS_STYLE_TYPE
		);

		// Even empty css: drop stale entry so RenderClassManagerStyles can refill.
		if (index === -1) {
			if (!css) {
				return;
			}
			editorDispatch.updateEditorSettings({
				styles: [
					...styles,
					{
						__unstableType: CLASS_STYLE_TYPE,
						css,
					},
				],
			});
			return;
		}

		editorDispatch.updateEditorSettings({
			styles: styles.map((style, i) =>
				i === index ? { ...style, css } : style
			),
		});
	} catch (error) {
		// Non-fatal — a reload still applies Class Manager styles.
		// eslint-disable-next-line no-console
		console.warn(
			'Blockish: could not sync Class Manager styles into the editor after template insert.',
			error
		);
	}
}

/**
 * Remap cloud entity IDs inside serialized block markup.
 *
 * @param {string} content
 * @param {Record<string|number, number>} idMap cloudId -> localId
 * @return {string}
 */
export function remapContent(content, idMap) {
	if (!content || !idMap) {
		return content || '';
	}

	let out = String(content);
	const entries = Object.entries(idMap).sort(
		(a, b) => String(b[0]).length - String(a[0]).length || Number(b[0]) - Number(a[0])
	);

	entries.forEach(([cloudId, localId]) => {
		const c = String(cloudId);
		const l = String(localId);
		out = out.replace(new RegExp(`"ref"\\s*:\\s*${c}\\b`, 'g'), `"ref":${l}`);
		out = out.replace(new RegExp(`"formId"\\s*:\\s*${c}\\b`, 'g'), `"formId":${l}`);
	});

	// Remap Class Manager ids only inside classManager / classManagerSubselector payloads.
	out = remapClassManagerIds(out, idMap);

	return out;
}

/**
 * Remap "id": cloudId inside classManager / classManagerSubselector JSON only.
 *
 * @param {string} content
 * @param {Record<string|number, number>} idMap
 * @return {string}
 */
function remapClassManagerIds(content, idMap) {
	const keys = ['classManager', 'classManagerSubselector'];
	let out = content;

	keys.forEach((key) => {
		out = out.replace(
			new RegExp(`"${key}"\\s*:\\s*(\\[[\\s\\S]*?\\])`, 'g'),
			(match, arrJson) => {
				let remapped = arrJson;
				Object.entries(idMap).forEach(([cloudId, localId]) => {
					remapped = remapped.replace(
						new RegExp(`"id"\\s*:\\s*${cloudId}\\b`, 'g'),
						`"id":${localId}`
					);
				});
				return `"${key}":${remapped}`;
			}
		);
	});

	return out;
}

/**
 * Collect unique pattern ref + formId + classManager ids from serialized markup.
 *
 * @param {string} content
 * @return {{ patternIds: number[], formIds: number[], classIds: number[] }}
 */
export function extractDependencyIds(content) {
	const patternIds = new Set();
	const formIds = new Set();
	const classIds = new Set();
	const raw = String(content || '');

	raw.replace(/"ref"\s*:\s*(\d+)/g, (_, id) => {
		patternIds.add(Number(id));
		return _;
	});
	raw.replace(/"formId"\s*:\s*(\d+)/g, (_, id) => {
		formIds.add(Number(id));
		return _;
	});

	['classManager', 'classManagerSubselector'].forEach((key) => {
		const re = new RegExp(`"${key}"\\s*:\\s*(\\[[\\s\\S]*?\\])`, 'g');
		let match;
		while ((match = re.exec(raw)) !== null) {
			const chunk = match[1];
			chunk.replace(/"id"\s*:\s*(\d+)/g, (_, id) => {
				classIds.add(Number(id));
				return _;
			});
		}
	});

	return {
		patternIds: [...patternIds],
		formIds: [...formIds],
		classIds: [...classIds],
	};
}

/**
 * Map child Class Manager ids from classManagerSubselector payloads.
 * Used when the cloud API omits children[].id but content still has parent/title.
 *
 * @param {string} content
 * @return {Record<number, { parent: number, title: string }>}
 */
function extractClassSubselectorMeta(content) {
	const meta = {};
	const raw = String(content || '');
	const re = /"classManagerSubselector"\s*:\s*(\[[\s\S]*?\])/g;
	let match;

	while ((match = re.exec(raw)) !== null) {
		try {
			const arr = JSON.parse(match[1]);
			if (!Array.isArray(arr)) {
				continue;
			}
			arr.forEach((entry) => {
				const id = Number(entry?.id);
				if (!id) {
					return;
				}
				meta[id] = {
					parent: Number(entry.parent) || 0,
					title: String(entry.title || entry.name || ''),
				};
			});
		} catch (e) {
			// Ignore malformed chunks; parent lookup also has title fallbacks.
		}
	}

	return meta;
}

/**
 * Fetch a single design with dependency bundle from the cloud API.
 *
 * @param {number|string} designId
 * @return {Promise<object>}
 */
export async function fetchDesignWithDependencies(designId) {
	const token = window.blockishTemplateLibraryData?.token || '';
	const apiBase = window.blockishTemplateLibraryData?.url || '';
	const url = new URL(`${apiBase}/designs/${designId}`);
	url.searchParams.append('token', token);
	// Bust intermediary caches that may still serve empty dependencies.classes.
	url.searchParams.append('_ts', String(Date.now()));

	const res = await fetch(url.toString());
	if (!res.ok) {
		throw new Error(`Failed to load design ${designId}: ${res.status}`);
	}
	return res.json();
}

/**
 * Index flat dependency arrays by cloud id.
 *
 * @param {object} dependencies
 * @return {{ patterns: Record<number, object>, forms: Record<number, object>, classes: Record<number, object> }}
 */
function indexDependencies(dependencies = {}) {
	const patterns = {};
	const forms = {};
	const classes = {};

	(dependencies.patterns || []).forEach((item) => {
		if (item?.id) {
			patterns[Number(item.id)] = item;
		}
	});
	(dependencies.forms || []).forEach((item) => {
		if (item?.id) {
			forms[Number(item.id)] = item;
		}
	});
	(dependencies.classes || []).forEach((item) => {
		if (item?.id) {
			const parent = { ...item, id: Number(item.id) };
			classes[parent.id] = parent;
			// Index child cloud ids so classManagerSubselector lookups resolve.
			(parent.children || []).forEach((child) => {
				const childId = Number(child?.id);
				if (childId) {
					classes[childId] = parent;
				}
			});
		}
	});

	return { patterns, forms, classes };
}

/**
 * Recursively ensure every pattern/form/class referenced in content exists locally.
 *
 * @param {string} content
 * @param {object} catalog
 * @param {Record<number, number>} idMap
 * @param {Function} apiFetch
 * @param {Set<number|string>} stack
 */
async function ensureDepsInContent(content, catalog, idMap, apiFetch, stack, classMeta) {
	const { patternIds, formIds, classIds } = extractDependencyIds(content);

	for (const classId of classIds) {
		await ensureClass(classId, catalog, idMap, apiFetch, stack, classMeta);
	}

	for (const patternId of patternIds) {
		await ensurePattern(patternId, catalog, idMap, apiFetch, stack, classMeta);
	}

	for (const formId of formIds) {
		await ensureForm(formId, catalog, idMap, apiFetch, stack, classMeta);
	}
}

/**
 * Install one Class Manager class locally (parent + children via css import).
 *
 * @param {number} cloudId
 * @param {object} catalog
 * @param {Record<number, number>} idMap
 * @param {Function} apiFetch
 * @param {Set<number|string>} stack
 * @return {Promise<number>} local id
 */
async function ensureClass(cloudId, catalog, idMap, apiFetch, stack, classMeta = {}) {
	const id = Number(cloudId);
	if (idMap[id]) {
		return idMap[id];
	}

	let classItem = catalog.classes[id];
	if (!classItem) {
		// Child ids appear in classManagerSubselector; catalog usually keys parents.
		classItem = Object.values(catalog.classes || {}).find((item) =>
			(item.children || []).some((child) => Number(child?.id) === id)
		);
	}
	if (!classItem) {
		const hint = classMeta[id] || {};
		if (hint.parent && catalog.classes[hint.parent]) {
			classItem = catalog.classes[hint.parent];
		} else if (hint.title) {
			classItem = Object.values(catalog.classes || {}).find((item) =>
				(item.children || []).some(
					(child) => String(child.title || child.name || '') === hint.title
				)
			);
		}
	}

	if (!classItem) {
		const catalogCount = Object.keys(catalog.classes || {}).length;
		throw new Error(
			`Missing cloud class dependency ${id} (catalog has ${catalogCount}). Check dependencies.classes / children[].id.`
		);
	}

	const parentCloudId = Number(classItem.id);
	const key = `class:${parentCloudId}`;

	if (idMap[parentCloudId]) {
		return idMap[id] || idMap[parentCloudId];
	}

	if (stack.has(key)) {
		throw new Error(`Circular class dependency detected (id ${parentCloudId}).`);
	}

	stack.add(key);

	const imported = await apiFetch({
		path: '/blockish/v1/dashboard-tools/class-manager/import',
		method: 'POST',
		data: {
			name: classItem.name || classItem.title || `library-class-${parentCloudId}`,
			css: classItem.css || '',
			content: classItem.content || '',
			children: classItem.children || [],
		},
	});

	stack.delete(key);

	if (!imported?.id) {
		throw new Error(
			imported?.message || `Failed to import Class Manager class ${parentCloudId}.`
		);
	}

	idMap[parentCloudId] = Number(imported.id);

	const localChildren = Array.isArray(imported.children) ? imported.children : [];
	(classItem.children || []).forEach((cloudChild) => {
		const title = String(cloudChild.title || cloudChild.name || '');
		let cloudChildId = Number(cloudChild?.id);
		if (!cloudChildId && title) {
			const matched = Object.entries(classMeta).find(
				([, m]) =>
					m.title === title &&
					(!m.parent || Number(m.parent) === parentCloudId)
			);
			if (matched) {
				cloudChildId = Number(matched[0]);
			}
		}
		if (!cloudChildId) {
			return;
		}
		const localChild = localChildren.find(
			(lc) => String(lc?.title || '') === title
		);
		if (localChild?.id) {
			idMap[cloudChildId] = Number(localChild.id);
		}
	});

	return idMap[id] || idMap[parentCloudId];
}

/**
 * Install one cloud pattern locally (after recursively installing its nested deps).
 *
 * @param {number} cloudId
 * @param {object} catalog
 * @param {Record<number, number>} idMap
 * @param {Function} apiFetch
 * @param {Set<number|string>} stack
 * @return {Promise<number>} local id
 */
async function ensurePattern(cloudId, catalog, idMap, apiFetch, stack, classMeta = {}) {
	const id = Number(cloudId);
	if (idMap[id]) {
		return idMap[id];
	}

	if (stack.has(id)) {
		throw new Error(`Circular pattern dependency detected (id ${id}).`);
	}

	const pattern = catalog.patterns[id];
	if (!pattern) {
		throw new Error(
			`Missing cloud pattern dependency ${id}. Re-fetch design with dependencies.`
		);
	}

	stack.add(id);
	await ensureDepsInContent(
		pattern.content || '',
		catalog,
		idMap,
		apiFetch,
		stack,
		classMeta
	);
	stack.delete(id);

	const remapped = remapContent(pattern.content || '', idMap);
	const created = await apiFetch({
		path: '/wp/v2/blocks',
		method: 'POST',
		data: {
			title: pattern.title || `Library pattern ${id}`,
			content: remapped,
			status: 'publish',
		},
	});

	idMap[id] = created.id;
	return created.id;
}

/**
 * Install one cloud form locally (after recursively installing nested pattern/form deps).
 *
 * @param {number} cloudId
 * @param {object} catalog
 * @param {Record<number, number>} idMap
 * @param {Function} apiFetch
 * @param {Set<number|string>} stack
 * @return {Promise<number>} local id
 */
async function ensureForm(cloudId, catalog, idMap, apiFetch, stack, classMeta = {}) {
	const id = Number(cloudId);
	if (idMap[id]) {
		return idMap[id];
	}

	if (stack.has(`form:${id}`)) {
		throw new Error(`Circular form dependency detected (id ${id}).`);
	}

	const formsPkg = window.blockishTemplateLibraryData?.packages?.forms;
	if (!formsPkg?.installed || (formsPkg.requires_license && !formsPkg.licensed)) {
		const err = new Error('FORMS_REQUIRED');
		err.code = 'FORMS_REQUIRED';
		throw err;
	}

	const form = catalog.forms[id];
	if (!form) {
		throw new Error(
			`Missing cloud form dependency ${id}. Re-fetch design with dependencies.`
		);
	}

	stack.add(`form:${id}`);
	await ensureDepsInContent(
		form.content || '',
		catalog,
		idMap,
		apiFetch,
		stack,
		classMeta
	);
	stack.delete(`form:${id}`);

	const remapped = remapContent(form.content || '', idMap);
	const meta = form.meta && typeof form.meta === 'object' ? form.meta : {};
	const created = await apiFetch({
		path: '/wp/v2/blockish_form',
		method: 'POST',
		data: {
			title: form.title || `Library form ${id}`,
			content: remapped,
			status: 'publish',
			meta,
		},
	});

	idMap[id] = created.id;
	return created.id;
}

/**
 * Create local patterns + forms + classes from cloud dependencies, remap IDs, return root content.
 *
 * @param {object} design
 * @param {object} options
 * @param {Function} options.apiFetch
 * @return {Promise<string>} Remapped root content ready to parse/insert.
 */
export async function installDependenciesAndRemap(design, { apiFetch }) {
	const catalog = indexDependencies(design.dependencies || {});
	const idMap = {};
	const stack = new Set();
	const classMeta = {
		...extractClassSubselectorMeta(design.content || ''),
	};
	Object.values(catalog.patterns || {}).forEach((pattern) => {
		Object.assign(classMeta, extractClassSubselectorMeta(pattern.content || ''));
	});
	Object.values(catalog.forms || {}).forEach((form) => {
		Object.assign(classMeta, extractClassSubselectorMeta(form.content || ''));
	});

	// Recursively install everything reachable from the root content.
	await ensureDepsInContent(
		design.content || '',
		catalog,
		idMap,
		apiFetch,
		stack,
		classMeta
	);

	// Also walk every cataloged entity in case root only refs a subset but
	// nested entities reference siblings not yet pulled via root parse order.
	for (const classId of Object.keys(catalog.classes)) {
		await ensureClass(Number(classId), catalog, idMap, apiFetch, stack, classMeta);
	}
	for (const patternId of Object.keys(catalog.patterns)) {
		await ensurePattern(
			Number(patternId),
			catalog,
			idMap,
			apiFetch,
			stack,
			classMeta
		);
	}
	for (const formId of Object.keys(catalog.forms)) {
		await ensureForm(Number(formId), catalog, idMap, apiFetch, stack, classMeta);
	}

	const remapped = remapContent(design.content || '', idMap);

	// Import uses local REST, so Class Manager entities/styles are invisible to the
	// editor until we invalidate + re-inject stylesheet CSS.
	if (Object.keys(catalog.classes || {}).length > 0) {
		await syncClassManagerEditorStyles();
	}

	return remapped;
}
