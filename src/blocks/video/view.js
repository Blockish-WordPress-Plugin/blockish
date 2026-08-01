const LAZY_SELECTOR = 'video.blockish-video[data-blockish-video-src]';
const LAZY_ROOT_MARGIN = '200px 0px';

const ensureAutoplay = ( iframe ) => {
	try {
		const url = new URL( iframe.src, window.location.origin );
		url.searchParams.set( 'autoplay', '1' );
		if ( ! url.searchParams.has( 'playsinline' ) ) {
			url.searchParams.set( 'playsinline', '1' );
		}
		iframe.src = url.toString();
	} catch {
		// no-op: keep existing source if URL parsing fails
	}
};

/**
 * Attaches the deferred source to a lazy self-hosted video. Safe to call more
 * than once — the data attribute is removed on the first pass.
 */
const hydrateLazyVideo = ( video ) => {
	if ( ! video ) {
		return;
	}

	const source = video.dataset.blockishVideoSrc;
	if ( ! source ) {
		return;
	}

	delete video.dataset.blockishVideoSrc;

	video.preload = video.dataset.blockishVideoPreload || 'metadata';
	delete video.dataset.blockishVideoPreload;

	// Setting src runs the media load algorithm on its own; calling load() here
	// would abort a play() started right after (the overlay click path).
	video.src = source;
};

const observeLazyVideos = () => {
	const videos = document.querySelectorAll( LAZY_SELECTOR );
	if ( ! videos.length ) {
		return;
	}

	if ( ! ( 'IntersectionObserver' in window ) ) {
		videos.forEach( hydrateLazyVideo );
		return;
	}

	const observer = new IntersectionObserver(
		( entries ) => {
			entries.forEach( ( entry ) => {
				if ( ! entry.isIntersecting ) {
					return;
				}

				observer.unobserve( entry.target );
				hydrateLazyVideo( entry.target );
			} );
		},
		{ rootMargin: LAZY_ROOT_MARGIN }
	);

	videos.forEach( ( video ) => observer.observe( video ) );
};

const hideOverlayAndPlay = ( overlay ) => {
	const player = overlay.closest( '.blockish-video-player' );
	if ( ! player ) {
		return;
	}

	overlay.classList.add( 'is-hidden' );

	const video = player.querySelector( 'video.blockish-video' );
	if ( video ) {
		hydrateLazyVideo( video );
		video.play()?.catch( () => {} );
		return;
	}

	const iframe = player.querySelector( 'iframe.blockish-video-iframe' );
	if ( iframe ) {
		ensureAutoplay( iframe );
	}
};

document.addEventListener( 'click', ( event ) => {
	const overlay = event.target.closest(
		'[data-blockish-video-overlay="true"]'
	);
	if ( ! overlay ) {
		return;
	}

	hideOverlayAndPlay( overlay );
} );

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', observeLazyVideos );
} else {
	observeLazyVideos();
}
