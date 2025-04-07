import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls }) {
	const blockProps = useBlockProps({
		className: 'blockish-heading',
	});
	
	return (
		<>
			<Inspector {...{ attributes, setAttributes, advancedControls }} />
			<div {...blockProps}>
				<RichText
					className="blockish-heading-content"
					tagName={attributes?.tag?.value}
					value={attributes?.content}
					onChange={(value) => setAttributes({ content: value })}
					placeholder={__('Heading...', 'blockish')}
				/>
			</div>
		</>
	);
}