import EmbeddedYoutubeVideo from './embed-youtube';
import {
	escapeAttribute,
	getVideoEmbedUrl,
	isAnyVideoSuggestion,
} from './utils';

const EmbededVideo = ( { attributes, forceAutoplay = false } ) => {
	const sourceType = attributes?.sourceType?.value || 'youtube';
	const playOnMobile = attributes?.playOnMobile !== false;
	let controlsEnabled = 1;
	if ( sourceType !== 'vimeo' ) {
		controlsEnabled = attributes?.controls ? 1 : 0;
	}
	let url;
	switch ( sourceType ) {
		case 'youtube':
			url = attributes?.youtubeUrl;
			break;
		case 'vimeo':
			url = attributes?.vimeoUrl;
			break;
		default:
			url = attributes?.youtubeUrl;
	}

	const mediaUrl = getVideoEmbedUrl( url, {
		start: attributes?.startTime || 0,
		end: attributes?.endTime || 0,
		autoplay: forceAutoplay || attributes?.autoplay ? 1 : 0,
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

	let component = null;
	if ( sourceType === 'youtube' ) {
		component = (
			<EmbeddedYoutubeVideo
				mediaUrl={ mediaUrl }
				lazyLoad={ attributes?.lazyLoad }
			/>
		);
	} else if ( sourceType === 'vimeo' ) {
		component = (
			<iframe
				className="blockish-video blockish-video-iframe"
				title="Embedded Vimeo player"
				src={ escapeAttribute( mediaUrl ) }
				allow="autoplay; fullscreen; picture-in-picture"
				allowFullScreen
				loading={ attributes?.lazyLoad ? 'lazy' : undefined }
			/>
		);
	}
	return component;
};
export default EmbededVideo;
