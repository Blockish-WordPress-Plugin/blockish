/**
 * Frontend script for Blockish Interactions extension.
 */
(function () {
	const READY_EVENTS = { ready: true, init: true };

	// Helper to execute interaction callbacks (JS code strings)
	const executeCallbacks = (callbacks, event, blockElement) => {
		if (!Array.isArray(callbacks)) return;

		callbacks.forEach((codeStr) => {
			if (typeof codeStr === 'string') {
				try {
					// Create an executable function passing 'event' and 'blockElement'
					const fn = new Function('event', 'blockElement', codeStr);
					fn(event, blockElement);
				} catch (err) {
					console.error(
						'Blockish Interaction Error executing code:',
						err,
						codeStr
					);
				}
			}
		});
	};

	const makeReadyEvent = () => {
		try {
			return new Event('blockish-ready', { bubbles: false, cancelable: false });
		} catch (e) {
			// IE / very old environments
			const ev = document.createEvent('Event');
			ev.initEvent('blockish-ready', false, false);
			return ev;
		}
	};

	/**
	 * Fire-once lifecycle events (`ready` / `init`).
	 * Safe even when this script loads after DOMContentLoaded.
	 */
	const runReadyInteractions = (interactions, rootElement) => {
		if (!Array.isArray(interactions)) return;
		const readyEvent = makeReadyEvent();

		interactions.forEach((interaction) => {
			if (!interaction || !READY_EVENTS[interaction.event] || !interaction.callbacks) {
				return;
			}

			if (interaction.selector) {
				const targets = rootElement.querySelectorAll
					? rootElement.querySelectorAll(interaction.selector)
					: [];
				if (!targets.length && rootElement.matches && rootElement.matches(interaction.selector)) {
					executeCallbacks(interaction.callbacks, readyEvent, rootElement);
					return;
				}
				targets.forEach((target) => {
					executeCallbacks(interaction.callbacks, readyEvent, target);
				});
			} else {
				executeCallbacks(
					interaction.callbacks,
					readyEvent,
					rootElement === document ? document.body : rootElement
				);
			}
		});
	};

	const registerDomInteractions = (interactions, rootElement, isGlobal) => {
		if (!Array.isArray(interactions)) return;

		interactions.forEach((interaction) => {
			if (!interaction || !interaction.event || !interaction.callbacks) return;
			// Lifecycle events are handled separately (once).
			if (READY_EVENTS[interaction.event]) return;

			const targetEl = isGlobal ? document.body : rootElement;

			targetEl.addEventListener(interaction.event, (e) => {
				if (interaction.selector) {
					const target = e.target.closest(interaction.selector);
					if (!target) return;
					if (!isGlobal && !rootElement.contains(target)) return;
					executeCallbacks(interaction.callbacks, e, target);
				} else {
					executeCallbacks(
						interaction.callbacks,
						e,
						isGlobal ? document.body : rootElement
					);
				}
			});
		});
	};

	const boot = () => {
		// 1. Process Global Interactions
		const globalInteractions = window.blockishGlobalInteractions || [];
		registerDomInteractions(globalInteractions, document.body, true);
		runReadyInteractions(globalInteractions, document);

		// 2. Process Block-level Interactions
		const blockElements = document.querySelectorAll(
			'[data-blockish-interactions]'
		);
		blockElements.forEach((blockEl) => {
			try {
				const interactions = JSON.parse(
					blockEl.getAttribute('data-blockish-interactions') || '[]'
				);
				registerDomInteractions(interactions, blockEl, false);
				runReadyInteractions(interactions, blockEl);
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
