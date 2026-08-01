import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { styles as stylesIcon } from '@wordpress/icons';
import { Modal } from '@wordpress/components';
import { useEffect, useState, useSyncExternalStore } from '@wordpress/element';
import { subscribe } from '@wordpress/data';
import ClassManagerPanelApp from './components/panel-app';

const useToolbarElement = () =>
	useSyncExternalStore(
		(callback) => {
			const unsubscribe = subscribe(callback);
			return () => unsubscribe();
		},
		() =>
			document.querySelector(
				'.edit-post-header__toolbar, .editor-header__toolbar, .edit-site-header-edit-mode__start'
			)
	);

function ClassManagerModal() {
	const [isOpen, setIsOpen] = useState(false);
	const toolbarElement = useToolbarElement();

	useEffect(() => {
		if (!toolbarElement) {
			return undefined;
		}

		let button = document.getElementById('blockish-class-manager-toolbar-button');
		if (!button) {
			button = document.createElement('button');
			button.id = 'blockish-class-manager-toolbar-button';
			button.type = 'button';
			button.className =
				'components-button blockish-class-manager-toolbar-button';
			button.textContent = __('Class Manager', 'blockish');
			toolbarElement.appendChild(button);
		}

		const openModal = () => setIsOpen(true);
		button.addEventListener('click', openModal);

		return () => {
			button.removeEventListener('click', openModal);
			button.remove();
		};
	}, [toolbarElement]);

	return (
		<>
			<PluginMoreMenuItem icon={stylesIcon} onClick={() => setIsOpen(true)}>
				{__('Class Manager', 'blockish')}
			</PluginMoreMenuItem>
			{isOpen ? (
				<Modal
					onRequestClose={() => setIsOpen(false)}
					className="blockish-cm-manager-modal"
					shouldCloseOnClickOutside={false}
					isFullScreen
					__experimentalHideHeader
					aria={{ label: __('Class Manager', 'blockish') }}
				>
					<ClassManagerPanelApp onClose={() => setIsOpen(false)} />
				</Modal>
			) : null}
		</>
	);
}

registerPlugin('blockish-class-manager-panel', {
	render: ClassManagerModal,
	icon: stylesIcon,
});
