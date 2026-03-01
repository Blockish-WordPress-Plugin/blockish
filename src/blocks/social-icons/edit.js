import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { plus } from '@wordpress/icons';
import Inspector from './inspector';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'blockish/social-icon-item' ];
const TEMPLATE = [ [ 'blockish/social-icon-item' ] ];
const SHAPE_OPTIONS = [ 'square', 'rounded', 'circle' ];
const COLOR_MODES = [ 'official', 'custom' ];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );
	const shape = SHAPE_OPTIONS.includes( attributes?.shape )
		? attributes.shape
		: 'circle';
	const colorMode = COLOR_MODES.includes( attributes?.iconColorMode )
		? attributes.iconColorMode
		: 'official';

	const blockProps = useBlockProps( {
		className: `blockish-social-icons shape-${ shape } is-color-${ colorMode }`,
	} );

	const innerBlocksProps = useInnerBlocksProps( blockProps, {
		allowedBlocks: ALLOWED_BLOCKS,
		template: TEMPLATE,
		renderAppender: false,
		orientation: 'horizontal',
	} );

	const handleAddItem = () => {
		insertBlock( createBlock( 'blockish/social-icon-item' ), undefined, clientId );
	};

	return (
		<>
			<Inspector attributes={ attributes } advancedControls={ advancedControls } />
			<div className="blockish-social-icons-editor">
				<ul { ...innerBlocksProps }>
					{ innerBlocksProps.children }
					<li className="blockish-social-icons-editor__appender-item">
						<Button
							className="blockish-social-icons-editor__appender-button"
							icon={plus}
							label={ __( 'Add Icon', 'blockish' ) }
							aria-label={ __( 'Add Icon', 'blockish' ) }
							onClick={ handleAddItem }
						/>
					</li>
				</ul>
			</div>
		</>
	);
}
