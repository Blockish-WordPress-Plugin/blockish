import { __ } from '@wordpress/i18n';

const MessageReasoning = ({ reasoning = [] }) => {
	if (!reasoning.length) {
		return null;
	}

	const [firstReason, ...otherReasons] = reasoning;
	const remainingCount = otherReasons.length;

	return (
		<div className="blockish-ai-assistant-message-reasoning">
			<span className="blockish-ai-assistant-message-reasoning-label">
				{__('Thinking', 'blockish')}
			</span>
			<span className="blockish-ai-assistant-message-reasoning-text">
				{firstReason}
			</span>
			{remainingCount ? (
				<span className="blockish-ai-assistant-message-reasoning-count">
					{`+${remainingCount}`}
				</span>
			) : null}
		</div>
	);
};

export default MessageReasoning;
