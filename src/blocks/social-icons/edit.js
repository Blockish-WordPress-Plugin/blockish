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
import { getValidColorMode, getValidShape } from './shared';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'blockish/social-icon-item' ];
const TEMPLATE = [ [ 'blockish/social-icon-item' ] ];

export default function Edit( { attributes, advancedControls, clientId } ) {
	const { insertBlock } = useDispatch( blockEditorStore );
	const shape = getValidShape( attributes?.shape );
	const colorMode = getValidColorMode( attributes?.iconColorMode );

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
	const addIconLabel = __( 'Add Icon', 'blockish' );
	const { children, ...innerBlocksWrapperProps } = innerBlocksProps;

	return (
		<>
			<Inspector attributes={ attributes } advancedControls={ advancedControls } />
			<div className="blockish-social-icons-editor">
				<ul { ...innerBlocksWrapperProps }>
					{ children }
					<li className="blockish-social-icons-editor__appender-item">
						<Button
							className="blockish-social-icons-editor__appender-button"
							icon={plus}
							label={ addIconLabel }
							aria-label={ addIconLabel }
							onClick={ handleAddItem }
						/>
					</li>
				</ul>
			</div>
		</>
	);
}
