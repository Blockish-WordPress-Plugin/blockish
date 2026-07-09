import { useBlockProps, RichText } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { content, url } = attributes;
	const blockProps = useBlockProps.save({
		className: 'blockish-paragraph',
	});

	const { getLinkProps } = window.blockish.helpers;

	const hasStaticUrl = url && url.url;
	const hasDynamicUrl = attributes.dynamicData?.url?.some(b => b.slug === 'url' && b.url);

	if ( hasStaticUrl || hasDynamicUrl ) {
		const linkProps = url ? getLinkProps(url) : {};
		return (
			<p {...blockProps}>
				<a {...linkProps}>
					<RichText.Content value={content} />
				</a>
			</p>
		);
	}

	return (
		<RichText.Content
			tagName="p"
			{...blockProps}
			value={content}
		/>
	);
}
