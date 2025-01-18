import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InnerBlocks, store as blockEditorStore } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';
import { useSelect } from '@wordpress/data';
import clsx from 'clsx';
import Placeholder from './placeholder';

export default function Edit({ attributes, setAttributes, advancedControls, clientId }) {
	const { hasChildBlocks } = useSelect(
		(select) => {
			const { getBlockOrder } = select(blockEditorStore);
			return {
				hasChildBlocks: getBlockOrder(clientId).length > 0,
			};
		},
		[clientId]
	);
	const blockProps = useBlockProps({
		className: clsx('blockish-container', {
			'has-child-blocks': hasChildBlocks,
		}),
	});

	const innerBlockProps = useInnerBlocksProps(blockProps, {
		renderAppender: hasChildBlocks ? undefined : InnerBlocks?.ButtonBlockAppender
	});

	return (
		<>
			<Inspector {...{ attributes, setAttributes, advancedControls }} />
			{
				attributes.isVariationPicked ? (
					<div {...innerBlockProps}></div>
				) : (
					<div {...blockProps}>
						<Placeholder onSelect={(nextVariation) => {
							console.log(nextVariation);
						}} />
					</div>
				)
			}
		</>
	);
}
