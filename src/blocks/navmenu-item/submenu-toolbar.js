import { BlockControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { addSubmenu, columns } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function SubmenuToolbar( { clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );

	const { canAddSubmenu, canAddMegamenu } = useSelect(
		( select ) => {
			const {
				getBlocks,
				canInsertBlockType,
				getBlockEditingMode,
			} = select( blockEditorStore );

			// Locked / content-only / disabled items cannot gain children.
			const editingMode = getBlockEditingMode?.( clientId );
			if ( editingMode === 'disabled' || editingMode === 'contentOnly' ) {
				return { canAddSubmenu: false, canAddMegamenu: false };
			}

			if ( getBlocks( clientId ).length > 0 ) {
				return { canAddSubmenu: false, canAddMegamenu: false };
			}

			return {
				canAddSubmenu: canInsertBlockType(
					'blockish/navmenu-submenu',
					clientId
				),
				canAddMegamenu: canInsertBlockType(
					'blockish/navmenu-megamenu',
					clientId
				),
			};
		},
		[ clientId ]
	);

	if ( ! canAddSubmenu && ! canAddMegamenu ) {
		return null;
	}

	const handleAddSubmenu = () => {
		insertBlock(
			createBlock( 'blockish/navmenu-submenu' ),
			undefined,
			clientId,
			true
		);
	};

	const handleAddMegamenu = () => {
		insertBlock(
			createBlock( 'blockish/navmenu-megamenu' ),
			undefined,
			clientId,
			true
		);
	};

	return (
		<BlockControls group="block">
			<ToolbarGroup>
				{ canAddSubmenu ? (
					<ToolbarButton
						icon={ addSubmenu }
						label={ __( 'Add submenu', 'blockish' ) }
						onClick={ handleAddSubmenu }
					/>
				) : null }
				{ canAddMegamenu ? (
					<ToolbarButton
						icon={ columns }
						label={ __( 'Add mega menu', 'blockish' ) }
						onClick={ handleAddMegamenu }
					/>
				) : null }
			</ToolbarGroup>
		</BlockControls>
	);
}
