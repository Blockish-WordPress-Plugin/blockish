import { __ } from '@wordpress/i18n';
import { Spinner } from '@wordpress/components';
import InteractionList from './InteractionList';
import InteractionForm from './InteractionForm';

/**
 * Global-only list/form body. Shell (modal/tabs/footer) stays in InteractionsBuilder.
 */
export default function GlobalInteractionsPanel({
	items,
	onEdit,
	onDelete,
	editing,
	draft,
	setDraft,
	knownEventNames,
	loading,
}) {
	if (editing && draft) {
		return (
			<InteractionForm
				draft={draft}
				onChange={setDraft}
				knownEventNames={knownEventNames}
				scope="global"
			/>
		);
	}

	return (
		<>
			{loading ? (
				<div className="blockish-interactions-loading">
					<Spinner />
				</div>
			) : null}
			<div className="blockish-interactions-scope">
				<p className="blockish-interactions-scope__desc">
					{__(
						'Reusable everywhere on your site. Handy for shared click or load behavior.',
						'blockish'
					)}
				</p>
				<InteractionList
					items={items}
					onEdit={onEdit}
					onDelete={onDelete}
					emptyText={__(
						'Create site-wide rules once, then use them on any page.',
						'blockish'
					)}
				/>
			</div>
		</>
	);
}
