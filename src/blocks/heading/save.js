import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { content, tag, url } = attributes;
	const Tag = tag?.value || 'h2';
	const blockProps = useBlockProps.save({
		className: 'blockish-heading',
	});

	const { getLinkProps } = window.blockish.helpers;

	const hasStaticUrl = url && url.url;
	const hasDynamicUrl = attributes.dynamicData?.url?.some(b => b.slug === 'url' && b.url);

	if ( hasStaticUrl || hasDynamicUrl ) {
		const linkProps = url ? getLinkProps(url) : {};
		return (
			<Tag {...blockProps}>
				<a {...linkProps}>
					<RichText.Content value={content} />
				</a>
			</Tag>
		);
	}

	return (
		<RichText.Content
			tagName={Tag}
			{...blockProps}
			value={content}
		/>
	);
}
