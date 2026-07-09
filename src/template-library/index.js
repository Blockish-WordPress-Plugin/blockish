import { registerPlugin } from '@wordpress/plugins';
import { useState, useEffect, useRef, useSyncExternalStore } from '@wordpress/element';
import { createRoot } from 'react-dom/client';
import { __ } from '@wordpress/i18n';
import { subscribe } from '@wordpress/data';
import Modal from './components/Modal';
import './style.scss';

const useToolbarElement = () => {
	return useSyncExternalStore(
		(callback) => {
			const unsubscribe = subscribe(callback);
			return () => unsubscribe();
		},
		() => {
			return document.querySelector(
				'.edit-post-header__toolbar, .editor-header__toolbar, .edit-site-header-edit-mode__start'
			);
		}
	);
};

const TemplateLibraryApp = () => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<button
				onClick={() => setIsOpen(true)}
				className="blockish-template-library-toolbar-btn"
			>
				<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
					<path d="M12 2L2 7L12 12L22 7L12 2Z" fill="currentColor" />
					<path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
					<path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
				</svg>
				{__('Template Library', 'blockish')}
			</button>
			<Modal isOpen={isOpen} onClose={() => setIsOpen(false)} />
		</>
	);
};

const AddRoot = () => {
	const rootRef = useRef(null);
	const toolbarElement = useToolbarElement();

	useEffect(() => {
		if (!toolbarElement) return;

		let rootElement = document.getElementById('blockish-template-library-root');
		if (!rootElement) {
			rootElement = document.createElement('div');
			rootElement.id = 'blockish-template-library-root';
			rootElement.style.display = 'flex';
			rootElement.style.alignItems = 'center';
			rootElement.style.marginLeft = '8px';
			toolbarElement.appendChild(rootElement);
		}

		if (!rootRef.current && rootElement) {
			rootRef.current = createRoot(rootElement);
		}

		if (rootRef.current) {
			rootRef.current.render(<TemplateLibraryApp />);
		}

		return () => {
			if (rootRef.current) {
				rootRef.current.unmount();
				rootRef.current = null;
			}
		};
	}, [toolbarElement]);

	return null;
};

registerPlugin('blockish-template-library', {
	render: AddRoot,
});
