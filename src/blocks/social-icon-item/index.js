import { registerBlockType } from '@wordpress/blocks';
import './style.scss';
import Edit from './edit';
import Save from './save';
import metadata from './block.json';

import deprecated from './deprecated';

registerBlockType( metadata.name, {
	icon: () => window?.blockish?.components?.blockIcons?.socialIconItem,
	edit: Edit,
	save: Save,
	deprecated,
} );
