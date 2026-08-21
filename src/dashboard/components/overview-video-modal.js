import { __ } from '@wordpress/i18n';
import { Modal } from '@wordpress/components';

/**
 * Parse a bare YouTube id or URL into an embed id.
 *
 * @param {string} raw
 * @return {string}
 */
export function parseYouTubeId( raw ) {
	if ( ! raw || typeof raw !== 'string' ) {
		return '';
	}

	const value = raw.trim();
	if ( ! value ) {
		return '';
	}

	if ( /^[\w-]{6,}$/.test( value ) && ! value.includes( '/' ) ) {
		return value;
	}

	try {
		const parsed = new URL( value );
		if ( parsed.hostname.includes( 'youtu.be' ) ) {
			return parsed.pathname.replace( /^\//, '' ).split( '/' )[ 0 ] || '';
		}
		if ( parsed.searchParams.get( 'v' ) ) {
			return parsed.searchParams.get( 'v' ) || '';
		}
		const embed = parsed.pathname.split( '/embed/' )[ 1 ];
		if ( embed ) {
			return embed.split( '/' )[ 0 ] || '';
		}
	} catch ( e ) {
		return '';
	}

	return '';
}

/**
 * @param {'overviewVideo'|'connectVideo'} key
 * @return {string}
 */
export function getDashboardVideoId( key ) {
	const links = window.blockishDashboardData?.plugin?.links || {};
	return parseYouTubeId( links?.[ key ] || '' );
}

export function getOverviewVideoId() {
	return getDashboardVideoId( 'overviewVideo' );
}

export function getConnectVideoId() {
	return getDashboardVideoId( 'connectVideo' );
}

/**
 * Shared YouTube modal for dashboard videos.
 *
 * @param {{
 *   isOpen: boolean,
 *   onClose: () => void,
 *   videoId?: string,
 *   title?: string,
 *   iframeTitle?: string,
 * }} props
 */
export default function OverviewVideoModal( {
	isOpen,
	onClose,
	videoId: videoIdProp,
	title,
	iframeTitle,
} ) {
	const videoId = videoIdProp || getOverviewVideoId();

	if ( ! isOpen || ! videoId ) {
		return null;
	}

	const embedSrc = `https://www.youtube-nocookie.com/embed/${ encodeURIComponent(
		videoId
	) }?rel=0&modestbranding=1`;

	return (
		<Modal
			title={ title || __( 'Quick overview', 'blockish' ) }
			onRequestClose={ onClose }
			className="blockish-overview-video-modal"
		>
			<div className="blockish-overview-video-modal__frame">
				<iframe
					src={ embedSrc }
					title={
						iframeTitle || __( 'Blockish quick overview', 'blockish' )
					}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
					allowFullScreen
					loading="lazy"
				/>
			</div>
		</Modal>
	);
}
