import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.offcanvas,
	edit: Edit,
	save: Save,
} );
