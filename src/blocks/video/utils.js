const sourceOptions = [
	{
		label: 'YouTube',
		value: 'youtube',
	},
	{
		label: 'Vimeo',
		value: 'vimeo',
	},
	{
		label: 'Self-hosted',
		value: 'selfHosted',
	},
];

const suggestedVideosOptions = [
	{
		label: 'Current Channel',
		value: 'currentChannel',
	},
	{
		label: 'Any Video',
		value: 'anyVideo',
	},
];

const normalizeSuggestedVideosOption = ( value ) => {
	if ( value && typeof value === 'object' && value?.value ) {
		return value;
	}

	// Backward compatibility with old boolean toggle values.
	if ( value === true ) {
		return suggestedVideosOptions[ 1 ];
	}

	return suggestedVideosOptions[ 0 ];
};

const isAnyVideoSuggestion = ( value ) =>
	normalizeSuggestedVideosOption( value )?.value === 'anyVideo';

const escapeAttribute = ( value = '' ) => {
	return String( value )
		.replaceAll( '&', '&amp;' )
		.replaceAll( '"', '&quot;' )
		.replaceAll( "'", '&#39;' )
		.replaceAll( '<', '&lt;' )
		.replaceAll( '>', '&gt;' );
};

function detectProvider( url ) {
	if ( url.includes( 'youtube' ) || url.includes( 'youtu.be' ) ) {
		return 'youtube';
	}
	if ( url.includes( 'vimeo' ) ) {
		return 'vimeo';
	}
	return null;
}

function extractVideoId( url, provider ) {
	try {
		const parsed = new URL( url );

		if ( provider === 'youtube' ) {
			if ( parsed.hostname.includes( 'youtu.be' ) ) {
				return parsed.pathname.slice( 1 );
			}
			if ( parsed.searchParams.get( 'v' ) ) {
				return parsed.searchParams.get( 'v' );
			}
			if ( parsed.pathname.includes( '/embed/' ) ) {
				return parsed.pathname.split( '/embed/' )[ 1 ];
			}
		}

		if ( provider === 'vimeo' ) {
			return parsed.pathname.split( '/' ).filter( Boolean )[ 0 ];
		}

		return null;
	} catch {
		return null;
	}
}

function getBaseEmbedUrl( provider, id, options = {} ) {
	switch ( provider ) {
		case 'youtube':
			return options?.privacyMode
				? `https://www.youtube-nocookie.com/embed/${ id }`
				: `https://www.youtube.com/embed/${ id }`;
		case 'vimeo':
			return `https://player.vimeo.com/video/${ id }`;
		default:
			return null;
	}
}

const getVideoEmbedUrl = ( inputUrl, options = {} ) => {
	if ( ! inputUrl ) {
		return null;
	}

	const provider = detectProvider( inputUrl );
	if ( ! provider ) {
		return null;
	}

	const videoId = extractVideoId( inputUrl, provider );
	if ( ! videoId ) {
		return null;
	}

	const baseUrl = getBaseEmbedUrl( provider, videoId, options );
	const url = new URL( baseUrl );

	if ( provider === 'youtube' ) {
		const youtubeParams = {
			start: options?.start || 0,
			end: options?.end || undefined,
			autoplay: options?.autoplay ? 1 : 0,
			mute: options?.mute ? 1 : 0,
			loop: options?.loop ? 1 : 0,
			controls: options?.controls ? 1 : 0,
			playsinline: options?.playsInline ? 1 : 0,
			cc_load_policy: options?.captions ? 1 : 0,
			rel: options?.suggestedVideos ? 1 : 0,
		};

		Object.entries( youtubeParams ).forEach( ( [ key, value ] ) => {
			if ( value === undefined || value === null ) {
				return;
			}
			url.searchParams.set( key, value );
		} );
	}

	if ( provider === 'vimeo' ) {
		const vimeoParams = {
			autoplay: options?.autoplay ? 1 : 0,
			muted: options?.mute ? 1 : 0,
			loop: options?.loop ? 1 : 0,
			controls: options?.controls ? 1 : 0,
			playsinline: options?.playsInline ? 1 : 0,
			dnt: options?.privacyMode ? 1 : 0,
		};

		Object.entries( vimeoParams ).forEach( ( [ key, value ] ) => {
			url.searchParams.set( key, value );
		} );
	}

	// Provider-specific adjustments
	if ( provider === 'youtube' && options.loop ) {
		url.searchParams.set( 'playlist', videoId );
	}

	return url.toString();
};

export {
	sourceOptions,
	suggestedVideosOptions,
	normalizeSuggestedVideosOption,
	isAnyVideoSuggestion,
	escapeAttribute,
	getVideoEmbedUrl,
};
