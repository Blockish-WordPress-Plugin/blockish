import { __ } from '@wordpress/i18n';
import { SandBox } from '@wordpress/components';
import { escapeAttribute } from './utils';

export default function EmbeddedYoutubeVideo( { mediaUrl, lazyLoad } ) {
	if ( ! mediaUrl ) {
		return null;
	}
	return (
		<SandBox
			className="blockish-video-sandbox"
			html={ `
				<iframe
					style="width: 100%; height: 100%; z-index: 999999; border: 0;"
					class="blockish-video blockish-video-iframe"
					title="${ __( 'Embedded YouTube player', 'blockish' ) }"
					src="${ escapeAttribute( mediaUrl ) }"
					loading="${ lazyLoad ? 'lazy' : 'eager' }"
					allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
					sandbox="allow-scripts allow-same-origin allow-presentation allow-popups"
					allowfullscreen
				></iframe>
			` }
			styles={ [
				'body { height: 100%; }',
				'body > div { height: 100%; overflow: hidden; }',
			] }
			type="embed"
		/>
	);
}
