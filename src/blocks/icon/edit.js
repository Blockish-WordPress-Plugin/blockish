import { __ } from '@wordpress/i18n';
import { useBlockProps } from '@wordpress/block-editor';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, advancedControls }) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps(attributes.link);
	const Tag = linkAttributes?.href ? 'a' : 'div';
	const blockProps = useBlockProps({
		className: 'blockish-icon',
		...linkAttributes
	});
	return (
		<>
			<Inspector attributes={attributes} advancedControls={advancedControls} />
			<Tag {...blockProps}>
				<BlockishIcon icon={attributes.icon} width={24} height={24} fill="currentColor" />
			</Tag>
		</>
	)
}
