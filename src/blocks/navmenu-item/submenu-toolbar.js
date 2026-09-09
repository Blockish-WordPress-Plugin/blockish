import { BlockControls, store as blockEditorStore } from '@wordpress/block-editor';
import { ToolbarButton, ToolbarGroup } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { addSubmenu, columns } from '@wordpress/icons';
import { __ } from '@wordpress/i18n';

export default function SubmenuToolbar( { clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );

	const hasChild = useSelect(
		( select ) => select( blockEditorStore ).getBlocks( clientId ).length > 0,
		[ clientId ]
	);

	if ( hasChild ) {
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
				<ToolbarButton
					icon={ addSubmenu }
					label={ __( 'Add submenu', 'blockish' ) }
					onClick={ handleAddSubmenu }
				/>
				<ToolbarButton
					icon={ columns }
					label={ __( 'Add mega menu', 'blockish' ) }
					onClick={ handleAddMegamenu }
				/>
			</ToolbarGroup>
		</BlockControls>
	);
}
