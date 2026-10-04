import { __ } from '@wordpress/i18n';
import InteractionList from './interaction-list';
import InteractionForm from './interaction-form';

/**
 * Block-only list/form body. Shell (modal/tabs/footer) stays in InteractionsBuilder.
 */
export default function BlockInteractionsPanel({
	items,
	onEdit,
	onDelete,
	onPlay,
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
				onPlay={onPlay}
				emptyText={__(
					'Add an animation, send a signal to other blocks, or run custom code.',
					'blockish'
				)}
			/>
		</div>
	);
}
