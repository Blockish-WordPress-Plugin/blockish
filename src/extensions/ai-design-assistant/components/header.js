import { __ } from '@wordpress/i18n';
import { useEffect, useMemo, useRef, useState } from '@wordpress/element';
import { Button, Flex, Icon, __experimentalText as Text } from '@wordpress/components';
import { addCard, timeToRead } from '@wordpress/icons';
import { search } from '@wordpress/icons';

export default function AssistantHeader({
	onResetChat,
	chatSessions,
	activeSessionId,
	onSelectSession,
	currentTitle,
}) {
	const [isHistoryOpen, setIsHistoryOpen] = useState(false);
	const [searchTerm, setSearchTerm] = useState('');
	const containerRef = useRef(null);

	const filteredSessions = useMemo(() => {
		const keyword = searchTerm.trim().toLowerCase();
		if (!keyword) {
			return chatSessions;
		}

		return chatSessions.filter((session) => session.title.toLowerCase().includes(keyword));
	}, [chatSessions, searchTerm]);

	useEffect(() => {
		const handleOutsideClick = (event) => {
			if (!containerRef.current) {
				return;
			}

			if (!containerRef.current.contains(event.target)) {
				setIsHistoryOpen(false);
			}
		};

		document.addEventListener('mousedown', handleOutsideClick);
		return () => {
			document.removeEventListener('mousedown', handleOutsideClick);
		};
	}, []);

	const handleSelect = (sessionId) => {
		onSelectSession(sessionId);
		setIsHistoryOpen(false);
	};

	return (
		<div className="blockish-ai-assistant-sidebar-header" ref={containerRef}>
			<Flex justify="space-between" align="center">
				<Text className="blockish-ai-assistant-sidebar-header-title">
					{currentTitle || __('AI Design Assistant', 'blockish')}
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
						onClick={onResetChat}
						label={__('Create new chat', 'blockish')}
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
						{filteredSessions.length > 0 ? (
							filteredSessions.map((session) => (
								<button
									key={session.id}
									type="button"
									className={`blockish-ai-assistant-history-item ${session.id === activeSessionId ? 'is-active' : ''}`}
									onClick={() => handleSelect(session.id)}
								>
									{session.title}
								</button>
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
