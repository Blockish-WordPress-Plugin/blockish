import { useBlockProps, useInnerBlocksProps } from '@wordpress/block-editor';
import clsx from 'clsx';
import { getCarouselCssVars, getCarouselLayoutClasses } from './layout';

export default function Save( { attributes } ) {
	const {
		slidesPerView = 1,
		slidesPerViewTablet = 1,
		slidesPerViewMobile = 1,
		gap = 16,
		showArrows = true,
		showDots = true,
		autoplay = false,
		autoplaySpeed = 4000,
		loop = true,
		pauseOnHover = true,
		transitionSpeed = 450,
	} = attributes;

	const settings = {
		slidesPerView,
		slidesPerViewTablet,
		slidesPerViewMobile,
		gap,
		showArrows,
		showDots,
		autoplay,
		autoplaySpeed,
		loop,
		pauseOnHover,
		transitionSpeed,
	};

	const blockProps = useBlockProps.save( {
		className: clsx(
			'blockish-carousel',
			getCarouselLayoutClasses( attributes )
		),
		style: getCarouselCssVars( attributes ),
		'data-blockish-carousel': JSON.stringify( settings ),
	} );

	const trackProps = useInnerBlocksProps.save( {
		className: 'blockish-carousel__track',
	} );

	return (
		<div { ...blockProps }>
			<div className="blockish-carousel__viewport">
				<div { ...trackProps } />
			</div>
			{ showArrows && (
				<>
					<button
						type="button"
						className="blockish-carousel__arrow is-prev"
						aria-label="Previous slide"
					>
						‹
					</button>
					<button
						type="button"
						className="blockish-carousel__arrow is-next"
						aria-label="Next slide"
					>
						›
					</button>
				</>
			) }
			{ showDots && (
				<div className="blockish-carousel__dots" role="tablist" />
			) }
		</div>
	);
}
