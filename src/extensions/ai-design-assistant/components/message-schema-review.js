import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { ASSISTANT_SCHEMA_REVIEW_EVENT } from '../constants';

export default function MessageSchemaReview({ message }) {
	if (!message?.schema?.new || message?.schemaReview !== 'pending') {
		return null;
	}

	const reviewSchema = (action) => {
		window.dispatchEvent(new CustomEvent(ASSISTANT_SCHEMA_REVIEW_EVENT, {
			detail: {
				action,
				messageId: message.id,
			},
		}));
	};

	return (
		<div className="blockish-ai-assistant-schema-review">
			<Button
				className="blockish-ai-assistant-schema-review-action is-accept"
				variant="secondary"
				onClick={() => reviewSchema('accept')}
			>
				{__('Accept', 'blockish')}
			</Button>
			<Button
				className="blockish-ai-assistant-schema-review-action is-decline"
				variant="tertiary"
				onClick={() => reviewSchema('decline')}
			>
				{__('Decline', 'blockish')}
			</Button>
		</div>
	);
}
