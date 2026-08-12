/**
 * Context menu item mirroring core "Group", wrapping selection in blockish/container.
 * Ungroup already comes from container transforms.ungroup via core ConvertToGroupButton.
 */
import { registerPlugin } from '@wordpress/plugins';
import {
	BlockSettingsMenuControls,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { createBlock, cloneBlock } from '@wordpress/blocks';
import { useSelect, useDispatch } from '@wordpress/data';
import { MenuItem } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

const CONTAINER_BLOCK = 'blockish/container';

function ContainerizeMenuItem( { onClose } ) {
	const { clientIds, blocksSelection, isContainerizable } = useSelect(
		( select ) => {
			const {
				getSelectedBlockClientIds,
				getBlocksByClientId,
				getBlockRootClientId,
				canInsertBlockType,
				canRemoveBlocks,
			} = select( blockEditorStore );

			const ids = getSelectedBlockClientIds();
			const rootClientId = ids.length
				? getBlockRootClientId( ids[ 0 ] )
				: undefined;
			const canInsert = canInsertBlockType(
				CONTAINER_BLOCK,
				rootClientId
			);

			return {
				clientIds: ids,
				blocksSelection: getBlocksByClientId( ids ),
				isContainerizable:
					!! ids.length &&
					canInsert &&
					canRemoveBlocks( ids ),
			};
		},
		[]
	);

	const { replaceBlocks } = useDispatch( blockEditorStore );

	if ( ! isContainerizable ) {
		return null;
	}

	return (
		<MenuItem
			onClick={ () => {
				const wrapped = createBlock(
					CONTAINER_BLOCK,
					{ isVariationPicked: true },
					blocksSelection.map( ( block ) => cloneBlock( block ) )
				);
				replaceBlocks( clientIds, wrapped );
				onClose();
			} }
		>
			{ __( 'Containerize', 'blockish' ) }
		</MenuItem>
	);
}

registerPlugin( 'blockish-containerize', {
	render: () => (
		<BlockSettingsMenuControls>
			{ ( { onClose } ) => (
				<ContainerizeMenuItem onClose={ onClose } />
			) }
		</BlockSettingsMenuControls>
	),
} );
