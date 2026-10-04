import { compileInteraction } from './compile';
import { collectPlayTargets, getActionType, runAction } from './engine';

export function findEditorBlockElement(clientId) {
	if (!clientId) return null;
	const sel = `[data-block="${clientId}"]`;
	const from = (doc) => doc?.querySelector?.(sel) || null;
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	return from(document) || from(iframe?.contentDocument);
}

const PREVIEW_HOLD_MS = 600;
// Running preset preview per block, so a new click first restores the old one.
const activePreviews = new WeakMap();
const PREVIEW_CLASSES = ['blockish-ix-prep', 'blockish-ix-run', 'blockish-ix-pin'];

/**
 * Inline styles of each element, its parent and all descendants, before a preview.
 */
function snapshotStyles(elements) {
	const nodes = new Set();
	elements.forEach((el) => {
		[el, el.parentElement, ...el.querySelectorAll('*')].forEach((node) => {
			if (node) nodes.add(node);
		});
	});
	return [...nodes].map((node) => [node, node.getAttribute('style')]);
}

function restoreStyles(snapshot) {
	snapshot.forEach(([node, style]) => {
		if (style === null) {
			node.removeAttribute('style');
		} else {
			node.setAttribute('style', style);
		}
		node.classList?.remove(...PREVIEW_CLASSES);
		delete node.dataset?.blockishIxPlay;
	});
}

/**
 * Play the draft once on the selected block, then restore it to its original state.
 */
export function previewInteraction(draft, clientId) {
	const root = findEditorBlockElement(clientId);
	if (!root) return false;

	root.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });

	const interaction = compileInteraction({ ...draft, scope: 'block' });
	if (!interaction) return false;

	const type = getActionType(interaction);
	if (type === 'emit' || type === 'custom' || type === 'scrollTo') {
		return false;
	}

	const event = { type: 'preview' };
	const plays = collectPlayTargets(interaction, root);
	const targets = plays.length ? plays : [{ el: root, extraDelay: 0 }];

	if (type !== 'preset') {
		targets.forEach(({ el, extraDelay }) => {
			runAction(interaction, event, el, 'forward', extraDelay);
		});
		window.setTimeout(() => {
			targets.forEach(({ el, extraDelay }) => {
				runAction(interaction, event, el, 'reverse', extraDelay);
			});
		}, 1400);
		return true;
	}

	// Play once, hold the end frame, then put the block back exactly as it was.
	activePreviews.get(root)?.();
	const snapshot = snapshotStyles([root, ...targets.map(({ el }) => el)]);
	let restored = false;
	const restore = () => {
		if (restored) return;
		restored = true;
		activePreviews.delete(root);
		const anim = window.blockishAnimation;
		targets.forEach(({ el }) => anim?.stop?.(el));
		restoreStyles(snapshot);
	};

	activePreviews.set(root, restore);

	let completed = 0;
	targets.forEach(({ el, extraDelay }) => {
		runAction(interaction, event, el, 'forward', extraDelay, () => {
			completed += 1;
			if (completed === targets.length) {
				window.setTimeout(restore, PREVIEW_HOLD_MS);
			}
		});
	});

	// Infinite loops never complete; stop them after a short demo.
	const loops = Number(interaction.action?.motion?.repeat) === -1;
	window.setTimeout(restore, loops ? 4000 : 12000);

	return true;
}
