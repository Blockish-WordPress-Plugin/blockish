import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InnerBlocks, store as blockEditorStore } from '@wordpress/block-editor';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import { useSelect, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import Inspector from './inspector';
import Placeholder from './placeholder';
import './editor.scss';

export default function Edit({ attributes, setAttributes, advancedControls, clientId }) {
	const { hasChildBlocks, hasParent, isParent } = useSelect(
		(select) => {
			const { getBlockOrder, getBlockParentsByBlockName } = select(blockEditorStore);
			return {
				hasChildBlocks: getBlockOrder(clientId).length > 0,
				hasParent: getBlockParentsByBlockName(clientId, 'blockish/container').length > 0 ? true : false,
				isParent: getBlockParentsByBlockName(clientId, 'blockish/container').length === 0 ? true : false
			};
		},
		[clientId]
	);
	const { replaceInnerBlocks } = dispatch(blockEditorStore);
	const blockProps = useBlockProps({
		className: clsx('blockish-container', {
			'has-child-blocks': hasChildBlocks,
		}),
	});

	const innerBlockProps = useInnerBlocksProps(blockProps, {
		renderAppender: hasChildBlocks ? undefined : InnerBlocks?.ButtonBlockAppender
	});

	const handleVariationSelect = (nextVariation) => {
		if (nextVariation.name == '100') {
			setAttributes({
				isVariationPicked: true,
			});
		} else if (nextVariation?.name && nextVariation?.innerBlocks) {
			const innerBlocks = createBlocksFromInnerBlocksTemplate(nextVariation.innerBlocks);
			replaceInnerBlocks(clientId, innerBlocks).then(() => {
				setAttributes({
					isVariationPicked: true,
				});
			}).catch((error) => {
				console.error(error);
			});
		}
	};

	useEffect(() => {
		if (hasParent) {
			setAttributes({
				isVariationPicked: true,
			});
		}
	}, [hasParent]);

	let content = null;
	let Tag = attributes?.tagName?.value || 'div';

	if (attributes?.isVariationPicked) {
		content = (
			<>
				<Inspector
					attributes={attributes}
					setAttributes={setAttributes}
					advancedControls={advancedControls}
				/>
				<Tag {...innerBlockProps}></Tag>
			</>
		);
	}

	if (!attributes?.isVariationPicked && isParent) {
		content = (
			<div {...blockProps}>
				<Placeholder
					onSelect={handleVariationSelect}
					clientId={clientId}
				/>
			</div>
		);
	}

	return content;
}
