import { __ } from '@wordpress/i18n';
import { useBlockProps, RichText } from '@wordpress/block-editor';
import Inspector from './inspector';
// import Placeholder from './placeholder';
import './editor.scss';

export default function Edit({ attributes, setAttributes, advancedControls, clientId }) {
	const blockProps = useBlockProps({
		className: 'blockish-heading',
	});

	return (
		<>
			{/* <Placeholder {...{ attributes, setAttributes, advancedControls }} /> */}
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
