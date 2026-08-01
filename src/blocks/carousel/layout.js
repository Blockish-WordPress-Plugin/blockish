export function getCarouselLayoutClasses( attributes = {} ) {
	const arrowsPosition = attributes.arrowsPosition || 'inside';
	const dotsPosition = attributes.dotsPosition || 'below';
	const dotsAlign = attributes.dotsAlign || 'center';

	const dotsAlignClass =
		dotsAlign === 'flex-start' || dotsAlign === 'start'
			? 'is-dots-start'
			: dotsAlign === 'flex-end' || dotsAlign === 'end'
				? 'is-dots-end'
				: 'is-dots-center';

	return {
		[ `is-arrows-${ arrowsPosition }` ]: true,
		[ `is-dots-${ dotsPosition }` ]: true,
		[ dotsAlignClass ]: true,
	};
}

export function getCarouselCssVars( attributes = {}, perView ) {
	const gap = attributes.gap ?? 16;
	const transitionSpeed = attributes.transitionSpeed ?? 450;
	const slidesPerView = attributes.slidesPerView ?? 1;
	const slidesPerViewTablet = attributes.slidesPerViewTablet ?? 1;
	const slidesPerViewMobile = attributes.slidesPerViewMobile ?? 1;

	return {
		'--bc-per-view': String( perView ?? slidesPerView ),
		'--bc-per-view-tablet': slidesPerViewTablet,
		'--bc-per-view-mobile': slidesPerViewMobile,
		'--bc-gap': `${ gap }px`,
		'--bc-transition': `${ Math.max( 100, Number( transitionSpeed ) || 450 ) }ms`,
	};
}
