import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { check, copySmall, pencil, rotateRight } from '@wordpress/icons';

const MessageActions = ({
	copied,
	message,
	onCopy,
	onEdit,
	onRegenerate,
}) => (
	<div className="blockish-ai-assistant-message-tools">
		<span className="blockish-ai-assistant-message-time">
			{message?.time || ''}
		</span>
		{onRegenerate ? (
			<Button
				className="blockish-ai-assistant-message-tool"
				variant="tertiary"
				icon={rotateRight}
				iconSize={14}
				onClick={() => onRegenerate(message)}
				label={__('Regenerate response', 'blockish')}
			/>
		) : null}
		{onCopy ? (
			<Button
				className="blockish-ai-assistant-message-tool"
				variant="tertiary"
				icon={copied ? check : copySmall}
				iconSize={14}
				onClick={() => onCopy(message)}
				label={copied
					? __('Copied', 'blockish')
					: __('Copy message', 'blockish')}
			/>
		) : null}
		{onEdit ? (
			<Button
				className="blockish-ai-assistant-message-tool"
				variant="tertiary"
				icon={pencil}
				iconSize={14}
				onClick={() => onEdit(message)}
				label={__('Edit message', 'blockish')}
			/>
		) : null}
	</div>
);

export default MessageActions;
