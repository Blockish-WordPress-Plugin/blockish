import { useEffect } from '@wordpress/element';

const FRAME_SEL =
	'.components-modal__frame.blockish-interactions-modal, .blockish-interactions-modal .components-modal__frame';

function findFrame() {
	return document.querySelector(FRAME_SEL);
}

function shouldIgnore(target) {
	if (!target || !target.closest) return true;
	return Boolean(
		target.closest(
			'button, a, input, textarea, select, .components-modal__header-close-button'
		)
	);
}

/**
 * Drag the Interactions modal by its header so the canvas stays visible.
 */
export function useDraggableModal(isOpen) {
	useEffect(() => {
		if (!isOpen) return undefined;

		let frame = null;
		let header = null;
		let dragging = false;
		let startX = 0;
		let startY = 0;
		let origLeft = 0;
		let origTop = 0;
		let raf = 0;

		const pinFrame = () => {
			if (!frame) return;
			const rect = frame.getBoundingClientRect();
			frame.style.position = 'fixed';
			frame.style.margin = '0';
			frame.style.transform = 'none';
			frame.style.left = `${rect.left}px`;
			frame.style.top = `${rect.top}px`;
			frame.classList.add('is-dragged');
			return rect;
		};

		const onPointerMove = (event) => {
			if (!dragging || !frame) return;
			const maxX = Math.max(0, window.innerWidth - frame.offsetWidth);
			const maxY = Math.max(0, window.innerHeight - 48);
			const left = Math.min(
				Math.max(0, origLeft + event.clientX - startX),
				maxX
			);
			const top = Math.min(
				Math.max(0, origTop + event.clientY - startY),
				maxY
			);
			frame.style.left = `${left}px`;
			frame.style.top = `${top}px`;
		};

		const stopDrag = () => {
			if (!dragging) return;
			dragging = false;
			frame?.classList.remove('is-dragging');
			window.removeEventListener('pointermove', onPointerMove);
			window.removeEventListener('pointerup', stopDrag);
		};

		const onPointerDown = (event) => {
			if (event.button !== 0) return;
			if (shouldIgnore(event.target)) return;
			frame = findFrame();
			if (!frame) return;

			const rect = frame.classList.contains('is-dragged')
				? frame.getBoundingClientRect()
				: pinFrame();

			dragging = true;
			startX = event.clientX;
			startY = event.clientY;
			origLeft = rect.left;
			origTop = rect.top;
			frame.classList.add('is-dragging');
			window.addEventListener('pointermove', onPointerMove);
			window.addEventListener('pointerup', stopDrag);
			event.preventDefault();
		};

		const attach = () => {
			frame = findFrame();
			if (!frame) return false;
			header = frame.querySelector('.components-modal__header');
			if (!header) return false;
			header.classList.add('blockish-ix-drag-handle');
			header.addEventListener('pointerdown', onPointerDown);
			return true;
		};

		const tryAttach = () => {
			if (attach()) return;
			raf = window.requestAnimationFrame(tryAttach);
		};

		tryAttach();

		return () => {
			window.cancelAnimationFrame(raf);
			stopDrag();
			header?.removeEventListener('pointerdown', onPointerDown);
			header?.classList.remove('blockish-ix-drag-handle');
		};
	}, [isOpen]);
}
