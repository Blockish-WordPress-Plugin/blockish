import { useCallback, useEffect, useRef, useState } from '@wordpress/element';

export default function useSidebarHeight() {
	const [panelHeight, setPanelHeight] = useState(null);
	const [assistantNode, setAssistantNode] = useState(null);
	const assistantRootRef = useRef(null);

	const syncHeight = useCallback(() => {
		if (!assistantRootRef.current) {
			return;
		}

		const sidebarRoot = assistantRootRef.current.closest('.blockish-ai-assistant-sidebar');
		const measurementTarget = sidebarRoot || assistantRootRef.current;
		const top = measurementTarget.getBoundingClientRect().top;
		const nextHeight = Math.max(220, Math.floor(window.innerHeight - top));
		setPanelHeight(nextHeight);
	}, []);

	useEffect(() => {
		if (!assistantNode) {
			return undefined;
		}

		const sidebarRoot = assistantNode.closest('.blockish-ai-assistant-sidebar');
		const resizeTarget = sidebarRoot || assistantNode;
		const resizeObserver = new ResizeObserver(syncHeight);
		resizeObserver.observe(resizeTarget);

		syncHeight();
		const rafId = window.requestAnimationFrame(syncHeight);
		window.addEventListener('resize', syncHeight);

		return () => {
			window.cancelAnimationFrame(rafId);
			resizeObserver.disconnect();
			window.removeEventListener('resize', syncHeight);
		};
	}, [assistantNode, syncHeight]);

	const setAssistantRoot = useCallback((node) => {
		assistantRootRef.current = node;
		setAssistantNode(node);
	}, []);

	return {
		panelHeight,
		setAssistantRoot,
	};
}
