/**
 * GSAP-compatible motion payload.
 * CSS runtime plays tweens[0] today. Animation Builder can append tweens
 * (same from/to vars GSAP fromTo uses) without a schema break.
 */

export const CSS_TO_GSAP_EASE = {
	ease: 'power1.inOut',
	'ease-in': 'power2.in',
	'ease-out': 'power2.out',
	'ease-in-out': 'power2.inOut',
	linear: 'none',
	'cubic-bezier(0.22, 1, 0.36, 1)': 'expo.out',
};

export const GSAP_TO_CSS_EASE = {
	'power1.inOut': 'ease',
	'power2.in': 'ease-in',
	'power2.out': 'ease-out',
	'power2.inOut': 'ease-in-out',
	none: 'linear',
	'expo.out': 'cubic-bezier(0.22, 1, 0.36, 1)',
	'power1.out': 'ease-out',
	'power3.out': 'ease-out',
	'power4.out': 'ease-out',
	sine: 'ease',
	'sine.inOut': 'ease-in-out',
	'sine.out': 'ease-out',
};

export const GSAP_EASE_IDS = [
	'power1.inOut',
	'power2.in',
	'power2.out',
	'power2.inOut',
	'none',
	'expo.out',
];

export const cssEaseToGsap = (ease) => {
	if (!ease) return 'power1.inOut';
	if (GSAP_TO_CSS_EASE[ease] || GSAP_EASE_IDS.includes(ease)) return ease;
	return CSS_TO_GSAP_EASE[ease] || 'power1.inOut';
};

export const gsapEaseToCss = (ease) => {
	if (!ease) return 'ease';
	if (GSAP_TO_CSS_EASE[ease]) return GSAP_TO_CSS_EASE[ease];
	if (CSS_TO_GSAP_EASE[ease]) return ease;
	return 'ease';
};

const num = (value, fallback) => {
	const n = Number(value);
	return Number.isFinite(n) ? n : fallback;
};

/** Seconds. Values > 30 are treated as legacy milliseconds. */
export const toSeconds = (value, fallback = 0) => {
	const n = Number(value);
	if (!Number.isFinite(n)) return fallback;
	if (n > 30) return n / 1000;
	return n;
};

const pctToUnit = (value, fallbackPct) => num(value, fallbackPct) / 100;

export const cssOptsToTween = (opts = {}) => {
	const from = {};
	const to = {};
	if (opts.fromX !== undefined) from.x = num(opts.fromX, 0);
	if (opts.toX !== undefined) to.x = num(opts.toX, 0);
	if (opts.fromY !== undefined) from.y = num(opts.fromY, 0);
	if (opts.toY !== undefined) to.y = num(opts.toY, 0);
	if (opts.fromScale !== undefined) from.scale = pctToUnit(opts.fromScale, 100);
	if (opts.toScale !== undefined) to.scale = pctToUnit(opts.toScale, 100);
	if (opts.fromRotate !== undefined) from.rotation = num(opts.fromRotate, 0);
	if (opts.toRotate !== undefined) to.rotation = num(opts.toRotate, 0);
	if (opts.fromOpacity !== undefined) from.opacity = pctToUnit(opts.fromOpacity, 0);
	if (opts.toOpacity !== undefined) to.opacity = pctToUnit(opts.toOpacity, 100);
	return {
		from,
		to,
		duration: toSeconds(opts.duration, 0.6),
		delay: toSeconds(opts.delay, 0),
		ease: cssEaseToGsap(opts.easing),
	};
};

export const unitToPct = (value, fallbackUnit) =>
	Math.round(num(value, fallbackUnit) * 100);

export const tweenToCssOpts = (tween, timing = {}) => {
	const from = tween?.from && typeof tween.from === 'object' ? tween.from : {};
	const to = tween?.to && typeof tween.to === 'object' ? tween.to : {};
	const out = {
		duration: toSeconds(tween?.duration, 0.6),
		delay: toSeconds(tween?.delay, 0),
		easing: gsapEaseToCss(tween?.ease),
		once: timing.once !== false,
		stagger: toSeconds(timing.stagger, 0),
	};
	if (from.x !== undefined) out.fromX = num(from.x, 0);
	if (to.x !== undefined) out.toX = num(to.x, 0);
	if (from.y !== undefined) out.fromY = num(from.y, 0);
	if (to.y !== undefined) out.toY = num(to.y, 0);
	if (from.scale !== undefined) out.fromScale = unitToPct(from.scale, 1);
	if (to.scale !== undefined) out.toScale = unitToPct(to.scale, 1);
	if (from.rotation !== undefined) out.fromRotate = num(from.rotation, 0);
	if (to.rotation !== undefined) out.toRotate = num(to.rotation, 0);
	if (from.opacity !== undefined) out.fromOpacity = unitToPct(from.opacity, 0);
	if (to.opacity !== undefined) out.toOpacity = unitToPct(to.opacity, 1);
	return out;
};

export const getMotionTweens = (interaction) => {
	const motion = interaction?.motion || interaction?.action?.motion;
	const tweens = motion?.tweens;
	return Array.isArray(tweens) ? tweens.filter((t) => t && typeof t === 'object') : [];
};

export const motionFromCssOpts = (opts) => ({
	tweens: [cssOptsToTween(opts)],
});

const CSS_GSAP_KEYS = ['x', 'y', 'scale', 'rotation', 'opacity'];

export const patchMotionFirstTween = (motion, opts) => {
	const rest = Array.isArray(motion?.tweens) ? motion.tweens.slice(1) : [];
	const next = cssOptsToTween(opts);
	const prev = motion?.tweens?.[0] && typeof motion.tweens[0] === 'object'
		? motion.tweens[0]
		: {};
	const mergeVars = (oldVars, mapped) => {
		const out = { ...(oldVars || {}) };
		CSS_GSAP_KEYS.forEach((key) => {
			delete out[key];
		});
		return { ...out, ...mapped };
	};
	return {
		tweens: [
			{
				...prev,
				...next,
				from: mergeVars(prev.from, next.from),
				to: mergeVars(prev.to, next.to),
			},
			...rest,
		],
	};
};
