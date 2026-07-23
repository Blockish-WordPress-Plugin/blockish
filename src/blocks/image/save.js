import { useBlockProps } from '@wordpress/block-editor';
import clsx from 'clsx';

export default function Save({ attributes }) {
	const lightbox = !!attributes?.lightbox;
	const blockProps = useBlockProps.save({
		className: clsx('blockish-image-wrapper', {
			'has-lightbox': lightbox,
		}),
	});

	const displayURL =
		attributes?.image?.sizes?.[attributes?.imageSize?.value]?.url ||
		attributes?.image?.url;
	const fullURL =
		attributes?.image?.sizes?.full?.url ||
		attributes?.image?.url ||
		displayURL;
	const imageWidth =
		attributes?.image?.sizes?.[attributes?.imageSize?.value]?.width ||
		attributes?.image?.width ||
		'auto';
	const imageHeight =
		attributes?.image?.sizes?.[attributes?.imageSize?.value]?.height ||
		attributes?.image?.height ||
		'auto';
	const alt = attributes?.alt || attributes?.image?.alt || '';
	const title = attributes?.title || attributes?.image?.title || '';
	const caption =
		attributes?.captionType === 'custom'
			? attributes?.customCaption
			: attributes?.image?.caption;
	const showCaption = caption && attributes?.captionType !== 'none';

	const imageEl = attributes?.image?.url ? (
		<img
			width={imageWidth}
			height={imageHeight}
			alt={alt}
			title={title}
			className={clsx('blockish-image', {
				[`wp-image-${attributes?.image?.id}`]: !!attributes?.image?.id,
			})}
			src={displayURL}
		/>
	) : null;

	return (
		<figure {...blockProps}>
			{imageEl &&
				(lightbox ? (
					<a
						href={fullURL}
						className="blockish-image-lightbox-trigger"
						data-blockish-lightbox="true"
						data-lightbox-src={fullURL}
						data-lightbox-alt={alt}
						data-lightbox-caption={showCaption ? caption : ''}
						aria-label={alt || title || 'Open image'}
					>
						{imageEl}
					</a>
				) : (
					imageEl
				))}
			{showCaption && (
				<figcaption className="blockish-image-caption">{caption}</figcaption>
			)}
		</figure>
	);
}
