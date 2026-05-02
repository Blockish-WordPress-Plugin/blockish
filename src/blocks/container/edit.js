import { __ } from '@wordpress/i18n';
import { useBlockProps, useInnerBlocksProps, InnerBlocks, store as blockEditorStore } from '@wordpress/block-editor';
import { createBlocksFromInnerBlocksTemplate } from '@wordpress/blocks';
import { useSelect, dispatch } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import clsx from 'clsx';
import Inspector from './inspector';
import Placeholder from './placeholder';
import getBackgroundVideo from './background-video';
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
	const backgroundVideo = getBackgroundVideo(attributes?.containerBackground);
	const backgroundOverlay = typeof attributes?.containerBackgroundOverlay === 'string' ? JSON.parse(attributes?.containerBackgroundOverlay) : attributes?.containerBackgroundOverlay;
	const blockProps = useBlockProps({
		className: clsx({
			'has-child-blocks': hasChildBlocks,
			'blockish-container': attributes?.isVariationPicked && hasChildBlocks,
			'has-background-video': backgroundVideo?.url,
			'has-background-overlay': backgroundOverlay?.enabled,
			[`${attributes?.containerWidth}`]: attributes?.containerWidth && attributes?.isVariationPicked,
			[`layout-type-${attributes?.display}`]: attributes?.display,
			[`grid-layout-type-${attributes?.gridLayoutType}`]: attributes?.display === 'grid' && attributes?.gridLayoutType,
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
			if (nextVariation?.attributes) {
				setAttributes(nextVariation?.attributes);
			}
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
				containerWidth: 'align-custom-width'
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
					hasParent={hasParent}
				/>
				<Tag {...innerBlockProps}>
					{backgroundVideo?.url && (
						<video
							className="blockish-container-background-video"
							src={backgroundVideo.url}
							autoPlay
							muted
							loop
							playsInline
							aria-hidden="true"
						/>
					)}
					{innerBlockProps.children}
				</Tag>
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
