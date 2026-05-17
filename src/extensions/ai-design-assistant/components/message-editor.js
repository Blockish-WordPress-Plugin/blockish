import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { useEffect, useRef } from '@wordpress/element';

const MessageEditor = ({
	content,
	onCancel,
	onChange,
	onSave,
}) => {
	const textareaRef = useRef(null);

	const resizeTextarea = () => {
		if (!textareaRef.current) {
			return;
		}

		textareaRef.current.style.height = 'auto';
		textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
	};

	useEffect(() => {
		resizeTextarea();
	}, [content]);

	return (
		<div className="blockish-ai-assistant-message-edit">
			<textarea
				ref={textareaRef}
				className="blockish-ai-assistant-message-edit-input"
				value={content}
				onChange={(event) => {
					onChange(event.target.value);
					resizeTextarea();
				}}
				rows={1}
			/>
			<div className="blockish-ai-assistant-message-edit-actions">
				<Button
					className="blockish-ai-assistant-message-edit-action is-cancel"
					variant="tertiary"
					onClick={onCancel}
				>
					{__('Cancel', 'blockish')}
				</Button>
				<Button
					className="blockish-ai-assistant-message-edit-action is-send"
					variant="secondary"
					onClick={onSave}
					disabled={!content.trim()}
				>
					{__('Send', 'blockish')}
				</Button>
			</div>
		</div>
	);
};

export default MessageEditor;
