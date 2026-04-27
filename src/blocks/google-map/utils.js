const getGoogleMapsEmbedUrl = ( location, zoom ) => {
	const safeLocation = location?.trim() || 'New York, NY';
	const parsedZoom = Number.parseInt( zoom, 10 );
	const safeZoom = Number.isNaN( parsedZoom )
		? 14
		: Math.min( 21, Math.max( 0, parsedZoom ) );

	// Use iwloc=near for better default marker behavior on searched locations.
	return `https://maps.google.com/maps?hl=en&q=${ encodeURIComponent(
		safeLocation
	) }&z=${ safeZoom }&t=m&iwloc=near&output=embed`;
};

export { getGoogleMapsEmbedUrl };
