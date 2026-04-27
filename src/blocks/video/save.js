import { useBlockProps } from '@wordpress/block-editor';
import { getVideoEmbedUrl, isAnyVideoSuggestion } from './utils';

export default function Save( { attributes } ) {
	const blockProps = useBlockProps.save( {
		className: 'blockish-video-wrapper',
	} );
	const sourceType = attributes?.sourceType?.value || 'youtube';
	const isSelfHosted = sourceType === 'selfHosted';
	const playOnMobile = attributes?.playOnMobile !== false;
	let controlsEnabled = 1;
	if ( sourceType !== 'vimeo' ) {
		controlsEnabled = attributes?.controls ? 1 : 0;
	}

	let embedSourceUrl = attributes?.youtubeUrl;
	if ( sourceType === 'vimeo' ) {
		embedSourceUrl = attributes?.vimeoUrl;
	}

	const embedUrl = getVideoEmbedUrl( embedSourceUrl, {
		start: attributes?.startTime || 0,
		end: attributes?.endTime || 0,
		autoplay: attributes?.autoplay ? 1 : 0,
		mute: attributes?.muted ? 1 : 0,
		loop: attributes?.loop ? 1 : 0,
		controls: controlsEnabled,
		privacyMode: attributes?.privacyMode ? 1 : 0,
		playsInline: playOnMobile ? 1 : 0,
		captions: attributes?.captions ? 1 : 0,
		suggestedVideos: isAnyVideoSuggestion( attributes?.suggestedVideos )
			? 1
			: 0,
	} );

	const selfHostedUrl =
		attributes?.selfHostedVideo?.url || attributes?.selfHostedUrl;
	const overlayImageUrl = attributes?.overlayImage?.url;
	const shouldShowOverlay =
		!! attributes?.showOverlay &&
		!! overlayImageUrl &&
		! attributes?.autoplay;

	function renderOverlay() {
		if ( ! shouldShowOverlay ) {
			return null;
		}

		return (
			<button
				type="button"
				className="blockish-video-overlay"
				style={ { backgroundImage: `url(${ overlayImageUrl })` } }
				aria-label="Play video"
				data-blockish-video-overlay="true"
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
		<figure { ...blockProps }>
			<div
				className={ `blockish-video-player${
					attributes?.videoAspectRatio?.value === 'auto'
						? ' is-aspect-auto'
						: ''
				}` }
			>
				{ isSelfHosted
					? selfHostedUrl && (
							<video
								className="blockish-video"
								src={ selfHostedUrl }
								controls={ attributes?.controls ?? true }
								autoPlay={ !! attributes?.autoplay }
								loop={ !! attributes?.loop }
								muted={ !! attributes?.muted }
								preload={ attributes?.preload || 'metadata' }
								playsInline={ playOnMobile }
								poster={
									attributes?.poster ||
									overlayImageUrl ||
									undefined
								}
							/>
					  )
					: embedUrl && (
							<iframe
								className="blockish-video blockish-video-iframe"
								src={ embedUrl }
								title="Embedded video"
								allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
								allowFullScreen
								loading={
									attributes?.lazyLoad ? 'lazy' : undefined
								}
								referrerPolicy={
									attributes?.privacyMode
										? 'strict-origin-when-cross-origin'
										: undefined
								}
							/>
					  ) }
				{ renderOverlay() }
			</div>
		</figure>
	);
}
