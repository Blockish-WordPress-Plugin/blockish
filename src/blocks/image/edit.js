import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';
import { useState } from '@wordpress/element';
import {
	BlockIcon,
	useBlockProps,
	MediaPlaceholder,
	BlockControls,
} from '@wordpress/block-editor';
import { ToolbarGroup, ToolbarButton } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import { store as noticesStore } from '@wordpress/notices';
import { image as icon, upload } from '@wordpress/icons';
import clsx from 'clsx';
import './editor.scss';
import Inspector from './inspector';

export default function Edit({ attributes, setAttributes, advancedControls, isSelected }) {
	const { BlockishImagePlaceholder } = window.blockish.components;
	const [ isUploading, setIsUploading ] = useState( false );
	const blockProps = useBlockProps({
		className: 'blockish-image-wrapper',
	});

	const { createErrorNotice } = useDispatch( noticesStore );

	function onSelectImage(media) {
		if(!media?.url || !media?.id){
			setAttributes({
				image: undefined,
			})

			return;
		}
		
		setAttributes({
			image: media,
		})
	}

	async function uploadExternalImage( url ) {
		setIsUploading( true );
		try {
			const response = await fetch( url );
			const blob = await response.blob();
			const filename = url.split('/').pop() || 'image.jpg';
			const file = new File( [ blob ], filename, { type: blob.type } );

			const formData = new FormData();
			formData.append( 'file', file );

			const media = await apiFetch( {
				path: '/wp/v2/media',
				method: 'POST',
				body: formData,
			} );

			if (media?.id) {
				const compatiableSizes = {};

				for (const key in media?.media_details?.sizes) {
					const value = media?.media_details?.sizes[key];
					compatiableSizes[key] = {
						...value,
						url: value?.source_url,
					}
				}

				setAttributes({
					image: {
						id: media?.id,
						url: media?.source_url,
						width: media?.media_details?.width,
						height: media?.media_details?.height,
						sizes: compatiableSizes,
						type: media?.media_type,
					}
				});
			}else{
				setAttributes({
					image: {
						url: media.url,
					}
				})
			}
		} catch ( error ) {
			console.error( error );
			createErrorNotice( error.message || __( 'Error uploading image', 'blockish' ), { type: 'snackbar' } );
		} finally {
			setIsUploading( false );
		}
	}

	function onSelectURL( newURL ) {
		if ( newURL !== attributes?.image?.url ) {
			setAttributes( {
				image: {
					url: newURL,
				}
			} );

			return;
		}

		setAttributes({
			image: undefined
		})
	}

	function onUploadError( message ) {
		createErrorNotice( message, { type: 'snackbar' } );
		setAttributes({
			image: undefined
		})
	}

	const placeholder = (content) => {
		return <BlockishImagePlaceholder content={content}/>
	}
	const imageURL = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.url || attributes?.image?.url;
	const imageWidth = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.width || attributes?.image?.width || 'auto';
	const imageHeight = attributes?.image?.sizes?.[attributes?.imageSize?.value]?.height || attributes?.image?.height || 'auto';
	const caption = attributes?.captionType === 'custom' ? attributes?.customCaption : attributes?.image?.caption;

	return (
		<>
			{ attributes?.image?.url && !attributes?.image?.id && (
				<BlockControls>
					<ToolbarGroup>
						<ToolbarButton
							icon={ upload }
							label={ __( 'Upload to Media Library', 'blockish' ) }
							onClick={ () => uploadExternalImage( attributes.image.url ) }
							disabled={ isUploading }
						/>
					</ToolbarGroup>
				</BlockControls>
			) }
			
			{
				attributes?.image?.url && (
					<Inspector attributes={attributes} setAttributes={setAttributes} advancedControls={advancedControls} />
				)
			}
			<figure {...blockProps}>
				<MediaPlaceholder
					accept='image/*'
					icon={<BlockIcon icon={icon} />}
					onSelect={onSelectImage}
					onSelectURL={onSelectURL}
					onError={onUploadError}
					placeholder={!isSelected ? placeholder : null}
					allowedTypes={[ 'image' ]}
					handleUpload={(files) => files.length === 1}
					value={{ id: attributes?.image?.id, url: attributes?.image?.url }}
					disableMediaButtons={!!attributes?.image?.url}
				/>
				{
					attributes?.image?.url && (
						<img
							width={imageWidth}
							height={imageHeight}
							alt={ attributes?.alt || attributes?.image?.alt }
							title={ attributes?.title || attributes?.image?.title }
							className={ 
								clsx( 
									'blockish-image',
									{
										[`wp-image-${attributes?.image?.id}`]: !!attributes?.image?.id,
									}
								)
							}
							src={ imageURL }
						/>
					)
				}
				{
					caption && attributes?.captionType !== 'none' && (
						<figcaption className="blockish-image-caption">
							{ caption }
						</figcaption>
					)
				}
			</figure>
		</>
	)
}
