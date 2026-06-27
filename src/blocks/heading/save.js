import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { content, tag } = attributes;
	const Tag = tag?.value || 'h2';
	const blockProps = useBlockProps.save({
		className: 'blockish-heading',
	});

	return (
		<RichText.Content
			tagName={Tag}
			{...blockProps}
			value={content}
		/>
	);
}
