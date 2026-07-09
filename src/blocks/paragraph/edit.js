import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls }) {
	const { content } = attributes;
	const blockProps = useBlockProps({
		className: 'blockish-paragraph',
	});

	return (
		<>
			<Inspector attributes={attributes} setAttributes={setAttributes} advancedControls={advancedControls} />
			<RichText
				tagName="p"
				{...blockProps}
				value={content}
				onChange={(value) => setAttributes({ content: value })}
				placeholder={__('Type / to choose a block', 'blockish')}
			/>
		</>
	)
}
