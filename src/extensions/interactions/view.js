/**
 * Frontend script for Blockish Interactions extension.
 */
document.addEventListener('DOMContentLoaded', () => {

	// Helper to execute interaction callbacks (JS code strings)
	const executeCallbacks = (callbacks, event, blockElement) => {
		if (!Array.isArray(callbacks)) return;
		
		callbacks.forEach(codeStr => {
			if (typeof codeStr === 'string') {
				try {
					// Create an executable function passing 'event' and 'blockElement'
					const fn = new Function('event', 'blockElement', codeStr);
					fn(event, blockElement);
				} catch (err) {
					console.error('Blockish Interaction Error executing code:', err, codeStr);
				}
			}
		});
	};

	// 1. Process Global Interactions
	const globalInteractions = window.blockishGlobalInteractions || [];
	if (Array.isArray(globalInteractions)) {
		globalInteractions.forEach(interaction => {
			if (!interaction.event || !interaction.callbacks) return;
			
			document.body.addEventListener(interaction.event, (e) => {
				if (interaction.selector) {
					const target = e.target.closest(interaction.selector);
					if (target) {
						executeCallbacks(interaction.callbacks, e, target);
					}
				} else {
					executeCallbacks(interaction.callbacks, e, document.body);
				}
			});
		});
	}

	// 2. Process Block-level Interactions
	const blockElements = document.querySelectorAll('[data-blockish-interactions]');
	blockElements.forEach(blockEl => {
		try {
			const interactions = JSON.parse(blockEl.getAttribute('data-blockish-interactions') || '[]');
			
			if (Array.isArray(interactions)) {
				interactions.forEach(interaction => {
					if (!interaction.event || !interaction.callbacks) return;
					
					blockEl.addEventListener(interaction.event, (e) => {
						if (interaction.selector) {
							// Check if the clicked target matches the selector inside this block
							const target = e.target.closest(interaction.selector);
							
							// Ensure the matched target is actually inside this block element
							if (target && blockEl.contains(target)) {
								executeCallbacks(interaction.callbacks, e, target);
							}
						} else {
							// If no selector, trigger on the block itself
							executeCallbacks(interaction.callbacks, e, blockEl);
						}
					});
				});
			}
		} catch (err) {
			console.error('Blockish Interaction Error parsing block data:', err);
		}
	});

});
