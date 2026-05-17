import { __ } from '@wordpress/i18n';
import { Button } from '@wordpress/components';
import { check, copySmall, pencil } from '@wordpress/icons';

const MessageActions = ({
	copied,
	message,
	onCopy,
	onEdit,
}) => (
	<div className="blockish-ai-assistant-message-tools">
		<span className="blockish-ai-assistant-message-time">
			{message?.time || ''}
		</span>
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
		<Button
			className="blockish-ai-assistant-message-tool"
			variant="tertiary"
			icon={pencil}
			iconSize={14}
			onClick={() => onEdit(message)}
			label={__('Edit message', 'blockish')}
		/>
	</div>
);

export default MessageActions;
