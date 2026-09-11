import { useCallback, useMemo, useRef, useState } from '@wordpress/element';
import { Modal, Button } from '@wordpress/components';
import { upload, download } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';
import { SVG, Path } from '@wordpress/primitives';
import BlockInteractionsPanel from './BlockInteractionsPanel';
import InteractionsFooter from './InteractionsFooter';
import { createEmptyInteraction } from '../utils/constants';
import { compileList, normalizeInteraction } from '../utils/compile';
import { collectEventNames } from '../utils/labels';
import { previewInteraction } from '../utils/preview';
import { useDraggableModal } from '../utils/use-draggable-modal';
import {
	ensureId,
	upsertInList,
	prepareSavedItem,
	normalizeList,
	exportJson,
	importJsonFile,
} from '../utils/helpers';

const maximizeIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			d="M6.75 6.75h10.5v10.5H6.75z"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
		/>
	</SVG>
);

const restoreIcon = (
	<SVG xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
		<Path
			d="M9 6.75h8.25V15"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
		/>
		<Path
			d="M6.75 9h8.25v8.25H6.75z"
			fill="none"
			stroke="currentColor"
			strokeWidth="1.75"
		/>
	</SVG>
);

export default function BlockInteractionsBuilder({
	isOpen,
	onClose,
	attributes,
	setAttributes,
	clientId,
}) {
	const [items, setItems] = useState(() =>
		normalizeList(attributes?.interactionData, 'block')
	);
	const [draft, setDraft] = useState(null);
	const [size, setSize] = useState(() => {
		try {
			return window.localStorage.getItem('blockish-ix-modal-size') === 'compact'
				? 'compact'
				: 'normal';
		} catch (e) {
			return 'normal';
		}
	});
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

	const startPreview = useCallback(() => {
		previewInteraction(draft, clientId);
	}, [draft, clientId]);

	useDraggableModal(isOpen);

	const changeSize = useCallback((next) => {
		setSize(next);
		try {
			window.localStorage.setItem('blockish-ix-modal-size', next);
		} catch (e) {
			/* ignore */
		}
	}, []);

	if (!isOpen) {
		return null;
	}

	return (
		<Modal
			title={__('Interactions', 'blockish')}
			onRequestClose={done}
			className={`blockish-interactions-modal is-size-${size}`}
			overlayClassName="blockish-interactions-modal-overlay"
			size="large"
			headerActions={
				<Button
					className="blockish-interactions-modal__size-btn"
					icon={size === 'compact' ? maximizeIcon : restoreIcon}
					label={
						size === 'compact'
							? __('Normal size', 'blockish')
							: __('Compact size', 'blockish')
					}
					onClick={() =>
						changeSize(size === 'compact' ? 'normal' : 'compact')
					}
				/>
			}
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
						clientId={clientId}
						onPreview={startPreview}
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
