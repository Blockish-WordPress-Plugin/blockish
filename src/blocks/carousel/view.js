/**
 * Frontend carousel runtime for blockish/carousel.
 * Loop uses cloned slides so wrap-around animates forward/back — no rewind.
 */
( function () {
	const parseSettings = ( el ) => {
		try {
			return JSON.parse( el.getAttribute( 'data-blockish-carousel' ) || '{}' );
		} catch ( e ) {
			return {};
		}
	};

	const getPerView = ( settings ) => {
		const width = window.innerWidth;
		if ( width <= 781 ) {
			return Math.max( 1, Number( settings.slidesPerViewMobile ) || 1 );
		}
		if ( width <= 1024 ) {
			return Math.max( 1, Number( settings.slidesPerViewTablet ) || 1 );
		}
		return Math.max( 1, Number( settings.slidesPerView ) || 1 );
	};

	const initCarousel = ( root ) => {
		if ( root.dataset.blockishCarouselReady === '1' ) {
			return;
		}
		root.dataset.blockishCarouselReady = '1';

		const settings = parseSettings( root );
		const track = root.querySelector( '.blockish-carousel__track' );
		const prevBtn = root.querySelector( '.blockish-carousel__arrow.is-prev' );
		const nextBtn = root.querySelector( '.blockish-carousel__arrow.is-next' );
		const dotsWrap = root.querySelector( '.blockish-carousel__dots' );

		if ( ! track ) {
			return;
		}

		const getRealSlides = () =>
			Array.from( track.children ).filter(
				( el ) =>
					! el.classList.contains( 'is-clone' ) &&
					( el.classList.contains( 'blockish-carousel__slide' ) ||
						el.classList.contains( 'wp-block-blockish-carousel-slide' ) )
			);

		let realSlides = getRealSlides();
		if ( ! realSlides.length ) {
			return;
		}

		let timer = null;
		let animGuard = null;
		let perView = getPerView( settings );
		let cloneCount = 0;
		let physical = 0;
		let isAnimating = false;
		let loopEnabled = false;
		const transitionMs = Math.max( 100, Number( settings.transitionSpeed ) || 450 );

		const gapPx = () => Number( settings.gap ) || 0;

		const realCount = () => realSlides.length;

		const maxLogical = () => Math.max( 0, realCount() - perView );

		const canSlide = () => realCount() > perView;

		const logicalFromPhysical = () => {
			if ( ! loopEnabled || ! cloneCount ) {
				return physical;
			}
			let logical = physical - cloneCount;
			if ( logical < 0 ) {
				logical = realCount() + logical;
			}
			if ( logical >= realCount() ) {
				logical = logical - realCount();
			}
			return logical;
		};

		const clearClones = () => {
			Array.from( track.children )
				.filter( ( el ) => el.classList.contains( 'is-clone' ) )
				.forEach( ( el ) => el.remove() );
		};

		const setupClones = () => {
			const prevLogical = logicalFromPhysical();
			clearClones();
			realSlides = getRealSlides();
			loopEnabled = !! settings.loop && canSlide();
			cloneCount = loopEnabled ? perView : 0;

			if ( ! loopEnabled ) {
				physical = Math.min( prevLogical, maxLogical() );
				return;
			}

			const prefix = realSlides.slice( -cloneCount ).map( ( slide ) => {
				const clone = slide.cloneNode( true );
				clone.classList.add( 'is-clone' );
				clone.setAttribute( 'aria-hidden', 'true' );
				return clone;
			} );
			const suffix = realSlides.slice( 0, cloneCount ).map( ( slide ) => {
				const clone = slide.cloneNode( true );
				clone.classList.add( 'is-clone' );
				clone.setAttribute( 'aria-hidden', 'true' );
				return clone;
			} );

			prefix.forEach( ( clone ) => track.insertBefore( clone, track.firstChild ) );
			suffix.forEach( ( clone ) => track.appendChild( clone ) );

			const logical = Math.max(
				0,
				Math.min( realCount() - 1, prevLogical || 0 )
			);
			physical = cloneCount + logical;
		};

		const setTransform = ( withTransition ) => {
			if ( ! withTransition ) {
				track.classList.add( 'is-no-transition' );
			} else {
				track.classList.remove( 'is-no-transition' );
			}
			const g = gapPx();
			const n = Math.max( 1, perView );
			// % is relative to the track (width: 100% of viewport). Matches flex+gap step.
			track.style.transform = `translate3d(calc(-${ physical } * (100% + ${ g }px) / ${ n }), 0, 0)`;
			if ( ! withTransition ) {
				void track.offsetHeight;
				track.classList.remove( 'is-no-transition' );
			}
		};

		const updateDots = () => {
			if ( ! dotsWrap || ! settings.showDots ) {
				return;
			}
			const logical = logicalFromPhysical();
			const activeDot = loopEnabled
				? logical % Math.max( 1, realCount() )
				: Math.min( logical, maxLogical() );

			dotsWrap.querySelectorAll( '.blockish-carousel__dot' ).forEach( ( dot, i ) => {
				dot.classList.toggle( 'is-active', i === activeDot );
			} );
		};

		const updateControls = () => {
			if ( settings.loop || ! canSlide() ) {
				if ( prevBtn ) prevBtn.disabled = false;
				if ( nextBtn ) nextBtn.disabled = false;
				return;
			}
			if ( prevBtn ) prevBtn.disabled = physical <= 0;
			if ( nextBtn ) nextBtn.disabled = physical >= maxLogical();
		};

		const renderDots = () => {
			if ( ! dotsWrap || ! settings.showDots ) {
				return;
			}
			const count = loopEnabled
				? realCount()
				: maxLogical() + 1;
			dotsWrap.innerHTML = '';
			if ( count <= 1 || ! canSlide() ) {
				dotsWrap.hidden = true;
				return;
			}
			dotsWrap.hidden = false;
			const active = loopEnabled
				? logicalFromPhysical()
				: physical;
			for ( let i = 0; i < count; i++ ) {
				const btn = document.createElement( 'button' );
				btn.type = 'button';
				btn.className =
					'blockish-carousel__dot' + ( i === active ? ' is-active' : '' );
				btn.setAttribute( 'aria-label', `Go to slide ${ i + 1 }` );
				btn.addEventListener( 'click', () => goToLogical( i ) );
				dotsWrap.appendChild( btn );
			}
		};

		const applyPerViewCss = () => {
			perView = getPerView( settings );
			root.style.setProperty( '--bc-per-view', String( perView ) );
			root.style.setProperty( '--bc-gap', `${ gapPx() }px` );
		};

		/**
		 * Jump from clone zone back onto the matching real slide.
		 * Uses modulo so rapid multi-step overflow still lands on a real index.
		 */
		const snapIfNeeded = () => {
			if ( ! loopEnabled || ! cloneCount ) {
				return false;
			}
			const count = realCount();
			if ( count < 1 ) {
				return false;
			}
			const start = cloneCount;
			const end = cloneCount + count;

			if ( physical >= end ) {
				const overflow = ( physical - end ) % count;
				physical = start + overflow;
				setTransform( false );
				return true;
			}
			if ( physical < start ) {
				const underflow = ( start - physical ) % count;
				physical = underflow === 0 ? start : end - underflow;
				setTransform( false );
				return true;
			}
			return false;
		};

		const clearAnimGuard = () => {
			if ( animGuard ) {
				clearTimeout( animGuard );
				animGuard = null;
			}
		};

		const finishAnimation = () => {
			clearAnimGuard();
			isAnimating = false;
			snapIfNeeded();
			updateDots();
			updateControls();
		};

		const update = ( withTransition = true ) => {
			setTransform( withTransition );
			updateDots();
			updateControls();
		};

		const goToPhysical = ( next, withTransition = true ) => {
			if ( ! canSlide() ) {
				return;
			}
			// Spam-clicks interrupt CSS transitions so transitionend never fires —
			// lock until the current move finishes (or the safety timeout).
			if ( withTransition && isAnimating ) {
				return;
			}

			if ( loopEnabled && withTransition ) {
				snapIfNeeded();
			}

			if ( loopEnabled ) {
				physical = next;
			} else {
				physical = Math.max( 0, Math.min( maxLogical(), next ) );
			}

			if ( withTransition ) {
				isAnimating = true;
				clearAnimGuard();
				animGuard = setTimeout( finishAnimation, transitionMs + 80 );
			}

			update( withTransition );
			restartAutoplay();
		};

		const goToLogical = ( logical ) => {
			if ( ! canSlide() ) {
				return;
			}
			if ( loopEnabled ) {
				const target = cloneCount + ( ( logical % realCount() ) + realCount() ) % realCount();
				goToPhysical( target, true );
			} else {
				goToPhysical( Math.max( 0, Math.min( maxLogical(), logical ) ), true );
			}
		};

		const next = () => {
			if ( ! canSlide() ) return;
			if ( loopEnabled ) {
				goToPhysical( physical + 1, true );
			} else {
				goToPhysical( Math.min( maxLogical(), physical + 1 ), true );
			}
		};

		const prev = () => {
			if ( ! canSlide() ) return;
			if ( loopEnabled ) {
				goToPhysical( physical - 1, true );
			} else {
				goToPhysical( Math.max( 0, physical - 1 ), true );
			}
		};

		const stopAutoplay = () => {
			if ( timer ) {
				clearInterval( timer );
				timer = null;
			}
		};

		const startAutoplay = () => {
			stopAutoplay();
			if ( ! settings.autoplay || ! canSlide() ) {
				return;
			}
			timer = setInterval(
				next,
				Math.max( 1500, Number( settings.autoplaySpeed ) || 4000 )
			);
		};

		const restartAutoplay = () => {
			stopAutoplay();
			startAutoplay();
		};

		const onTrackTransitionEnd = ( event ) => {
			if ( event.target !== track || event.propertyName !== 'transform' ) {
				return;
			}
			finishAnimation();
		};

		track.addEventListener( 'transitionend', onTrackTransitionEnd );
		track.addEventListener( 'transitioncancel', onTrackTransitionEnd );

		prevBtn?.addEventListener( 'click', prev );
		nextBtn?.addEventListener( 'click', next );

		if ( settings.pauseOnHover && settings.autoplay ) {
			root.addEventListener( 'mouseenter', stopAutoplay );
			root.addEventListener( 'mouseleave', startAutoplay );
			root.addEventListener( 'focusin', stopAutoplay );
			root.addEventListener( 'focusout', startAutoplay );
		}

		let touchStartX = 0;
		track.addEventListener(
			'touchstart',
			( e ) => {
				touchStartX = e.changedTouches[ 0 ]?.clientX || 0;
			},
			{ passive: true }
		);
		track.addEventListener(
			'touchend',
			( e ) => {
				const endX = e.changedTouches[ 0 ]?.clientX || 0;
				const delta = endX - touchStartX;
				if ( Math.abs( delta ) < 40 ) return;
				if ( delta < 0 ) next();
				else prev();
			},
			{ passive: true }
		);

		const rebuild = () => {
			clearAnimGuard();
			isAnimating = false;
			applyPerViewCss();
			setupClones();
			renderDots();
			update( false );
		};

		window.addEventListener( 'resize', rebuild );

		rebuild();
		startAutoplay();
	};

	const boot = () => {
		document
			.querySelectorAll( '.blockish-carousel[data-blockish-carousel]' )
			.forEach( initCarousel );
	};

	if ( document.readyState === 'loading' ) {
		document.addEventListener( 'DOMContentLoaded', boot );
	} else {
		boot();
	}
} )();
