/**
 * Frontend script for Blockish Interactions extension.
 * Supports legacy event+callbacks, entrance presets, inView, and cross-block emit/listen.
 */
import './style.scss';
import {
	applyScrollScrub,
	clickDirection,
	collectPlayTargets,
	getActionType,
	getPresetOptions,
	getScrollY,
	isPresetForward,
	playsForWrap,
	prepareInitialState,
	resolveTargets,
	runAction,
	runOnTargets,
} from './utils/engine';

(function () {
	const READY_EVENTS = { ready: true, init: true };

	const bus = {
		listeners: {},
		on(name, phase, handler) {
			if (!name || typeof handler !== 'function') return;
			const key = `${name}::${phase || 'any'}`;
			if (!this.listeners[key]) this.listeners[key] = [];
			this.listeners[key].push(handler);
		},
		emit(name, phase, detail) {
			if (!name) return;
			const p = phase || 'start';
			const payload = { name, phase: p, detail: detail || {} };
			const keys = [`${name}::${p}`, `${name}::any`];
			keys.forEach((key) => {
				(this.listeners[key] || []).forEach((fn) => {
					try {
						fn(payload);
					} catch (err) {
						console.error('Blockish Interaction bus error:', err);
					}
				});
			});
			try {
				document.dispatchEvent(
					new CustomEvent('blockish:interaction', {
						detail: payload,
						bubbles: true,
					})
				);
			} catch (e) {
				/* ignore */
			}
		},
	};

	window.blockishInteractions = bus;

	const makeReadyEvent = () => {
		try {
			return new Event('blockish-ready', { bubbles: false, cancelable: false });
		} catch (e) {
			const ev = document.createEvent('Event');
			ev.initEvent('blockish-ready', false, false);
			return ev;
		}
	};

	const getEventName = (interaction) => {
		if (interaction.when?.source === 'listen') return 'listen';
		return interaction.event || interaction.when?.event || '';
	};

	const getEmitName = (interaction) =>
		interaction.emitEventName || interaction.action?.eventName || '';

	const getEmitWhen = (interaction) => {
		if (getActionType(interaction) === 'emit') {
			return interaction.emitPhase || interaction.action?.phase || 'start';
		}
		return interaction.emitPhase || interaction.action?.phase || 'end';
	};

	const runEmit = (interaction, event, blockElement, phase) => {
		const name = getEmitName(interaction);
		const p = phase || getEmitWhen(interaction);
		bus.emit(name, p, { event, blockElement, interactionId: interaction.id });
	};

	const fire = (interaction, event, blockElement, direction, extraDelay = 0) => {
		if (getActionType(interaction) === 'emit') {
			runEmit(interaction, event, blockElement);
			return;
		}
		const name = getEmitName(interaction);
		const whenPhase = getEmitWhen(interaction);
		let goingForward = direction === 'forward';
		if (direction === 'toggle') {
			goingForward = getActionType(interaction) === 'preset'
				? !isPresetForward(blockElement)
				: true;
		}
		if (name && goingForward && whenPhase === 'start' && direction !== 'reverse') {
			runEmit(interaction, event, blockElement, 'start');
		}
		runAction(interaction, event, blockElement, direction, extraDelay, () => {
			if (name && goingForward && whenPhase === 'end' && direction !== 'reverse') {
				runEmit(interaction, event, blockElement, 'end');
			}
		});
	};

	const fireOnRoot = (interaction, rootElement, event, direction = 'forward') => {
		if (getActionType(interaction) === 'emit') {
			resolveTargets(interaction, rootElement).forEach((target) => {
				runEmit(interaction, event, target);
			});
			return;
		}
		runOnTargets(interaction, rootElement, event, direction);
	};

	const searchRoot = (rootElement, isGlobal) =>
		isGlobal ? document.body : rootElement;

	const runReadyInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;
		const readyEvent = makeReadyEvent();

		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (!READY_EVENTS[eventName]) return;
			fireOnRoot(interaction, rootElement, readyEvent, 'forward');
		});
	};

	const bindTarget = (interaction, target) => {
		const eventName = getEventName(interaction);

		if (eventName === 'mouseenter') {
			target.addEventListener('mouseenter', (e) => {
				playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
					fire(interaction, e, el, 'forward', extraDelay);
				});
			});
			target.addEventListener('mouseleave', (e) => {
				playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
					fire(interaction, e, el, 'reverse', extraDelay);
				});
			});
			return;
		}

		if (eventName === 'focus') {
			target.addEventListener('focusin', (e) => {
				if (e.target !== target && !target.contains(e.target)) return;
				playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
					fire(interaction, e, el, 'forward', extraDelay);
				});
			});
			target.addEventListener('focusout', (e) => {
				if (target.contains(e.relatedTarget)) return;
				playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
					fire(interaction, e, el, 'reverse', extraDelay);
				});
			});
			return;
		}

		if (eventName === 'click') {
			target.addEventListener('click', (e) => {
				playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
					fire(
						interaction,
						e,
						el,
						clickDirection(interaction),
						extraDelay
					);
				});
			});
			return;
		}

		target.addEventListener(eventName, (e) => {
			playsForWrap(interaction, target).forEach(({ el, extraDelay }) => {
				fire(interaction, e, el, 'forward', extraDelay);
			});
		});
	};

	const registerDomInteractions = (interactions, rootElement, isGlobal) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (!eventName || READY_EVENTS[eventName]) return;
			if (eventName === 'inView' || eventName === 'listen') return;
			if (eventName === 'scroll' || eventName === 'scrollProgress') return;

			resolveTargets(interaction, searchRoot(rootElement, isGlobal)).forEach(
				(target) => bindTarget(interaction, target)
			);
		});
	};

	const registerInViewInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions) || typeof IntersectionObserver === 'undefined') {
			return;
		}

		interactions.forEach((interaction) => {
			if (!interaction || getEventName(interaction) !== 'inView') return;
			const opts = getPresetOptions(interaction);
			const wraps = resolveTargets(interaction, rootElement);

			wraps.forEach((wrap) => {
				prepareInitialState(interaction, wrap);
				const plays = playsForWrap(interaction, wrap);

				let done = false;
				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (!entry.isIntersecting) return;
							if (opts.once && done) return;
							if (opts.once) done = true;
							plays.forEach(({ el, extraDelay }) => {
								fire(interaction, entry, el, 'forward', extraDelay);
							});
							if (opts.once) observer.disconnect();
						});
					},
					{ threshold: 0.15 }
				);
				observer.observe(wrap);
			});
		});
	};

	const registerListenInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction || getEventName(interaction) !== 'listen') return;

			const name =
				interaction.listenEventName || interaction.when?.eventName || '';
			const phase =
				interaction.listenPhase || interaction.when?.phase || 'start';

			if (!name) return;

			const opts = getPresetOptions(interaction);
			let done = false;

			collectAndPrepare(interaction, rootElement);

			bus.on(name, phase, (payload) => {
				if (opts.once && done) return;
				if (opts.once) done = true;
				fireOnRoot(interaction, rootElement, payload, 'forward');
			});
		});
	};

	const scrollJobs = [];
	let scrollTicking = false;
	let scrollBound = false;

	const runScrollJobs = () => {
		scrollTicking = false;
		const y = window.scrollY || window.pageYOffset || 0;
		scrollJobs.forEach((job) => {
			try {
				job(y);
			} catch (err) {
				console.error('Blockish Interaction scroll error:', err);
			}
		});
	};

	const onWindowScroll = () => {
		if (scrollTicking) return;
		scrollTicking = true;
		requestAnimationFrame(runScrollJobs);
	};

	const bindWindowScroll = () => {
		if (scrollBound) return;
		scrollBound = true;
		window.addEventListener('scroll', onWindowScroll, { passive: true });
		window.addEventListener('resize', onWindowScroll, { passive: true });
	};

	const elementProgress = (el) => {
		const rect = el.getBoundingClientRect();
		const vh = window.innerHeight || 1;
		const start = vh;
		const end = -rect.height;
		const span = start - end || 1;
		const p = (start - rect.top) / span;
		return Math.min(1, Math.max(0, p));
	};

	const registerScrollInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (eventName !== 'scroll' && eventName !== 'scrollProgress') return;

			if (eventName === 'scroll') {
				const threshold = getScrollY(interaction);
				let active = false;
				const job = (y) => {
					const past = y >= threshold;
					if (past === active) return;
					active = past;
					collectPlayTargets(interaction, rootElement).forEach(
						({ el, extraDelay }) => {
							fire(
								interaction,
								{ type: 'scroll', scrollY: y },
								el,
								past ? 'forward' : 'reverse',
								extraDelay
							);
						}
					);
				};
				scrollJobs.push(job);
				bindWindowScroll();
				job(window.scrollY || window.pageYOffset || 0);
				return;
			}

			const anim =
				typeof window !== 'undefined' ? window.blockishAnimation : null;
			if (anim?.attachScrollProgress) {
				let attached = false;
				resolveTargets(interaction, rootElement).forEach((wrap) => {
					playsForWrap(interaction, wrap).forEach(({ el }) => {
						if (anim.attachScrollProgress(el, interaction, wrap)) {
							attached = true;
						}
					});
				});
				if (attached) return;
			}

			const job = () => {
				collectPlayTargets(interaction, rootElement).forEach(({ el }) => {
					applyScrollScrub(el, interaction, elementProgress(el));
				});
			};
			scrollJobs.push(job);
			bindWindowScroll();
			job();
		});
	};

	const collectAndPrepare = (interaction, rootElement) => {
		if (interaction.applyTo || interaction.action?.applyTo) {
			prepareInitialState(interaction, rootElement);
			return;
		}
		resolveTargets(interaction, rootElement).forEach((wrap) => {
			prepareInitialState(interaction, wrap);
		});
	};

	const prepareAll = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;
		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (READY_EVENTS[eventName] && getActionType(interaction) === 'preset') {
				collectAndPrepare(interaction, rootElement);
				return;
			}
			if (eventName === 'inView' || eventName === 'listen') {
				return;
			}
			if (eventName === 'scrollProgress') {
				return;
			}
			collectAndPrepare(interaction, rootElement);
		});
	};

	const processInteractions = (interactions, rootElement, isGlobal) => {
		prepareAll(interactions, rootElement);
		registerDomInteractions(interactions, rootElement, isGlobal);
		registerInViewInteractions(interactions, rootElement);
		registerScrollInteractions(interactions, rootElement);
		registerListenInteractions(interactions, rootElement);
		runReadyInteractions(interactions, rootElement);
	};

	const boot = () => {
		const globalInteractions = window.blockishGlobalInteractions || [];
		processInteractions(globalInteractions, document.body, true);

		const pageInteractions = window.blockishPageInteractions || [];
		if (pageInteractions.length) {
			processInteractions(pageInteractions, document.body, true);
		}

		const blockElements = document.querySelectorAll(
			'[data-blockish-interactions]'
		);
		blockElements.forEach((blockEl) => {
			try {
				const interactions = JSON.parse(
					blockEl.getAttribute('data-blockish-interactions') || '[]'
				);
				processInteractions(interactions, blockEl, false);
			} catch (err) {
				console.error(
					'Blockish Interaction Error parsing block data:',
					err
				);
			}
		});
	};

	const scheduleBoot = () => {
		requestAnimationFrame(boot);
	};

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', scheduleBoot);
	} else {
		scheduleBoot();
	}
})();
