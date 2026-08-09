import { __ } from '@wordpress/i18n';
import InteractionList from './InteractionList';
import InteractionForm from './InteractionForm';

/**
 * Block-only list/form body. Shell (modal/tabs/footer) stays in InteractionsBuilder.
 */
export default function BlockInteractionsPanel({
	items,
	onEdit,
	onDelete,
	editing,
	draft,
	setDraft,
	knownEventNames,
}) {
	if (editing && draft) {
		return (
			<InteractionForm
				draft={draft}
				onChange={setDraft}
				knownEventNames={knownEventNames}
				scope="block"
			/>
		);
	}

	return (
		<div className="blockish-interactions-scope">
			<InteractionList
				items={items}
				onEdit={onEdit}
				onDelete={onDelete}
				emptyText={__(
					'Add an animation, send a signal to other blocks, or run custom code.',
					'blockish'
				)}
			/>
		</div>
	);
}
