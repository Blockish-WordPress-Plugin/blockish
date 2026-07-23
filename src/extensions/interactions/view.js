/**
 * Frontend script for Blockish Interactions extension.
 * Supports legacy event+callbacks, entrance presets, inView, and cross-block emit/listen.
 */
import './style.scss';

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

	const executeCallbacks = (callbacks, event, blockElement) => {
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

	const makeReadyEvent = () => {
		try {
			return new Event('blockish-ready', { bubbles: false, cancelable: false });
		} catch (e) {
			const ev = document.createEvent('Event');
			ev.initEvent('blockish-ready', false, false);
			return ev;
		}
	};

	const resolveTargets = (interaction, rootElement) => {
		const selector = interaction.selector || interaction.when?.selector || '';
		if (selector && rootElement.querySelectorAll) {
			const targets = Array.from(rootElement.querySelectorAll(selector));
			if (
				!targets.length &&
				rootElement.matches &&
				rootElement.matches(selector)
			) {
				return [rootElement];
			}
			return targets;
		}
		return [rootElement === document ? document.body : rootElement];
	};

	const getActionType = (interaction) =>
		interaction.actionType ||
		interaction.action?.type ||
		(interaction.callbacks?.length ? 'custom' : null);

	const getPreset = (interaction) =>
		interaction.preset || interaction.action?.preset || 'fadeUp';

	const getPresetOptions = (interaction) => {
		const opts =
			interaction.presetOptions ||
			interaction.action?.presetOptions ||
			{};
		return {
			duration: Number(opts.duration) || 600,
			delay: Number(opts.delay) || 0,
			once: opts.once !== false,
		};
	};

	const PRESET_IDS = [
		'fadeIn',
		'fadeUp',
		'fadeDown',
		'fadeLeft',
		'fadeRight',
		'zoomIn',
	];

	const clearPresetClasses = (el) => {
		if (!el || !el.classList) return;
		el.classList.remove('blockish-ix-prep', 'blockish-ix-run');
		PRESET_IDS.forEach((id) => {
			el.classList.remove(`blockish-ix-prep-${id}`, `blockish-ix-run-${id}`);
		});
	};

	const preparePreset = (el, preset) => {
		if (!el || !el.classList) return;
		clearPresetClasses(el);
		el.classList.add('blockish-ix-prep', `blockish-ix-prep-${preset}`);
	};

	const runPreset = (el, interaction) => {
		if (!el || !el.classList) return;
		const preset = getPreset(interaction);
		const opts = getPresetOptions(interaction);

		// Hard reset so a second click can replay from the start.
		el.style.transition = 'none';
		el.style.transitionDelay = '0ms';
		preparePreset(el, preset);
		void el.offsetWidth;

		const play = () => {
			el.style.transition = `opacity ${opts.duration}ms ease, transform ${opts.duration}ms ease`;
			el.style.transitionDelay = `${opts.delay}ms`;
			el.classList.add('blockish-ix-run', `blockish-ix-run-${preset}`);
			el.classList.remove('blockish-ix-prep', `blockish-ix-prep-${preset}`);
		};

		// Double rAF ensures the prep state is painted before transitioning.
		requestAnimationFrame(() => {
			requestAnimationFrame(play);
		});
	};

	const runEmit = (interaction, event, blockElement) => {
		const name =
			interaction.emitEventName ||
			interaction.action?.eventName ||
			'';
		const phase =
			interaction.emitPhase || interaction.action?.phase || 'start';
		bus.emit(name, phase, { event, blockElement, interactionId: interaction.id });
	};

	const runAction = (interaction, event, blockElement) => {
		const type = getActionType(interaction);
		if (type === 'preset') {
			runPreset(blockElement, interaction);
		} else if (type === 'emit') {
			runEmit(interaction, event, blockElement);
		} else {
			const callbacks =
				interaction.callbacks ||
				interaction.action?.callbacks ||
				[];
			executeCallbacks(callbacks, event, blockElement);
		}
	};

	const runOnTargets = (interaction, rootElement, event) => {
		resolveTargets(interaction, rootElement).forEach((target) => {
			runAction(interaction, event, target);
		});
	};

	const getEventName = (interaction) => {
		if (interaction.when?.source === 'listen') return 'listen';
		return interaction.event || interaction.when?.event || '';
	};

	const runReadyInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;
		const readyEvent = makeReadyEvent();

		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (!READY_EVENTS[eventName]) return;
			runOnTargets(interaction, rootElement, readyEvent);
		});
	};

	const registerDomInteractions = (interactions, rootElement, isGlobal) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction) return;
			const eventName = getEventName(interaction);
			if (!eventName || READY_EVENTS[eventName]) return;
			if (eventName === 'inView' || eventName === 'listen') return;

			const targetEl = isGlobal ? document.body : rootElement;
			const selector = interaction.selector || interaction.when?.selector || '';

			targetEl.addEventListener(eventName, (e) => {
				if (selector) {
					const target = e.target.closest(selector);
					if (!target) return;
					if (!isGlobal && !rootElement.contains(target)) return;
					runAction(interaction, e, target);
				} else {
					runAction(
						interaction,
						e,
						isGlobal ? document.body : rootElement
					);
				}
			});
		});
	};

	const registerInViewInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions) || typeof IntersectionObserver === 'undefined') {
			return;
		}

		interactions.forEach((interaction) => {
			if (!interaction || getEventName(interaction) !== 'inView') return;
			const opts = getPresetOptions(interaction);
			const targets = resolveTargets(interaction, rootElement);

			targets.forEach((target) => {
				if (getActionType(interaction) === 'preset') {
					preparePreset(target, getPreset(interaction));
				}

				let done = false;
				const observer = new IntersectionObserver(
					(entries) => {
						entries.forEach((entry) => {
							if (!entry.isIntersecting) return;
							if (opts.once && done) return;
							done = true;
							runAction(interaction, entry, target);
							if (opts.once) observer.disconnect();
						});
					},
					{ threshold: 0.15 }
				);
				observer.observe(target);
			});
		});
	};

	const registerListenInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction || getEventName(interaction) !== 'listen') return;

			const name =
				interaction.listenEventName ||
				interaction.when?.eventName ||
				'';
			const phase =
				interaction.listenPhase ||
				interaction.when?.phase ||
				'start';

			if (!name) return;

			const opts = getPresetOptions(interaction);
			let done = false;

			if (getActionType(interaction) === 'preset') {
				resolveTargets(interaction, rootElement).forEach((t) =>
					preparePreset(t, getPreset(interaction))
				);
			}

			bus.on(name, phase, (payload) => {
				if (opts.once && done) return;
				done = true;
				runOnTargets(interaction, rootElement, payload);
			});
		});
	};

	const processInteractions = (interactions, rootElement, isGlobal) => {
		registerDomInteractions(interactions, rootElement, isGlobal);
		registerInViewInteractions(interactions, rootElement);
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

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', boot);
	} else {
		boot();
	}
})();
