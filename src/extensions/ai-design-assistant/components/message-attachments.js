const MessageAttachments = ({ attachments = [], onImageLoad }) => {
	const imageAttachments = attachments.filter(
		(attachment) => attachment?.type === 'image' && attachment?.url
	);

	if (!imageAttachments.length) {
		return null;
	}

	return (
		<div className="blockish-ai-assistant-message-attachments">
			{imageAttachments.map((attachment) => (
				<img
					key={attachment.id || attachment.url}
					src={attachment.url}
					alt={attachment.name || ''}
					className="blockish-ai-assistant-message-image"
					onLoad={onImageLoad}
				/>
			))}
		</div>
	);
};

export default MessageAttachments;
