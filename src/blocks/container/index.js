import { registerBlockType } from '@wordpress/blocks';
import { addFilter } from '@wordpress/hooks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import transforms from './transforms';

registerBlockType( metadata.name, {
	edit: Edit,
	save: Save,
	icon: () => window?.blockish?.components?.blockIcons?.container,
	transforms: transforms
});