import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.postExcerpt,
	edit: Edit,
	save: Save,
} );
