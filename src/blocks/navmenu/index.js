import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.navmenu,
	edit: Edit,
	save: Save,
} );
