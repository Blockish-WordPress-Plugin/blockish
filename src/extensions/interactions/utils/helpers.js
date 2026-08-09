import { compileInteraction, normalizeInteraction } from './compile';

export const PAGE_META_KEY = 'blockish_page_interactions';
export const GLOBAL_API = '/blockish/v1/dashboard-tools/global-interactions';

export function ensureId(item) {
	if (item?.id) return item;
	return {
		...item,
		id: `ix_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
	};
}

export function upsertInList(list, item) {
	const nextItem = ensureId(item);
	const idx = list.findIndex((i) => i?.id && i.id === nextItem.id);
	if (idx === -1) {
		return [...list, nextItem];
	}
	const next = [...list];
	next[idx] = nextItem;
	return next;
}

export function isFormSaveDisabled(draft) {
	if (!draft) return true;
	if (draft?.when?.source === 'listen' && !draft?.when?.eventName?.trim()) {
		return true;
	}
	if (draft?.action?.type === 'emit' && !draft?.action?.eventName?.trim()) {
		return true;
	}
	return false;
}

export function prepareSavedItem(draft, scope) {
	const compiled = compileInteraction({
		...draft,
		scope,
	});
	if (!compiled) return null;
	return ensureId(normalizeInteraction(compiled, scope));
}

export function parsePageMeta(pageRaw) {
	let list = [];
	if (Array.isArray(pageRaw)) {
		list = pageRaw;
	} else if (typeof pageRaw === 'string' && pageRaw.trim()) {
		try {
			const parsed = JSON.parse(pageRaw);
			if (Array.isArray(parsed)) list = parsed;
		} catch (e) {
			list = [];
		}
	}
	return list.map((i) => normalizeInteraction(i, 'page')).filter(Boolean);
}

export function normalizeList(items, scope) {
	return (items || [])
		.map((i) => normalizeInteraction(i, scope))
		.filter(Boolean)
		.map(ensureId);
}

export function exportJson(data, filename) {
	const dataStr =
		'data:text/json;charset=utf-8,' +
		encodeURIComponent(JSON.stringify(data));
	const downloadAnchorNode = document.createElement('a');
	downloadAnchorNode.setAttribute('href', dataStr);
	downloadAnchorNode.setAttribute('download', filename);
	document.body.appendChild(downloadAnchorNode);
	downloadAnchorNode.click();
	downloadAnchorNode.remove();
}

export function importJsonFile() {
	return new Promise((resolve, reject) => {
		const input = document.createElement('input');
		input.type = 'file';
		input.accept = '.json';
		input.onchange = (e) => {
			const file = e.target.files?.[0];
			if (!file) {
				reject(new Error('No file'));
				return;
			}
			const reader = new FileReader();
			reader.onload = (event) => {
				try {
					const data = JSON.parse(event.target.result);
					if (!Array.isArray(data)) {
						throw new Error('Invalid format');
					}
					resolve(data);
				} catch (err) {
					reject(err);
				}
			};
			reader.onerror = () => reject(new Error('Read failed'));
			reader.readAsText(file);
		};
		input.click();
	});
}
