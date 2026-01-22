import { useBlockProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save({ attributes }) {
	const blockProps = useBlockProps.save({
		className: 'blockish-image-wrapper',
	});

	const imageURL = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.url || attributes?.image?.url;
	const imageWidth = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.width || attributes?.image?.width || 'auto';
	const imageHeight = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.height || attributes?.image?.height || 'auto';
	const caption = attributes?.captionType === 'custom' ? attributes?.customCaption : attributes?.image?.caption;

	return (
		<figure {...blockProps}>
			{
				attributes?.image?.url && (
					<img
						width={imageWidth}
						height={imageHeight}
						alt={attributes?.alt || attributes?.image?.alt}
						title={attributes?.title || attributes?.image?.title}
						className={
							clsx(
								'blockish-image',
								{
									[`wp-image-${attributes?.image?.id}`]: !!attributes?.image?.id,
								}
							)
						}
						src={imageURL}
					/>
				)
			}
			{
				caption && attributes?.captionType !== 'none' && (
					<figcaption className="blockish-image-caption">
						{caption}
					</figcaption>
				)
			}
		</figure>
	);
}
