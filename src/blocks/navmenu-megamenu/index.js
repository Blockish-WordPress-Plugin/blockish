import { registerBlockType } from '@wordpress/blocks';
import { columns } from '@wordpress/icons';
import './style.scss';
import Edit from './edit';
import metadata from './block.json';

registerBlockType( metadata.name, {
	icon: columns,
	edit: Edit,
	save: () => null,
} );
