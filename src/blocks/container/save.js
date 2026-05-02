import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';
import getBackgroundVideo from './background-video';

export default function Save({ attributes }) {
	const backgroundVideo = getBackgroundVideo(attributes?.containerBackground);
	const backgroundOverlay = typeof attributes?.containerBackgroundOverlay === 'string' ? JSON.parse(attributes?.containerBackgroundOverlay) : attributes?.containerBackgroundOverlay;
	const blockProps = useBlockProps.save({
		className: clsx('blockish-container', {
			'has-background-video': backgroundVideo?.url,
			'has-background-overlay': backgroundOverlay?.enabled,
			[`${attributes?.containerWidth}`]: attributes?.containerWidth && attributes?.isVariationPicked,
			[`layout-type-${attributes?.display}`]: attributes?.display,
			[`grid-layout-type-${attributes?.gridLayoutType}`]: attributes?.display === 'grid' && attributes?.gridLayoutType,
		}),
	});

	const innerBlockProps = useInnerBlocksProps.save(blockProps);
	let Tag = attributes?.tagName?.value || 'div';

	return (
		<>
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
