import { __ } from '@wordpress/i18n';
import {
	useBlockProps,
	MediaPlaceholder,
	MediaReplaceFlow,
	BlockControls,
} from '@wordpress/block-editor';
import { useEffect, useRef, useState } from '@wordpress/element';
import { ToolbarGroup, Notice } from '@wordpress/components';
import './editor.scss';
import Inspector from './inspector';
import EmbededVideo from './embed-video';
import CustomVideoPlayer from './custom-video-player';

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
} ) {
	const blockProps = useBlockProps( {
		className: 'blockish-video-wrapper',
	} );
	const sourceType = attributes?.sourceType?.value;
	const isSelfHosted = sourceType === 'selfHosted';
	const videoRef = useRef( null );
	const [ forceEmbedAutoplay, setForceEmbedAutoplay ] = useState( false );
	const [ overlayDismissed, setOverlayDismissed ] = useState( false );

	function onSelectVideo( media ) {
		if ( ! media?.url ) {
			setAttributes( {
				selfHostedVideo: undefined,
				selfHostedUrl: '',
			} );
			return;
		}

		setAttributes( {
			selfHostedVideo: media,
			selfHostedUrl: media.url,
			poster: attributes?.poster || media?.image?.src || '',
		} );
	}

	function onSelectURL( newURL ) {
		if ( newURL !== attributes?.selfHostedUrl ) {
			setAttributes( {
				selfHostedUrl: newURL,
			} );
			return;
		}

		setAttributes( {
			selfHostedVideo: undefined,
			selfHostedUrl: '',
		} );
	}

	useEffect( () => {
		setOverlayDismissed( false );
		setForceEmbedAutoplay( false );
	}, [
		sourceType,
		attributes?.selfHostedVideo?.url,
		attributes?.selfHostedUrl,
		attributes?.youtubeUrl,
		attributes?.vimeoUrl,
		attributes?.overlayImage?.url,
	] );

	const shouldShowOverlay =
		!! attributes?.showOverlay &&
		!! attributes?.overlayImage?.url &&
		! attributes?.autoplay &&
		! overlayDismissed;

	function handleOverlayClick() {
		setOverlayDismissed( true );

		if ( isSelfHosted && videoRef.current ) {
			videoRef.current.play()?.catch( () => {} );
			return;
		}

		setForceEmbedAutoplay( true );
	}

	function renderOverlay() {
		if ( ! shouldShowOverlay ) {
			return null;
		}

		return (
			<button
				type="button"
				className="blockish-video-overlay"
				style={ {
					backgroundImage: `url(${ attributes.overlayImage.url })`,
				} }
				onClick={ handleOverlayClick }
				aria-label={ __( 'Play video', 'blockish' ) }
			>
				{ attributes?.showOverlayPlayIcon && (
					<span
						className="blockish-video-overlay-play-icon"
						aria-hidden="true"
					/>
				) }
			</button>
		);
	}

	return (
		<>
			{ isSelfHosted && attributes?.selfHostedVideo?.url && (
				<BlockControls>
					<ToolbarGroup>
						<MediaReplaceFlow
							mediaId={ attributes?.selfHostedVideo?.id }
							mediaURL={ attributes?.selfHostedVideo?.url }
							allowedTypes={ [ 'video' ] }
							accept="video/*"
							onSelect={ onSelectVideo }
							name={ __( 'Replace video', 'blockish' ) }
						/>
					</ToolbarGroup>
				</BlockControls>
			) }

			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
			/>

			<figure { ...blockProps }>
				{ isSelfHosted &&
					! attributes?.selfHostedVideo?.url &&
					! attributes?.selfHostedUrl && (
						<MediaPlaceholder
							accept="video/*"
							icon={ 'format-video' }
							onSelect={ onSelectVideo }
							onSelectURL={ onSelectURL }
							allowedTypes={ [ 'video' ] }
							handleUpload={ ( files ) => files.length === 1 }
							value={ {
								id: attributes?.selfHostedVideo?.id,
								url:
									attributes?.selfHostedVideo?.url ||
									attributes?.selfHostedUrl,
							} }
							disableMediaButtons={
								!! attributes?.selfHostedVideo?.url
							}
							labels={ {
								title: __( 'Video', 'blockish' ),
								instructions: __(
									'Upload a self-hosted video or paste a direct file URL.',
									'blockish'
								),
							} }
						/>
					) }

				<div
					className={ `blockish-video-player${
						attributes?.videoAspectRatio?.value === 'auto'
							? ' is-aspect-auto'
							: ''
					}` }
				>
					{ sourceType !== 'selfHosted' ? (
						<EmbededVideo
							attributes={ attributes }
							forceAutoplay={ forceEmbedAutoplay }
						/>
					) : (
						<CustomVideoPlayer
							attributes={ attributes }
							videoRef={ videoRef }
						/>
					) }
					{ renderOverlay() }
				</div>
				{ sourceType !== 'selfHosted' &&
					! attributes?.[ `${ sourceType }Url` ] && (
						<Notice status="warning" isDismissible={ false }>
							{ __(
								'Please add a valid video URL.',
								'blockish'
							) }
						</Notice>
					) }
			</figure>
		</>
	);
}
