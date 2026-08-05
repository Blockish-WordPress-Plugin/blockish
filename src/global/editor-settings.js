import { registerPlugin } from '@wordpress/plugins';
import { PluginMoreMenuItem } from '@wordpress/editor';
import { __ } from '@wordpress/i18n';
import { settings as settingsIcon } from '@wordpress/icons';
import { Modal, TabPanel } from '@wordpress/components';
import { useEffect, useState, useSyncExternalStore, useMemo } from '@wordpress/element';
import { subscribe } from '@wordpress/data';
import { applyFilters } from '@wordpress/hooks';
import './editor-settings.scss';

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

function EditorSettingsModal() {
	const [isOpen, setIsOpen] = useState(false);
	const toolbarElement = useToolbarElement();

	const tabs = useMemo(() => {
		return applyFilters('blockish.editorSettingsTabs', []);
	}, []);

	useEffect(() => {
		if (!toolbarElement || tabs.length === 0) {
			return undefined;
		}

		let button = document.getElementById('blockish-editor-settings-toolbar-button');
		if (!button) {
			button = document.createElement('button');
			button.id = 'blockish-editor-settings-toolbar-button';
			button.type = 'button';
			button.className = 'components-button blockish-editor-settings-toolbar-button';
            button.innerHTML = `
                <svg width="18" height="18" fill="currentColor" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" aria-hidden="true" focusable="false"><path d="m510.39 197.385-4.777-17.826c-3.23-12.066-10.937-22.142-21.702-28.376-10.755-6.233-23.312-7.894-35.314-4.673l-16.533 4.427a203.7 203.7 0 0 0-29.017-37.834l8.553-14.809c6.197-10.737 7.834-23.276 4.595-35.309-3.248-12.034-10.974-22.093-21.756-28.321l-15.987-9.226c-10.81-6.239-23.385-7.921-35.405-4.718s-22.057 10.895-28.28 21.669l-8.544 14.809a203.7 203.7 0 0 0-47.27-6.205l-4.44-16.538C247.87 9.672 222.238-5.046 197.388 1.606l-17.825 4.772c-24.859 6.666-39.682 32.239-33.048 57.02l4.431 16.533a203.2 203.2 0 0 0-37.825 29.014l-14.813-8.554c-22.229-12.816-50.755-5.118-63.631 17.166l-9.227 15.978c-6.242 10.819-7.925 23.394-4.722 35.41s10.901 22.061 21.674 28.28l14.813 8.549A203.4 203.4 0 0 0 51 253.044l-16.533 4.432c-11.974 3.206-21.993 10.923-28.217 21.72C.036 290-1.612 302.576 1.61 314.604l4.777 17.826c3.23 12.066 10.937 22.137 21.702 28.371 10.764 6.237 23.303 7.892 35.314 4.671l16.542-4.427a203.4 203.4 0 0 0 29.008 37.831l-8.553 14.812c-12.83 22.208-5.132 50.752 17.161 63.632l15.987 9.226c10.81 6.242 23.385 7.921 35.405 4.718 12.02-3.198 22.056-10.896 28.28-21.67l8.544-14.809a203.8 203.8 0 0 0 47.279 6.21l4.431 16.533c3.212 11.974 10.919 21.998 21.72 28.212 7.198 4.141 15.168 6.251 23.248 6.251 4.058 0 8.135-.532 12.156-1.611l17.826-4.777c12.066-3.23 22.138-10.932 28.371-21.696 6.233-10.756 7.898-23.299 4.677-35.315l-4.431-16.538a203.8 203.8 0 0 0 37.834-29.013l14.814 8.553c22.22 12.821 50.755 5.132 63.631-17.17l9.227-15.978c12.857-22.293 5.259-50.859-16.952-63.685l-14.823-8.553A203.4 203.4 0 0 0 461 258.939l16.533-4.432c11.984-3.206 22.002-10.923 28.217-21.72 6.215-10.804 7.862-23.374 4.64-35.402m-20.791 26.104c-3.731 6.48-9.727 11.101-16.888 13.022l-23.467 6.287a9.32 9.32 0 0 0-6.906 9.203 185 185 0 0 1-7.37 56.079 9.32 9.32 0 0 0 4.286 10.681l21.037 12.143c13.312 7.684 17.853 24.836 10.127 38.226l-9.227 15.978c-7.734 13.394-24.85 18.031-38.171 10.346l-21.037-12.143c-3.703-2.125-8.426-1.487-11.392 1.633a185 185 0 0 1-44.868 34.413 9.32 9.32 0 0 0-4.522 10.582l6.287 23.476c1.929 7.198.928 14.709-2.802 21.151-3.74 6.465-9.8 11.092-17.07 13.04l-17.826 4.777c-7.243 1.937-14.795.951-21.283-2.795-6.479-3.73-11.101-9.722-13.021-16.884l-6.288-23.471a9.31 9.31 0 0 0-8.999-6.905q-.098 0-.209.003c-18.981.359-37.88-2.06-56.078-7.369a9.32 9.32 0 0 0-10.682 4.285l-12.138 21.028c-3.721 6.456-9.736 11.065-16.933 12.98-7.243 1.929-14.777.91-21.292-2.853l-15.987-9.222c-13.394-7.738-18.026-24.863-10.337-38.176l12.138-21.028a9.32 9.32 0 0 0-1.629-11.392 185.3 185.3 0 0 1-34.413-44.876 9.33 9.33 0 0 0-10.582-4.523l-23.476 6.289c-7.198 1.923-14.713.933-21.156-2.799-6.46-3.743-11.092-9.804-13.039-17.069l-4.777-17.826c-1.938-7.229-.946-14.791 2.793-21.286 3.731-6.48 9.727-11.102 16.888-13.022l23.467-6.287a9.32 9.32 0 0 0 6.906-9.207 185 185 0 0 1 7.37-56.069 9.32 9.32 0 0 0-4.286-10.684l-21.028-12.143c-6.451-3.726-11.065-9.741-12.985-16.933-1.92-7.216-.91-14.782 2.857-21.297l9.227-15.978c7.734-13.389 24.859-18.039 38.171-10.341l21.028 12.144a9.33 9.33 0 0 0 11.392-1.629 184.9 184.9 0 0 1 44.877-34.423 9.32 9.32 0 0 0 4.523-10.587l-6.297-23.466c-3.976-14.85 4.941-30.192 19.873-34.196l17.825-4.772c14.959-3.964 30.328 4.826 34.304 19.676l6.297 23.477a9.32 9.32 0 0 0 8.999 6.901c.064 0 .137 0 .209-.004 19.026-.377 37.871 2.047 56.069 7.366a9.306 9.306 0 0 0 10.683-4.285l12.138-21.029c3.722-6.451 9.736-11.059 16.934-12.979 7.216-1.917 14.768-.911 21.292 2.853l15.987 9.226c6.488 3.741 11.128 9.791 13.075 17.026 1.947 7.215.974 14.727-2.739 21.146l-12.138 21.029a9.32 9.32 0 0 0 1.629 11.392 184.9 184.9 0 0 1 34.413 44.876c2.065 3.767 6.442 5.615 10.582 4.522l23.476-6.288c7.197-1.915 14.704-.937 21.156 2.799 6.46 3.743 11.092 9.808 13.039 17.073l4.777 17.825c1.938 7.23.947 14.791-2.793 21.283"/><path d="M255.996 153.504c-56.515 0-102.493 45.978-102.493 102.493S199.481 358.49 255.996 358.49s102.493-45.979 102.493-102.493c0-56.515-45.978-102.493-102.493-102.493m0 186.351c-46.242 0-83.858-37.622-83.858-83.858s37.616-83.858 83.858-83.858 83.858 37.621 83.858 83.858-37.617 83.858-83.858 83.858"/></svg>
                ${__('Settings', 'blockish')}
            `;
            let templateLibraryRoot = document.getElementById('blockish-template-library-root');
            if (templateLibraryRoot) {
                toolbarElement.insertBefore(button, templateLibraryRoot.nextSibling);
            } else {
                toolbarElement.appendChild(button);
            }
		}

		const openModal = () => setIsOpen(true);
		button.addEventListener('click', openModal);

		return () => {
			button.removeEventListener('click', openModal);
			button.remove();
		};
	}, [toolbarElement, tabs.length]);

	if (tabs.length === 0) {
		return null;
	}

	return (
		<>
			<PluginMoreMenuItem icon={settingsIcon} onClick={() => setIsOpen(true)}>
				{__('Settings', 'blockish')}
			</PluginMoreMenuItem>
			{isOpen && (
				<Modal
					title={__('Settings', 'blockish')}
					onRequestClose={() => setIsOpen(false)}
					className="blockish-editor-settings-modal is-full-screen"
					shouldCloseOnClickOutside={false}
					isFullScreen={true}
					aria={{ label: __('Settings', 'blockish') }}
				>
                    <div className="blockish-settings-layout">
                        <TabPanel
                            className="blockish-settings-tabs"
                            activeClass="is-active"
                            orientation="vertical"
                            tabs={tabs.map(tab => ({ 
                                name: tab.name, 
                                title: (
                                    <div className="blockish-settings-tab-header">
                                        <span className="blockish-settings-tab-title">{tab.title}</span>
                                        {tab.description && <span className="blockish-settings-tab-description">{tab.description}</span>}
                                    </div>
                                )
                            }))}
                        >
                            { (tab) => {
                                const activeTabConfig = tabs.find(t => t.name === tab.name);
                                if (!activeTabConfig || !activeTabConfig.render) return null;
                                const RenderComponent = activeTabConfig.render;
                                return (
                                    <div className="blockish-settings-tab-content">
                                        <RenderComponent onClose={() => setIsOpen(false)} />
                                    </div>
                                );
                            }}
                        </TabPanel>
                    </div>
				</Modal>
			)}
		</>
	);
}

registerPlugin('blockish-editor-settings', {
	render: EditorSettingsModal,
	icon: settingsIcon,
});
