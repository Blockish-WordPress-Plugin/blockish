import { PluginSidebar } from '@wordpress/editor';
import { registerPlugin } from '@wordpress/plugins';
import { __ } from '@wordpress/i18n';
import { PLUGIN_NAME } from './constants';
import useSidebarHeight from './hooks/use-sidebar-height';
import AssistantHeader from './components/header';
import AssistantMessages from './components/messages';
import AssistantComposer from './components/composer';
import useSelectedChat from './hooks/use-selected-chat';
import './editor.scss';

function AIDesignAssistantSidebar() {
	const { blockIcons } = window?.blockish?.components;
	const { panelHeight, setAssistantRoot } = useSidebarHeight();
	const selectedChat = useSelectedChat();

	return (
		<PluginSidebar
			name={ PLUGIN_NAME }
			title={ __( 'AI Design Assistant', 'blockish' ) }
			icon={ blockIcons?.aiDesignAssistantIcon }
			className="blockish-ai-assistant-sidebar"
		>
			<div
				className="blockish-ai-assistant"
				ref={ setAssistantRoot }
				style={
					panelHeight ? { height: `${ panelHeight }px` } : undefined
				}
			>
				<AssistantHeader selectedChat={ selectedChat } />
				<AssistantMessages selectedChat={ selectedChat } />
				<AssistantComposer selectedChat={ selectedChat } />
			</div>
		</PluginSidebar>
	);
}

registerPlugin( PLUGIN_NAME, { render: AIDesignAssistantSidebar } );
