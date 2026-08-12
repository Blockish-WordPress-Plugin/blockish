import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import transforms from './transforms';
import './filters';
import './containerize-menu';

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
	icon: () => window?.blockish?.components?.blockIcons?.container,
	transforms: transforms
});