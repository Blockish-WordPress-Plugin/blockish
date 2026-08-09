import { __ } from '@wordpress/i18n';
import InteractionList from './InteractionList';
import InteractionForm from './InteractionForm';

export default function PageInteractionsPanel({
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
				scope="page"
			/>
		);
	}

	return (
		<div className="blockish-interactions-scope">
			<p className="blockish-interactions-scope__desc">
				{__(
					'Reusable on this page. Use signals so several blocks can work together.',
					'blockish'
				)}
			</p>
			<InteractionList
				items={items}
				onEdit={onEdit}
				onDelete={onDelete}
				emptyText={__(
					'Create page-wide rules you can reuse while editing this page.',
					'blockish'
				)}
			/>
		</div>
	);
}
