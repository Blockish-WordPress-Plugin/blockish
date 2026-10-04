import { __ } from '@wordpress/i18n';
import { Button, Icon } from '@wordpress/components';
import { trash, pencil, play } from '@wordpress/icons';
import { summarizeInteraction } from '../utils/labels';
import { normalizeInteraction } from '../utils/compile';

export default function InteractionList({
	items,
	onEdit,
	onDelete,
	onPlay,
	emptyText,
}) {
	if (!items?.length) {
		return (
			<div className="blockish-interactions-empty">
				<p className="blockish-interactions-empty__title">
					{__('Nothing here yet', 'blockish')}
				</p>
				<p className="blockish-interactions-empty__text">
					{emptyText || __('Add one to get started.', 'blockish')}
				</p>
			</div>
		);
	}

	return (
		<ul className="blockish-interactions-list">
			{items.map((item, index) => {
				const summary = summarizeInteraction(item);
				return (
					<li key={item.id || index} className="blockish-interactions-list__item">
						<div className="blockish-interactions-list__meta">
							{summary.title ? (
								<strong className="blockish-interactions-list__title">
									{summary.title}
								</strong>
							) : null}
							<span className="blockish-interactions-list__detail">
								{summary.detail}
							</span>
						</div>
						<div className="blockish-interactions-list__actions">
							{onPlay &&
							!['emit', 'custom', 'scrollTo'].includes(
								normalizeInteraction(item, 'block')?.action?.type
							) ? (
								<Button
									icon={<Icon icon={play} />}
									size="small"
									label={__('Play on this block', 'blockish')}
									onClick={() => onPlay(item)}
								/>
							) : null}
							<Button
								icon={<Icon icon={pencil} />}
								size="small"
								label={__('Edit', 'blockish')}
								onClick={() => onEdit(item)}
							/>
							<Button
								icon={<Icon icon={trash} />}
								size="small"
								isDestructive
								label={__('Delete', 'blockish')}
								onClick={() => onDelete(item.id)}
							/>
						</div>
					</li>
				);
			})}
		</ul>
	);
}
