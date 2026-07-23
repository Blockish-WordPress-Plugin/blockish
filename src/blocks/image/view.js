/**
 * Frontend lightbox for blockish/image.
 */
(function () {
	const OVERLAY_ID = 'blockish-image-lightbox';

	const getOverlay = () => {
		let overlay = document.getElementById(OVERLAY_ID);
		if (overlay) return overlay;

		overlay = document.createElement('div');
		overlay.id = OVERLAY_ID;
		overlay.className = 'blockish-lightbox';
		overlay.setAttribute('role', 'dialog');
		overlay.setAttribute('aria-modal', 'true');
		overlay.setAttribute('aria-hidden', 'true');
		overlay.innerHTML =
			'<button type="button" class="blockish-lightbox__close" aria-label="Close">&times;</button>' +
			'<div class="blockish-lightbox__dialog">' +
			'<img class="blockish-lightbox__image" alt="" />' +
			'<p class="blockish-lightbox__caption" hidden></p>' +
			'</div>';
		document.body.appendChild(overlay);

		const close = () => closeLightbox();
		overlay
			.querySelector('.blockish-lightbox__close')
			.addEventListener('click', close);
		overlay.addEventListener('click', (event) => {
			if (event.target === overlay) {
				close();
			}
		});

		return overlay;
	};

	const openLightbox = ({ src, alt, caption }) => {
		if (!src) return;
		const overlay = getOverlay();
		const img = overlay.querySelector('.blockish-lightbox__image');
		const captionEl = overlay.querySelector('.blockish-lightbox__caption');

		img.src = src;
		img.alt = alt || '';

		if (caption) {
			captionEl.textContent = caption;
			captionEl.hidden = false;
		} else {
			captionEl.textContent = '';
			captionEl.hidden = true;
		}

		overlay.classList.add('is-open');
		overlay.setAttribute('aria-hidden', 'false');
		document.documentElement.classList.add('blockish-lightbox-open');
		overlay.querySelector('.blockish-lightbox__close')?.focus();
	};

	const closeLightbox = () => {
		const overlay = document.getElementById(OVERLAY_ID);
		if (!overlay) return;
		overlay.classList.remove('is-open');
		overlay.setAttribute('aria-hidden', 'true');
		document.documentElement.classList.remove('blockish-lightbox-open');
		const img = overlay.querySelector('.blockish-lightbox__image');
		if (img) {
			img.removeAttribute('src');
			img.alt = '';
		}
	};

	document.addEventListener('click', (event) => {
		const trigger = event.target.closest(
			'[data-blockish-lightbox="true"]'
		);
		if (!trigger) return;

		event.preventDefault();
		openLightbox({
			src:
				trigger.getAttribute('data-lightbox-src') ||
				trigger.getAttribute('href'),
			alt: trigger.getAttribute('data-lightbox-alt') || '',
			caption: trigger.getAttribute('data-lightbox-caption') || '',
		});
	});

	document.addEventListener('keydown', (event) => {
		if (event.key !== 'Escape') return;
		const overlay = document.getElementById(OVERLAY_ID);
		if (overlay?.classList.contains('is-open')) {
			closeLightbox();
		}
	});
})();
