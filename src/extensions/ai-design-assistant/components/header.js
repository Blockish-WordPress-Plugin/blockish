import { __ } from '@wordpress/i18n';
import { useEffect, useRef, useState } from '@wordpress/element';
import { useDispatch } from '@wordpress/data';
import { Button, Flex, Icon, __experimentalText as Text } from '@wordpress/components';
import { addCard, timeToRead, trash, search } from '@wordpress/icons';
import { useChats } from '../utils/use-chats';
import { CHAT_POST_TYPE, CHAT_SESSION_KEY } from '../constants';

export default function AssistantHeader({ selectedChat }) {
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const [showConfirm, setShowConfirm] = useState(false);
	const containerRef = useRef(null);
	const chatHistory = useChats(searchTerm);
	const { deleteEntityRecord } = useDispatch('core');

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (!containerRef.current) {
				return;
			}

			if (!containerRef.current.contains(event.target)) {
				setIsHistoryOpen(false);
				setShowConfirm(false);
				setSearchTerm('');
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	const handleSelect = (id) => {
		setIsHistoryOpen(false);
		setShowConfirm(false);
		setSearchTerm('');
		window.sessionStorage.setItem(CHAT_SESSION_KEY, id);
	};

	const deleteChat = async (id) => {
		try {
			const sessionId = window.sessionStorage.getItem(CHAT_SESSION_KEY);
			if (id === sessionId) {
				window.sessionStorage.removeItem(CHAT_SESSION_KEY);
			}
			await deleteEntityRecord('postType', CHAT_POST_TYPE, id, {
				force: true,
			});
		} catch (error) {
			console.error(error);
		}
	};

	return (
		<div className="blockish-ai-assistant-sidebar-header" ref={containerRef}>
			<Flex justify="space-between" align="center">
				<Text className="blockish-ai-assistant-sidebar-header-title">
					{selectedChat?.title || __('AI Design Assistant', 'blockish')}
				</Text>
				<Flex align="center" expanded={false} gap={0}>
					<Button
						className="blockish-ai-assistant-sidebar-header-icon"
						variant="tertiary"
						icon={timeToRead}
						label={__('History', 'blockish')}
						onClick={() => setIsHistoryOpen((prev) => !prev)}
					/>
					<Button
						className="blockish-ai-assistant-sidebar-header-icon"
						variant="tertiary"
						icon={addCard}
						label={__('Create new chat', 'blockish')}
						onClick={() => window.sessionStorage.removeItem(CHAT_SESSION_KEY)}
					/>
				</Flex>
			</Flex>

			{isHistoryOpen && (
				<div className="blockish-ai-assistant-history-dropdown">
					<div className="blockish-ai-assistant-history-search-wrap">
						<span className="blockish-ai-assistant-history-search-icon">
							<Icon icon={search} size={14} />
						</span>
						<input
							className="blockish-ai-assistant-history-search"
							type="text"
							value={searchTerm}
							onChange={(event) => setSearchTerm(event.target.value)}
							placeholder={__('Search chats', 'blockish')}
						/>
					</div>
					<div className="blockish-ai-assistant-history-list">
						{chatHistory.length > 0 ? (
							chatHistory.map((chat) => (
								<Flex
									key={chat?.id}
									className="blockish-ai-assistant-history-item"
									justify="space-between"
									align="center"
									onClick={() => handleSelect(chat?.id)}
									tabIndex={0}
								>
									<Text className="blockish-ai-assistant-history-item-title">
										{chat?.title}
									</Text>
									{
										!showConfirm ? (
											<Button
												className="blockish-ai-assistant-history-item-delete"
												variant="tertiary"
												icon={trash}
												label={__('Delete', 'blockish')}
												size='small'
												onClick={(event) => {
													event.stopPropagation();
													setShowConfirm(true);
												}}
											/>
										) : (
											<Button
												className="blockish-ai-assistant-history-item-delete"
												variant="tertiary"
												label={__('Cancel', 'blockish')}
												size='small'
												onClick={async (event) => {
													event.stopPropagation();
													await deleteChat(chat?.id);
													setShowConfirm(false);
												}}
											>
												{__('Confirm?', 'blockish')}
											</Button>
										)
									}
								</Flex>
							))
						) : (
							<div className="blockish-ai-assistant-history-empty">
								{__('No chats found.', 'blockish')}
							</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
