import { registerBlockType } from '@wordpress/blocks';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';
import './style.scss';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.postFeaturedImage,
	edit: Edit,
	save: Save,
} );
