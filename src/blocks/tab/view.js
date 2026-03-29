const getItems = (root) =>
	Array.from(
		root.querySelectorAll(
			':scope > .blockish-block-tab-layout > .blockish-block-tab-items > .blockish-block-tab-item'
		)
	);

const ensureNav = (root) => {
	let nav = root.querySelector(
		':scope > .blockish-block-tab-layout > .blockish-block-tab-nav'
	);

	if (nav) {
		return nav;
	}

	nav = document.createElement('div');
	nav.className = 'blockish-block-tab-nav';
	nav.setAttribute('role', 'tablist');
	nav.setAttribute('aria-label', 'Tabs');
	const layout = root.querySelector(':scope > .blockish-block-tab-layout');
	if (layout) {
		layout.prepend(nav);
	}

	return nav;
};

const setActiveTab = (root, nextIndex) => {
	const items = getItems(root);
	const buttons = Array.from(
		root.querySelectorAll(
			':scope > .blockish-block-tab-layout > .blockish-block-tab-nav > .blockish-block-tab-trigger'
		)
	);

	if (!items.length || !buttons.length) {
		return;
	}

	const safeIndex = Math.max(0, Math.min(nextIndex, items.length - 1));
	items.forEach((item, index) => {
		item.hidden = index !== safeIndex;
	});
	buttons.forEach((button, index) => {
		const isActive = index === safeIndex;
		button.setAttribute('aria-selected', isActive ? 'true' : 'false');
		button.setAttribute('tabindex', isActive ? '0' : '-1');
	});
};

const mountTab = (root) => {
	const items = getItems(root);
	if (!items.length) {
		return;
	}

	const nav = ensureNav(root);
	let buttons = Array.from(
		nav.querySelectorAll(':scope > .blockish-block-tab-trigger')
	);

	if (!buttons.length) {
		items.forEach((item, index) => {
			const button = document.createElement('button');
			button.type = 'button';
			button.className = 'blockish-block-tab-trigger';
			button.setAttribute('role', 'tab');

			const iconPath = item.dataset.iconPath || '';
			const iconViewBox = item.dataset.iconViewbox || '0 0 24 24';
			if (iconPath) {
				const iconWrap = document.createElement('span');
				iconWrap.className = 'blockish-block-tab-trigger-icon';
				iconWrap.setAttribute('aria-hidden', 'true');
				const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
				svg.setAttribute('viewBox', iconViewBox);
				svg.setAttribute('width', '16');
				svg.setAttribute('height', '16');
				const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
				path.setAttribute('d', iconPath);
				svg.appendChild(path);
				iconWrap.appendChild(svg);
				button.appendChild(iconWrap);
			}

			const titleNode = document.createElement('span');
			titleNode.className = 'blockish-block-tab-trigger-title';
			titleNode.textContent = item.dataset.title || `Tab ${index + 1}`;
			button.appendChild(titleNode);
			nav.appendChild(button);
		});

		buttons = Array.from(
			nav.querySelectorAll(':scope > .blockish-block-tab-trigger')
		);
	}

	buttons.forEach((button, index) => {
		button.addEventListener('click', () => setActiveTab(root, index));
	});

	const itemDefaultIndex = items.findIndex(
		(item) => item.dataset.defaultActive === 'true'
	);
	const defaultIndex =
		itemDefaultIndex >= 0 ? itemDefaultIndex : Number(root.dataset.defaultTab) || 0;
	setActiveTab(root, defaultIndex);
};

const initTab = () => {
	document
		.querySelectorAll('.wp-block-blockish-tab')
		.forEach((root) => mountTab(root));
};

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', initTab);
} else {
	initTab();
}
