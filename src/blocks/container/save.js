import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const blockProps = useBlockProps.save({
		className: 'blockish-container',
	});

	const innerBlockProps = useInnerBlocksProps.save(blockProps);
	let Tag = attributes?.tagName?.value || 'div';

	return (
		<>
			<Tag {...innerBlockProps}></Tag>
		</>
	);
}