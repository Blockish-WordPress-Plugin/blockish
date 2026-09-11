/**
 * Shared interaction runtime (frontend view + editor preview).
 */

import { ALLOWED_EASING, PRESET_ANIMATE } from './animate-defaults';
import {
	getMotionTweens,
	gsapEaseToCss,
	toSeconds,
	tweenToCssOpts,
} from './motion';

export const PRESET_IDS = [
	'fadeIn',
	'fadeUp',
	'fadeDown',
	'fadeLeft',
	'fadeRight',
	'zoomIn',
	'custom',
];

const num = (value, fallback) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

const applyAnimateVars = (el, opts) => {
	if (!el?.style) return;
	const setPx = (name, value) => {
		if (value === undefined) {
			el.style.removeProperty(name);
			return;
		}
		el.style.setProperty(name, `${value}px`);
	};
	const setDeg = (name, value) => {
		if (value === undefined) {
			el.style.removeProperty(name);
			return;
		}
		el.style.setProperty(name, `${value}deg`);
	};
	const setUnit = (name, value, divisor) => {
		if (value === undefined) {
			el.style.removeProperty(name);
			return;
		}
		el.style.setProperty(name, String(value / divisor));
	};
	setPx('--blockish-ix-from-x', opts.fromX);
	setPx('--blockish-ix-from-y', opts.fromY);
	setUnit('--blockish-ix-from-scale', opts.fromScale, 100);
	setDeg('--blockish-ix-from-rotate', opts.fromRotate);
	setUnit('--blockish-ix-from-opacity', opts.fromOpacity, 100);
	setPx('--blockish-ix-to-x', opts.toX);
	setPx('--blockish-ix-to-y', opts.toY);
	setUnit('--blockish-ix-to-scale', opts.toScale, 100);
	setDeg('--blockish-ix-to-rotate', opts.toRotate);
	setUnit('--blockish-ix-to-opacity', opts.toOpacity, 100);
	if (opts.easing) {
		el.style.setProperty('--blockish-ix-easing', opts.easing);
	}
};

export const VISIBILITY_TYPES = { show: true, hide: true, toggle: true };

export const prefersReducedMotion = () => {
	try {
		return (
			typeof window !== 'undefined' &&
			window.matchMedia &&
			window.matchMedia('(prefers-reduced-motion: reduce)').matches
		);
	} catch (e) {
		return false;
	}
};

export const getActionType = (interaction) =>
	interaction.actionType ||
	interaction.action?.type ||
	(interaction.callbacks?.length ? 'custom' : null);

export const getPreset = (interaction) =>
	interaction.preset || interaction.action?.preset || 'fadeUp';

export const getPresetOptions = (interaction) => {
	const seed = PRESET_ANIMATE[getPreset(interaction)] || PRESET_ANIMATE.custom;
	const opts =
		interaction.presetOptions || interaction.action?.presetOptions || {};
	const tween = getMotionTweens(interaction)[0];
	const fromTween = tween ? tweenToCssOpts(tween, opts) : {};
	const src = { ...seed, ...opts, ...fromTween };
	const rawEase = src.easing || opts.easing;
	const cssEase = gsapEaseToCss(rawEase);
	const easing =
		ALLOWED_EASING.includes(rawEase) || ALLOWED_EASING.includes(cssEase)
			? cssEase
			: seed.easing || 'ease';
	const pick = (key) =>
		src[key] !== undefined ? num(src[key], 0) : undefined;
	return {
		duration: toSeconds(src.duration, 0.6),
		delay: toSeconds(src.delay, 0),
		once: opts.once !== false,
		stagger: toSeconds(opts.stagger, 0),
		easing,
		fromX: pick('fromX'),
		fromY: pick('fromY'),
		fromScale: pick('fromScale'),
		fromRotate: pick('fromRotate'),
		fromOpacity: pick('fromOpacity'),
		toX: pick('toX'),
		toY: pick('toY'),
		toScale: pick('toScale'),
		toRotate: pick('toRotate'),
		toOpacity: pick('toOpacity'),
	};
};

export const getClassName = (interaction) => {
	const raw =
		interaction.className || interaction.action?.className || '';
	return String(raw)
		.trim()
		.replace(/^\./, '')
		.split(/\s+/)[0] || '';
};

export const resolveTargets = (interaction, rootElement) => {
	const selector = interaction.selector || interaction.when?.selector || '';
	if (selector && rootElement.querySelectorAll) {
		try {
			const targets = Array.from(rootElement.querySelectorAll(selector));
			if (
				!targets.length &&
				rootElement.matches &&
				rootElement.matches(selector)
			) {
				return [rootElement];
			}
			return targets;
		} catch (e) {
			return [rootElement === document ? document.body : rootElement];
		}
	}
	return [rootElement === document ? document.body : rootElement];
};

export const resolveApplyTargets = (interaction, rootElement) => {
	const applyTo =
		interaction.applyTo || interaction.action?.applyTo || '';
	if (!applyTo) {
		return resolveTargets(interaction, rootElement);
	}
	const doc =
		rootElement?.ownerDocument ||
		(typeof document !== 'undefined' ? document : null);
	if (!doc?.querySelectorAll) {
		return [];
	}
	const collect = (root) => {
		const nodes = [];
		if (root?.matches) {
			try {
				if (root.matches(applyTo)) {
					nodes.push(root);
				}
			} catch (e) {
				return nodes;
			}
		}
		if (root?.querySelectorAll) {
			nodes.push(...Array.from(root.querySelectorAll(applyTo)));
		}
		return nodes;
	};
	try {
		if (rootElement && rootElement !== document && rootElement !== doc.body) {
			const local = collect(rootElement);
			if (local.length) {
				return local;
			}
		}
		return Array.from(doc.querySelectorAll(applyTo));
	} catch (e) {
		return [];
	}
};

export const executeCallbacks = (callbacks, event, blockElement) => {
	if (!Array.isArray(callbacks)) return;
	callbacks.forEach((codeStr) => {
		if (typeof codeStr !== 'string' || !codeStr.trim()) return;
		try {
			const fn = new Function('event', 'blockElement', codeStr);
			fn(event, blockElement);
		} catch (err) {
			console.error('Blockish Interaction Error executing code:', err, codeStr);
		}
	});
};

const clearPresetClasses = (el) => {
	if (!el || !el.classList) return;
	el.classList.remove('blockish-ix-prep', 'blockish-ix-run');
	PRESET_IDS.forEach((id) => {
		el.classList.remove(`blockish-ix-prep-${id}`, `blockish-ix-run-${id}`);
	});
};

const presetTransition = (duration, easing) => {
	const ease = easing || 'ease';
	const time = `${toSeconds(duration, 0.6)}s`;
	if (prefersReducedMotion()) {
		return `opacity ${time} ${ease}`;
	}
	return `opacity ${time} ${ease}, transform ${time} ${ease}`;
};

const getAnimationEngine = () =>
	typeof window !== 'undefined' ? window.blockishAnimation : null;

export const isPresetForward = (el) => {
	const anim = getAnimationEngine();
	if (anim?.isForward) {
		return !!anim.isForward(el);
	}
	return !!(el && el.classList && el.classList.contains('blockish-ix-run'));
};

export const preparePreset = (el, interaction) => {
	if (!el || !el.classList) return;
	const anim = getAnimationEngine();
	if (anim?.prepare?.(el, interaction)) {
		return;
	}
	const opts = getPresetOptions(interaction);
	clearPresetClasses(el);
	applyAnimateVars(el, opts);
	el.classList.add('blockish-ix-prep');
};

export const runPreset = (el, interaction, extraDelay = 0, onComplete) => {
	if (!el || !el.classList) return;
	const anim = getAnimationEngine();
	if (anim?.play?.(el, interaction, extraDelay, onComplete)) {
		return;
	}
	const opts = getPresetOptions(interaction);

	el.style.transition = 'none';
	el.style.transitionDelay = '0s';
	preparePreset(el, interaction);
	void el.offsetWidth;

	const play = () => {
		el.style.transition = presetTransition(opts.duration, opts.easing);
		el.style.transitionDelay = `${opts.delay + extraDelay}s`;
		el.classList.add('blockish-ix-run');
		el.classList.remove('blockish-ix-prep');
		if (!onComplete) return;
		let done = false;
		const finish = () => {
			if (done) return;
			done = true;
			el.removeEventListener('transitionend', onEnd);
			onComplete();
		};
		const onEnd = (event) => {
			if (event.target !== el) return;
			finish();
		};
		el.addEventListener('transitionend', onEnd);
		window.setTimeout(
			finish,
			Math.max(0, (opts.duration + opts.delay + extraDelay) * 1000) + 48
		);
	};

	requestAnimationFrame(() => {
		requestAnimationFrame(play);
	});
};

export const reversePreset = (el, interaction) => {
	if (!el || !el.classList) return;
	const anim = getAnimationEngine();
	if (anim?.reverse?.(el, interaction)) {
		return;
	}
	const opts = getPresetOptions(interaction);

	applyAnimateVars(el, opts);
	el.style.transition = presetTransition(opts.duration, opts.easing);
	el.style.transitionDelay = '0ms';
	el.classList.remove('blockish-ix-run');
	el.classList.add('blockish-ix-prep');
};

export const isElementHidden = (el) => {
	if (!el) return true;
	if (el.hasAttribute('hidden')) return true;
	return el.classList?.contains('blockish-ix-is-hidden');
};

export const setElementHidden = (el, hide) => {
	if (!el) return;
	if (hide) {
		el.setAttribute('hidden', '');
		el.setAttribute('inert', '');
		el.setAttribute('aria-hidden', 'true');
		el.classList?.add('blockish-ix-is-hidden');
	} else {
		el.removeAttribute('hidden');
		el.removeAttribute('inert');
		el.removeAttribute('aria-hidden');
		el.classList?.remove('blockish-ix-is-hidden');
	}
};

const applyVisibility = (el, type, direction) => {
	if (direction === 'toggle') {
		setElementHidden(el, !isElementHidden(el));
		return;
	}
	if (direction === 'reverse') {
		setElementHidden(el, type !== 'hide');
		return;
	}
	setElementHidden(el, type === 'hide');
};

const applyClass = (el, className, direction) => {
	if (!el || !el.classList || !className) return;
	if (direction === 'reverse') {
		el.classList.remove(className);
	} else if (direction === 'toggle') {
		el.classList.toggle(className);
	} else {
		el.classList.add(className);
	}
};

/**
 * @param {'forward'|'reverse'|'toggle'} direction
 */
export const runAction = (
	interaction,
	event,
	blockElement,
	direction = 'forward',
	extraDelay = 0,
	onComplete
) => {
	const type = getActionType(interaction);
	const done = () => {
		if (typeof onComplete === 'function') {
			onComplete();
		}
	};

	if (type === 'preset') {
		let dir = direction;
		if (dir === 'toggle') {
			dir = isPresetForward(blockElement) ? 'reverse' : 'forward';
		}
		if (dir === 'reverse') {
			reversePreset(blockElement, interaction);
			done();
		} else {
			runPreset(blockElement, interaction, extraDelay, done);
		}
		return;
	}

	if (type === 'emit') {
		return 'emit';
	}

	if (type === 'toggleClass') {
		applyClass(blockElement, getClassName(interaction), direction);
		done();
		return;
	}

	if (VISIBILITY_TYPES[type]) {
		applyVisibility(blockElement, type, direction);
		done();
		return;
	}

	const callbacks =
		interaction.callbacks || interaction.action?.callbacks || [];
	executeCallbacks(callbacks, event, blockElement);
	done();
};

export const getPlayList = (interaction, wrapEl) => {
	const stagger = getPresetOptions(interaction).stagger;
	const useStagger =
		stagger > 0 && getActionType(interaction) === 'preset' && wrapEl?.children;

	if (!useStagger) {
		return [{ el: wrapEl, extraDelay: 0 }];
	}

	const kids = Array.from(wrapEl.children).filter(
		(n) => n.nodeType === 1 && n.tagName !== 'SCRIPT' && n.tagName !== 'STYLE'
	);
	if (kids.length < 2) {
		return [{ el: wrapEl, extraDelay: 0 }];
	}

	return kids.map((kid, i) => ({ el: kid, extraDelay: i * stagger }));
};

export const collectPlayTargets = (interaction, rootElement) => {
	const applyTo = interaction.applyTo || interaction.action?.applyTo || '';
	const wraps = applyTo
		? resolveApplyTargets(interaction, rootElement)
		: resolveTargets(interaction, rootElement);
	return wraps.flatMap((wrap) => getPlayList(interaction, wrap));
};

export const playsForWrap = (interaction, wrapEl) => {
	const applyTo = interaction.applyTo || interaction.action?.applyTo || '';
	if (applyTo) {
		return collectPlayTargets(interaction, wrapEl);
	}
	return getPlayList(interaction, wrapEl);
};

export const prepareInitialState = (interaction, wrapEl) => {
	const type = getActionType(interaction);
	const eventName =
		interaction.event || interaction.when?.event || '';
	const source = interaction.when?.source || 'dom';
	const plays = playsForWrap(interaction, wrapEl);

	if (type === 'preset') {
		plays.forEach(({ el }) => preparePreset(el, interaction));
		return;
	}

	const waitForTrigger =
		source === 'listen' ||
		['click', 'mouseenter', 'focus', 'inView', 'scroll'].includes(eventName);

	if ((type === 'show' || type === 'toggle') && waitForTrigger) {
		plays.forEach(({ el }) => setElementHidden(el, true));
	}
};

export const runOnTargets = (interaction, rootElement, event, direction = 'forward') => {
	collectPlayTargets(interaction, rootElement).forEach(({ el, extraDelay }) => {
		runAction(interaction, event, el, direction, extraDelay);
	});
};

export const getScrollY = (interaction) => {
	const n = Number(interaction.scrollY ?? interaction.when?.scrollY);
	return Number.isFinite(n) && n >= 0 ? n : 80;
};

export const getParallax = (interaction) => {
	const n = Number(interaction.parallax ?? interaction.when?.parallax);
	return Number.isFinite(n) ? n : 0;
};

const lerp = (a, b, t) => a + (b - a) * t;

export const applyScrollScrub = (el, interaction, p) => {
	if (!el?.style) return;
	const t = Math.min(1, Math.max(0, p));
	el.style.setProperty('--blockish-ix-progress', t.toFixed(4));

	if (getActionType(interaction) !== 'preset') {
		const shift = getParallax(interaction);
		if (shift && !prefersReducedMotion()) {
			el.style.transform = `translate3d(0, ${((0.5 - t) * shift).toFixed(2)}px, 0)`;
		}
		return;
	}

	const anim = getAnimationEngine();
	if (anim?.scrub?.(el, interaction, t)) {
		return;
	}

	const opts = getPresetOptions(interaction);
	const mix = (fromKey, toKey, idle) => {
		if (opts[fromKey] === undefined && opts[toKey] === undefined) {
			return undefined;
		}
		const a = opts[fromKey] !== undefined ? Number(opts[fromKey]) : idle;
		const b = opts[toKey] !== undefined ? Number(opts[toKey]) : idle;
		return lerp(a, b, t);
	};
	const x = mix('fromX', 'toX', 0);
	const y = mix('fromY', 'toY', 0);
	const scalePct = mix('fromScale', 'toScale', 100);
	const rot = mix('fromRotate', 'toRotate', 0);
	const op = mix('fromOpacity', 'toOpacity', 100);

	el.style.transition = 'none';
	if (op !== undefined) {
		el.style.opacity = String(op / 100);
	}
	if (prefersReducedMotion()) {
		el.style.transform = 'none';
		return;
	}
	if (
		x === undefined &&
		y === undefined &&
		scalePct === undefined &&
		rot === undefined
	) {
		const shift = getParallax(interaction);
		if (shift) {
			el.style.transform = `translate3d(0, ${((0.5 - t) * shift).toFixed(2)}px, 0)`;
		}
		return;
	}
	el.style.transform = `translate3d(${x ?? 0}px, ${y ?? 0}px, 0) scale(${
		scalePct !== undefined ? scalePct / 100 : 1
	}) rotate(${rot ?? 0}deg)`;
};

export const clickDirection = (interaction) => {
	const type = getActionType(interaction);
	if (
		type === 'preset' ||
		type === 'toggleClass' ||
		VISIBILITY_TYPES[type]
	) {
		return 'toggle';
	}
	return 'forward';
};
