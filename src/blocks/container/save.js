import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save({ attributes }) {
	const blockProps = useBlockProps.save({
		className: clsx('blockish-container', {
			[`${attributes?.containerWidth}`]: attributes?.containerWidth && attributes?.isVariationPicked,
			[`layout-type-${attributes?.display}`]: attributes?.display,
			[`grid-layout-type-${attributes?.gridLayoutType}`]: attributes?.display === 'grid' && attributes?.gridLayoutType,
		}),
	});

	const innerBlockProps = useInnerBlocksProps.save(blockProps);
	let Tag = attributes?.tagName?.value || 'div';

	return (
		<>
			<Tag {...innerBlockProps}></Tag>
		</>
	);
}