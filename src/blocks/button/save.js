import { RichText, useBlockProps } from '@wordpress/block-editor';

export default function Save({ attributes }) {
	const { getLinkProps, BlockishIcon } = window.blockish.helpers;

	const blockProps = useBlockProps.save({
        className: 'blockish-button',
    });

    const linkProps = {
        ...getLinkProps(attributes.url),
        className: 'blockish-button-link',
    }

	return (
		<div {...blockProps}>
			<a {...linkProps}>
				<RichText.Content
					tagName="span"
					value={attributes?.text}
				/>
				<BlockishIcon className="blockish-button-icon" icon={attributes?.icon} fill="currentColor" />
			</a>
		</div>
	);
}
