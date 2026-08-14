import { __ } from '@wordpress/i18n';
import { getPosterUrl } from './utils';

const CustomVideoPlayer = ( { attributes, videoRef } ) => {
	const media = attributes?.selfHostedVideo;
	const src = media?.url || attributes?.selfHostedUrl;
	const playOnMobile = attributes?.playOnMobile !== false;
	const posterUrl = getPosterUrl( attributes );

	if ( ! src ) {
		return null;
	}

	return (
		<video
			key={ `${ src }|${ posterUrl || '' }` }
			ref={ videoRef }
			className="blockish-video"
			src={ src }
			controls={ attributes?.controls ?? true }
			autoPlay={ !! attributes?.autoplay }
			loop={ !! attributes?.loop }
			muted={ !! attributes?.muted }
			preload={ attributes?.preload || 'metadata' }
			playsInline={ playOnMobile }
			poster={ posterUrl }
		>
			{ __( 'Your browser does not support the video tag.', 'blockish' ) }
		</video>
	);
};

export default CustomVideoPlayer;
