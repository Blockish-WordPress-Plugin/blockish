import { __ } from '@wordpress/i18n';

const CustomVideoPlayer = ( { attributes, videoRef } ) => {
	const media = attributes?.selfHostedVideo;
	const src = media?.url || attributes?.selfHostedUrl;
	const playOnMobile = attributes?.playOnMobile !== false;

	if ( ! src ) {
		return null;
	}

	return (
		<video
			ref={ videoRef }
			className="blockish-video"
			src={ src }
			controls={ attributes?.controls ?? true }
			autoPlay={ !! attributes?.autoplay }
			loop={ !! attributes?.loop }
			muted={ !! attributes?.muted }
			preload={ attributes?.preload || 'metadata' }
			playsInline={ playOnMobile }
			poster={
				attributes?.poster || attributes?.overlayImage?.url || undefined
			}
		>
			{ __( 'Your browser does not support the video tag.', 'blockish' ) }
		</video>
	);
};

export default CustomVideoPlayer;
