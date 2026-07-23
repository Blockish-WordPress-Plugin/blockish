import {
	BlockControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	useBlockProps,
} from '@wordpress/block-editor';
import { isBlobURL } from '@wordpress/blob';
import { Button, Placeholder, Spinner } from '@wordpress/components';
import { store as coreStore, useEntityProp } from '@wordpress/core-data';
import { useDispatch, useSelect } from '@wordpress/data';
import { useEffect, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { upload } from '@wordpress/icons';
import { store as noticesStore } from '@wordpress/notices';
import Inspector from './inspector';
import './editor.scss';

const ALLOWED_MEDIA_TYPES = [ 'image' ];

export default function Edit( props ) {
	const { attributes, context, setAttributes } = props;
	const { imageSize, linkToPost, openInNewTab } = attributes;
	const postId = context.postId;
	const postType = context.postType || 'post';
	const canUpload = !! postId;

	const [ temporaryURL, setTemporaryURL ] = useState();
	const [ featuredImageId, setFeaturedImage ] = useEntityProp(
		'postType',
		postType,
		'featured_media',
		postId
	);
	const media = useSelect(
		( select ) =>
			featuredImageId
				? select( coreStore ).getMedia( featuredImageId )
				: null,
		[ featuredImageId ]
	);
	const [ link ] = useEntityProp( 'postType', postType, 'link', postId );
	const { createErrorNotice } = useDispatch( noticesStore );

	const sizeSlug = imageSize?.value || 'full';
	const mediaUrl =
		media?.media_details?.sizes?.[ sizeSlug ]?.source_url ||
		media?.source_url;
	const hasImage = !!( temporaryURL || mediaUrl );
	const blockProps = useBlockProps( {
		className: `blockish-post-featured-image${
			temporaryURL ? ' is-transient' : ''
		}`,
	} );

	useEffect( () => {
		if ( mediaUrl && temporaryURL ) {
			setTemporaryURL();
		}
	}, [ mediaUrl, temporaryURL ] );

	const onSelectImage = ( value ) => {
		if ( value?.id ) {
			setFeaturedImage( value.id );
		}

		if ( value?.url && isBlobURL( value.url ) ) {
			setTemporaryURL( value.url );
		}
	};

	const onResetImage = () => {
		setAttributes( {
			linkToPost: false,
			openInNewTab: false,
			imageSize: {
				value: 'full',
				label: __( 'Full Size', 'blockish' ),
			},
		} );
		setFeaturedImage( 0 );
	};

	const onUploadError = ( message ) => {
		createErrorNotice( message, { type: 'snackbar' } );
		setTemporaryURL();
	};

	const placeholder = ( content ) => (
		<Placeholder
			className="block-editor-media-placeholder"
			withIllustration
		>
			{ content }
		</Placeholder>
	);

	const label = __( 'Add a featured image', 'blockish' );
	let image;

	if ( ! postId ) {
		image = placeholder();
	} else if ( ! featuredImageId && ! temporaryURL ) {
		image = (
			<MediaPlaceholder
				onSelect={ onSelectImage }
				accept="image/*"
				allowedTypes={ ALLOWED_MEDIA_TYPES }
				onError={ onUploadError }
				placeholder={ placeholder }
				mediaLibraryButton={ ( { open } ) => (
					<Button
						__next40pxDefaultSize
						icon={ upload }
						variant="primary"
						label={ label }
						showTooltip
						tooltipPosition="top center"
						onClick={ open }
					/>
				) }
			/>
		);
	} else if ( ! media && ! temporaryURL ) {
		image = placeholder();
	} else {
		image = (
			<>
				<img
					className="blockish-post-featured-image__image"
					src={ temporaryURL || mediaUrl }
					alt={
						media?.alt_text
							? media.alt_text
							: __( 'Featured image', 'blockish' )
					}
				/>
				{ temporaryURL && <Spinner /> }
			</>
		);
	}

	const content =
		hasImage && linkToPost ? (
			<a
				href={ link }
				target={ openInNewTab ? '_blank' : undefined }
				rel={ openInNewTab ? 'noreferrer noopener' : undefined }
				onClick={ ( event ) => event.preventDefault() }
			>
				{ image }
			</a>
		) : (
			image
		);

	return (
		<>
			{ ! temporaryURL && <Inspector { ...props } /> }
			{ !! media && canUpload && (
				<BlockControls group="other">
					<MediaReplaceFlow
						mediaId={ featuredImageId }
						mediaURL={ mediaUrl }
						allowedTypes={ ALLOWED_MEDIA_TYPES }
						accept="image/*"
						onSelect={ onSelectImage }
						onError={ onUploadError }
						onReset={ onResetImage }
					/>
				</BlockControls>
			) }
			<figure { ...blockProps }>{ content }</figure>
		</>
	);
}
