const getBackgroundVideo = (background) => {
	if (!background) {
		return null;
	}

	let parsedBackground = background;

	if (typeof background === 'string') {
		try {
			parsedBackground = JSON.parse(background);
		} catch {
			return null;
		}
	}

	if (parsedBackground?.backgroundType !== 'video') {
		return null;
	}

	return parsedBackground?.backgroundVideo?.url ? parsedBackground.backgroundVideo : null;
};

export default getBackgroundVideo;
