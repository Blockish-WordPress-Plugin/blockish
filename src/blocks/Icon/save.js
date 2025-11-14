import { useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { BlockishIcon, getLinkProps } = window.blockish.helpers;
	const linkAttributes = getLinkProps(attributes.link);
	const Tag = linkAttributes?.href ? 'a' : 'div';
	const blockProps = useBlockProps.save({
		className: 'blockish-icon',
		...linkAttributes
	});
	return (
		<Tag {...blockProps}>
			<BlockishIcon icon={attributes.icon} width={24} height={24} fill="currentColor" />
		</Tag>
	);
}