import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { isFormSaveDisabled } from '../utils/helpers';

export default function InteractionsFooter({
	editing,
	draft,
	onBack,
	onPreview,
	onSave,
	onAdd,
	onDone,
	onClose,
	addDisabled,
	showClose,
}) {
	return (
		<footer className="blockish-interactions-modal__footer">
			{editing && onPreview ? (
				<Button
					variant="tertiary"
					onClick={onPreview}
					title={__(
						'Plays on the selected block. Scroll and pin animations only run on the front end.',
						'blockish'
					)}
				>
					{__('Preview', 'blockish')}
				</Button>
			) : null}
			<div className="blockish-interactions-modal__footer-spacer" />
			{editing ? (
				<>
					<Button variant="secondary" onClick={onBack}>
						{__('Back', 'blockish')}
					</Button>
					<Button
						variant="primary"
						className="is-blockish-primary"
						onClick={onSave}
						disabled={isFormSaveDisabled(draft)}
					>
						{__('Apply', 'blockish')}
					</Button>
				</>
			) : (
				<>
					<Button
						variant="primary"
						className="is-blockish-primary"
						onClick={onAdd}
						disabled={addDisabled}
					>
						{__('Add interaction', 'blockish')}
					</Button>
					{showClose ? (
						<Button variant="secondary" onClick={onClose}>
							{__('Close', 'blockish')}
						</Button>
					) : null}
					<Button
						variant="primary"
						className="is-blockish-primary"
						onClick={onDone}
					>
						{__('Done', 'blockish')}
					</Button>
				</>
			)}
		</footer>
	);
}
