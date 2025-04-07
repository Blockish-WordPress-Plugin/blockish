import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Edit({ attributes }) {
	const blockProps = useBlockProps.save({
		className: 'blockish-heading',
	});

	return (
		<>
			<div {...blockProps}>
				<RichText.Content
					className="blockish-heading-content"
					tagName={attributes?.tag?.value}
					value={attributes?.content}
				/>
			</div>
		</>
	);
}