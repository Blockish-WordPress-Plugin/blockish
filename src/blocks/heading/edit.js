import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls }) {
	const { content, tag } = attributes;
	const Tag = tag?.value || 'h2';
	const blockProps = useBlockProps({
		className: 'blockish-heading',
	});

	return (
		<>
			<Inspector attributes={attributes} setAttributes={setAttributes} advancedControls={advancedControls} />
			<RichText
				tagName={Tag}
				{...blockProps}
				value={content}
				onChange={(value) => setAttributes({ content: value })}
				placeholder={__('Enter heading text...', 'blockish')}
			/>
		</>
	)
}
