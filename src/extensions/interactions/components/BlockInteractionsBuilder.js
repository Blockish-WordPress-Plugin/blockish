import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { upload, download } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import BlockInteractionsPanel from './BlockInteractionsPanel';
import InteractionsFooter from './InteractionsFooter';
import { createEmptyInteraction } from '../utils/constants';
import { compileList, normalizeInteraction } from '../utils/compile';
import { collectEventNames } from '../utils/labels';
import {
	ensureId,
	upsertInList,
	prepareSavedItem,
	normalizeList,
	exportJson,
	importJsonFile,
} from '../utils/helpers';

export default function BlockInteractionsBuilder({
	isOpen,
	onClose,
	attributes,
	setAttributes,
}) {
	const [items, setItems] = useState(() =>
		normalizeList(attributes?.interactionData, 'block')
	);
	const [draft, setDraft] = useState(null);
	const itemsRef = useRef(items);
	itemsRef.current = items;

	const knownEventNames = useMemo(() => collectEventNames([items]), [items]);
	const editing = !!draft;

	const persist = useCallback(
		(next) => {
			const withIds = next.map(ensureId);
			itemsRef.current = withIds;
			setItems(withIds);
			if (setAttributes) {
				setAttributes({
					interactionData: compileList(withIds, 'block'),
				});
			}
		},
		[setAttributes]
	);

	const done = useCallback(() => {
		persist(itemsRef.current);
		setDraft(null);
		onClose();
	}, [onClose, persist]);

	const saveDraft = useCallback(() => {
		const normalized = prepareSavedItem(draft, 'block');
		if (!normalized) return;
		persist(upsertInList(itemsRef.current, normalized));
		setDraft(null);
	}, [draft, persist]);

	if (!isOpen) {
		return null;
	}

	return (
		<Modal
			title={__('Interactions', 'blockish')}
			onRequestClose={done}
			className="blockish-interactions-modal"
			size="large"
		>
			<div className="blockish-interactions-modal__layout blockish-interactions-modal__layout--block">
				{!editing && (
					<div className="blockish-interactions-modal__toolbar">
						<div className="blockish-interactions-modal__toolbar-actions">
							<Button
								className="blockish-interactions-io-btn"
								variant="secondary"
								icon={upload}
								onClick={async () => {
									try {
										const data = await importJsonFile();
										persist(normalizeList(data, 'block'));
									} catch (e) {
										/* cancelled / invalid */
									}
								}}
							>
								{__('Import', 'blockish')}
							</Button>
							<Button
								className="blockish-interactions-io-btn"
								variant="secondary"
								icon={download}
								onClick={() =>
									exportJson(items, 'blockish-interactions-block.json')
								}
							>
								{__('Export', 'blockish')}
							</Button>
						</div>
					</div>
				)}
				<div className="blockish-interactions-modal__body">
					<BlockInteractionsPanel
						items={items}
						onEdit={(item) =>
							setDraft(ensureId(normalizeInteraction(item, 'block')))
						}
						onDelete={(id) =>
							persist(itemsRef.current.filter((i) => i.id !== id))
						}
						editing={editing}
						draft={draft}
						setDraft={setDraft}
						knownEventNames={knownEventNames}
					/>
				</div>
				<InteractionsFooter
					editing={editing}
					draft={draft}
					onBack={() => setDraft(null)}
					onSave={saveDraft}
					onAdd={() => setDraft(createEmptyInteraction('block'))}
					onDone={done}
					onClose={onClose}
					showClose
				/>
			</div>
		</Modal>
	);
}
