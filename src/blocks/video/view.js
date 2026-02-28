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

const hideOverlayAndPlay = ( overlay ) => {
	const player = overlay.closest( '.blockish-video-player' );
	if ( ! player ) {
		return;
	}

	overlay.classList.add( 'is-hidden' );

	const video = player.querySelector( 'video.blockish-video' );
	if ( video ) {
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
