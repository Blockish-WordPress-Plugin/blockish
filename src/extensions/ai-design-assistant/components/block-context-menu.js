import { BlockSettingsMenuControls, store as blockEditorStore } from '@wordpress/block-editor';
import { MenuItem } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { setAssistantContext } from '../utils/session';
import { serializeBlock } from '../utils/block-schema';

export default function AssistantBlockContextMenu() {
	const selectedBlocks = useSelect((select) => {
		const blockEditor = select(blockEditorStore);
		const selectedClientIds = blockEditor.getSelectedBlockClientIds();
		const selectedClientId = blockEditor.getSelectedBlockClientId();
		const clientIds = selectedClientIds.length
			? selectedClientIds
			: selectedClientId
				? [selectedClientId]
				: [];

		return clientIds
			.map((clientId) => blockEditor.getBlock(clientId))
			.filter(Boolean);
	}, []);

	const addBlocksToContext = (includeInnerBlocks = false) => {
		if (!selectedBlocks.length) {
			return;
		}

		setAssistantContext({
			source: 'block-menu',
			scope: 'selection',
			mode: includeInnerBlocks ? 'blocks_with_inner_blocks' : 'blocks',
			createdAt: new Date().toISOString(),
			blocks: selectedBlocks
				.map((block) => serializeBlock(block, includeInnerBlocks))
				.filter(Boolean),
		});
	};

	return (
		<BlockSettingsMenuControls>
			{({ onClose }) => (
				<>
					<MenuItem
						onClick={() => {
							addBlocksToContext(false);
							onClose();
						}}
					>
						{__('Use block as AI context', 'blockish')}
					</MenuItem>
					<MenuItem
						onClick={() => {
							addBlocksToContext(true);
							onClose();
						}}
					>
						{__('Use block with inner blocks as AI context', 'blockish')}
					</MenuItem>
				</>
			)}
		</BlockSettingsMenuControls>
	);
}
