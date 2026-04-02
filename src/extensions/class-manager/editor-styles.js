import { registerPlugin } from '@wordpress/plugins';
import { useSelect } from '@wordpress/data';
import { useEffect, useMemo } from '@wordpress/element';

const STYLE_ID = 'blockish-class-manager-editor-styles';

function normalizeSlug(value = '') {
	return String(value)
		.trim()
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^a-z0-9_-]/g, '');
}

function getRecordTitle(record = {}) {
	if (typeof record?.title?.raw === 'string') {
		return record.title.raw;
	}
	if (typeof record?.title?.rendered === 'string') {
		return record.title.rendered;
	}
	return '';
}

function getRecordContent(record = {}) {
	if (typeof record?.content?.raw === 'string') {
		return record.content.raw;
	}
	if (typeof record?.content?.rendered === 'string') {
		return record.content.rendered;
	}
	return '';
}

function normalizeDeclarations(css = '') {
	return String(css)
		.replace(/<[^>]+>/g, '')
		.replace(/[{}]/g, '')
		.trim();
}

function compileClassCss(records = []) {
	return records
		.map((record) => {
			const slug = normalizeSlug(getRecordTitle(record));
			const content = getRecordContent(record).trim();

			if (!slug || !content) {
				return '';
			}

			if (content.includes('{')) {
				return content;
			}

			const declarations = normalizeDeclarations(content);
			if (!declarations) {
				return '';
			}

			const normalized = declarations.endsWith(';') ? declarations : `${declarations};`;
			return `.${slug}{${normalized}}`;
		})
		.filter(Boolean)
		.join('');
}

function RenderClassManagerEditorStyles() {
	const records = useSelect((select) => {
		const { getEntityRecords } = select('core');
		return getEntityRecords('postType', 'blockish-class-manager', {
			per_page: -1,
			orderby: 'title',
			order: 'asc',
		}) || [];
	}, []);

	const css = useMemo(() => compileClassCss(records), [records]);

	useEffect(() => {
		let styleTag = document.getElementById(STYLE_ID);
		if (!styleTag) {
			styleTag = document.createElement('style');
			styleTag.id = STYLE_ID;
			document.head.appendChild(styleTag);
		}
		styleTag.textContent = css;
	}, [css]);

	return null;
}

registerPlugin('blockish-class-manager-editor-styles', {
	render: RenderClassManagerEditorStyles,
});
