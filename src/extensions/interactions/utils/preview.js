import { compileInteraction } from './compile';
import { collectPlayTargets, getActionType, runAction } from './engine';

export function findEditorBlockElement(clientId) {
	if (!clientId) return null;
	const sel = `[data-block="${clientId}"]`;
	const from = (doc) => doc?.querySelector?.(sel) || null;
	const iframe = document.querySelector('iframe[name="editor-canvas"]');
	return from(document) || from(iframe?.contentDocument);
}

/**
 * Play the draft once on the selected block. Visibility / class revert after a beat.
 */
export function previewInteraction(draft, clientId) {
	const root = findEditorBlockElement(clientId);
	if (!root) return false;

	root.scrollIntoView({ block: 'center', inline: 'nearest', behavior: 'smooth' });

	const interaction = compileInteraction({ ...draft, scope: 'block' });
	if (!interaction) return false;

	const type = getActionType(interaction);
	if (type === 'emit' || type === 'custom') {
		return false;
	}

	const event = { type: 'preview' };
	const plays = collectPlayTargets(interaction, root);
	const targets = plays.length ? plays : [{ el: root, extraDelay: 0 }];
	targets.forEach(({ el, extraDelay }) => {
		runAction(interaction, event, el, 'forward', extraDelay);
	});

	if (type !== 'preset') {
		window.setTimeout(() => {
			targets.forEach(({ el, extraDelay }) => {
				runAction(interaction, event, el, 'reverse', extraDelay);
			});
		}, 1400);
	} else if (typeof window !== 'undefined' && window.blockishAnimation) {
		const tweens = interaction.action?.motion?.tweens || [];
		const ms = tweens.reduce((sum, tween) => {
			const duration = Number(tween?.duration) || 0.6;
			const delay = Number(tween?.delay) || 0;
			return sum + (duration + delay) * 1000;
		}, 400);
		window.setTimeout(() => {
			targets.forEach(({ el, extraDelay }) => {
				runAction(interaction, event, el, 'reverse', extraDelay);
			});
		}, Math.min(12000, Math.max(800, ms)));
	}

	return true;
}
