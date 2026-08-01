import {
	useBlockProps,
	useInnerBlocksProps,
	store as blockEditorStore,
} from '@wordpress/block-editor';
import { useDispatch, useSelect } from '@wordpress/data';
import { createBlock } from '@wordpress/blocks';
import { Button } from '@wordpress/components';
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import Inspector from './inspector';
import { getDefaultSlideAttrs } from '../carousel-slide/defaults';
import { getCarouselCssVars, getCarouselLayoutClasses } from './layout';
import './editor.scss';

const ALLOWED_BLOCKS = [ 'blockish/carousel-slide' ];

const SLIDE_COPY = [
	{
		title: 'Craft something beautiful',
		text: 'A short line that supports the headline. Swap the background, then add a button when you’re ready.',
		button: 'Get started',
	},
	{
		title: 'Designed for real layouts',
		text: 'Heroes, testimonials, or logo strips — each slide stays limited and easy to style.',
		button: 'Learn more',
	},
	{
		title: 'Ship faster with Blockish',
		text: 'Start from a polished default, then tune colors, type, and motion to match your brand.',
		button: 'Explore',
	},
];

const TEMPLATE = SLIDE_COPY.map( ( copy, index ) => [
	'blockish/carousel-slide',
	getDefaultSlideAttrs( index ),
	[
		[
			'blockish/heading',
			{
				content: copy.title,
				tag: { label: 'H2', value: 'h2' },
				color: '#f8fafc',
				alignment: { Desktop: 'center' },
				typography:
					'{"fontWeight":"700","fontSize":{"Desktop":"2rem","Tablet":"1.75rem","Mobile":"1.5rem"},"lineHeight":{"Desktop":"1.2"}}',
			},
		],
		[
			'blockish/paragraph',
			{
				content: copy.text,
				color: '#cbd5e1',
				alignment: { Desktop: 'center' },
				typography:
					'{"fontSize":{"Desktop":"1.05rem","Mobile":"0.95rem"},"lineHeight":{"Desktop":"1.6"}}',
			},
		],
		[
			'blockish/button',
			{
				text: copy.button,
				url: { url: '#', newTab: false, noFollow: false },
				buttonPlacement: {
					Desktop: { label: 'Center', value: 'center' },
				},
				buttonTextColor: '#0f172a',
				buttonBackground:
					'{"backgroundType":"classic","backgroundColor":"#f8fafc"}',
				buttonPadding: {
					Desktop: {
						top: '12px',
						right: '22px',
						bottom: '12px',
						left: '22px',
					},
				},
				buttonBorderRadius: {
					Desktop: {
						topLeft: '999px',
						topRight: '999px',
						bottomRight: '999px',
						bottomLeft: '999px',
					},
				},
			},
		],
	],
] );

function getEditorPerView( attributes, device ) {
	const d = ( device || 'Desktop' ).toLowerCase();
	if ( d === 'mobile' ) {
		return Math.max( 1, Number( attributes.slidesPerViewMobile ) || 1 );
	}
	if ( d === 'tablet' ) {
		return Math.max( 1, Number( attributes.slidesPerViewTablet ) || 1 );
	}
	return Math.max( 1, Number( attributes.slidesPerView ) || 1 );
}

function trackTransform( physical, perView, gap ) {
	const g = Number( gap ) || 0;
	const n = Math.max( 1, Number( perView ) || 1 );
	const i = Math.max( 0, Number( physical ) || 0 );
	return `translate3d(calc(-${ i } * (100% + ${ g }px) / ${ n }), 0, 0)`;
}

function isRealSlideEl( el ) {
	if ( ! el || el.classList.contains( 'is-clone' ) ) {
		return false;
	}
	return (
		el.classList.contains( 'blockish-carousel__slide' ) ||
		el.classList.contains( 'wp-block-blockish-carousel-slide' )
	);
}

function getRealSlideEls( track ) {
	return Array.from( track.children ).filter( isRealSlideEl );
}

function clearEditorClones( track ) {
	Array.from( track.children )
		.filter( ( el ) => el.classList.contains( 'is-clone' ) )
		.forEach( ( el ) => el.remove() );
}

function makeEditorClone( slide ) {
	const clone = slide.cloneNode( true );
	clone.classList.add( 'is-clone' );
	clone.setAttribute( 'aria-hidden', 'true' );
	clone.removeAttribute( 'data-block' );
	clone.removeAttribute( 'id' );
	clone.querySelectorAll( '[id]' ).forEach( ( el ) => el.removeAttribute( 'id' ) );
	clone
		.querySelectorAll( '[contenteditable]' )
		.forEach( ( el ) => el.removeAttribute( 'contenteditable' ) );
	clone
		.querySelectorAll( '[data-block]' )
		.forEach( ( el ) => el.removeAttribute( 'data-block' ) );
	return clone;
}

/**
 * Prefix/suffix clones so loop wrap animates forward (no rewind).
 * Safe with InnerBlocks: clones are plain DOM; restored if React strips them.
 */
function setupEditorClones( track, cloneCount ) {
	clearEditorClones( track );
	const realSlides = getRealSlideEls( track );
	if ( ! cloneCount || realSlides.length <= cloneCount ) {
		return realSlides.length;
	}

	const prefix = realSlides.slice( -cloneCount ).map( makeEditorClone );
	const suffix = realSlides.slice( 0, cloneCount ).map( makeEditorClone );
	prefix.forEach( ( clone ) => track.insertBefore( clone, track.firstChild ) );
	suffix.forEach( ( clone ) => track.appendChild( clone ) );
	return realSlides.length;
}

function logicalFromPhysical( physical, cloneCount, slideCount, loopEnabled ) {
	if ( ! loopEnabled || ! cloneCount ) {
		return physical;
	}
	let logical = physical - cloneCount;
	if ( logical < 0 ) {
		logical = slideCount + logical;
	}
	if ( logical >= slideCount ) {
		logical = logical - slideCount;
	}
	return Math.max( 0, Math.min( slideCount - 1, logical ) );
}

export default function Edit( {
	attributes,
	setAttributes,
	advancedControls,
	clientId,
} ) {
	const {
		gap = 16,
		showArrows = true,
		showDots = true,
		autoplay = false,
		autoplaySpeed = 4000,
		loop = true,
		pauseOnHover = true,
		transitionSpeed = 450,
	} = attributes;

	const { useDeviceType } = window.blockish.helpers;
	const device = useDeviceType();
	const perView = getEditorPerView( attributes, device );
	const { insertBlock } = useDispatch( blockEditorStore );

	const slideClientIds = useSelect(
		( select ) =>
			select( blockEditorStore ).getBlockOrder( clientId ) || [],
		[ clientId ]
	);

	const selectedSlideIndex = useSelect(
		( select ) => {
			const { getSelectedBlockClientId, getBlockParents, getBlockOrder } =
				select( blockEditorStore );
			const selected = getSelectedBlockClientId();
			if ( ! selected ) {
				return -1;
			}
			const order = getBlockOrder( clientId ) || [];
			if ( order.includes( selected ) ) {
				return order.indexOf( selected );
			}
			const parents = getBlockParents( selected ) || [];
			for ( let i = 0; i < parents.length; i++ ) {
				const idx = order.indexOf( parents[ i ] );
				if ( idx !== -1 ) {
					return idx;
				}
			}
			return -1;
		},
		[ clientId ]
	);

	const slideCount = slideClientIds.length;
	const canSlide = slideCount > perView;
	const loopEnabled = !! loop && canSlide;
	const cloneCount = loopEnabled ? perView : 0;
	const maxLogical = Math.max( 0, slideCount - perView );

	const [ physical, setPhysical ] = useState( 0 );
	const [ noTransition, setNoTransition ] = useState( true );
	const [ paused, setPaused ] = useState( false );
	const rootRef = useRef( null );
	const trackRef = useRef( null );
	const physicalRef = useRef( 0 );
	const jumpingRef = useRef( false );
	const animatingRef = useRef( false );
	const animGuardRef = useRef( null );
	const transitionMs = Math.max( 100, Number( transitionSpeed ) || 450 );

	const clearAnimGuard = useCallback( () => {
		if ( animGuardRef.current ) {
			clearTimeout( animGuardRef.current );
			animGuardRef.current = null;
		}
	}, [] );

	const snapIfNeeded = useCallback( () => {
		if ( ! loopEnabled || jumpingRef.current || ! slideCount ) {
			return false;
		}
		const start = cloneCount;
		const end = cloneCount + slideCount;
		const p = physicalRef.current;

		if ( p >= end ) {
			jumpingRef.current = true;
			const overflow = ( p - end ) % slideCount;
			const next = start + overflow;
			physicalRef.current = next;
			setNoTransition( true );
			setPhysical( next );
			jumpingRef.current = false;
			return true;
		}
		if ( p < start ) {
			jumpingRef.current = true;
			const underflow = ( start - p ) % slideCount;
			const next = underflow === 0 ? start : end - underflow;
			physicalRef.current = next;
			setNoTransition( true );
			setPhysical( next );
			jumpingRef.current = false;
			return true;
		}
		return false;
	}, [ loopEnabled, cloneCount, slideCount ] );

	const finishAnimation = useCallback( () => {
		clearAnimGuard();
		animatingRef.current = false;
		snapIfNeeded();
	}, [ clearAnimGuard, snapIfNeeded ] );

	const goToPhysical = useCallback(
		( next, withTransition = true ) => {
			if ( ! canSlide ) {
				const idle = cloneCount;
				physicalRef.current = idle;
				setNoTransition( true );
				setPhysical( idle );
				return;
			}
			if ( withTransition && animatingRef.current ) {
				return;
			}
			if ( loopEnabled && withTransition ) {
				snapIfNeeded();
			}
			let target = next;
			if ( ! loopEnabled ) {
				target = Math.max( 0, Math.min( maxLogical, next ) );
			}
			if ( ! withTransition ) {
				setNoTransition( true );
			} else {
				animatingRef.current = true;
				clearAnimGuard();
				animGuardRef.current = setTimeout(
					finishAnimation,
					transitionMs + 80
				);
			}
			physicalRef.current = target;
			setPhysical( target );
		},
		[
			canSlide,
			loopEnabled,
			maxLogical,
			cloneCount,
			snapIfNeeded,
			clearAnimGuard,
			finishAnimation,
			transitionMs,
		]
	);

	const goNext = useCallback( () => {
		goToPhysical( physicalRef.current + 1 );
	}, [ goToPhysical ] );

	const goPrev = useCallback( () => {
		goToPhysical( physicalRef.current - 1 );
	}, [ goToPhysical ] );

	const goToLogical = useCallback(
		( logical ) => {
			if ( ! canSlide ) {
				return;
			}
			if ( loopEnabled ) {
				const safe =
					( ( logical % slideCount ) + slideCount ) % slideCount;
				goToPhysical( cloneCount + safe );
			} else {
				goToPhysical( Math.max( 0, Math.min( maxLogical, logical ) ) );
			}
		},
		[ canSlide, loopEnabled, slideCount, cloneCount, maxLogical, goToPhysical ]
	);

	// Keep index in range when slides / perView / loop change.
	useEffect( () => {
		setNoTransition( true );
		if ( ! canSlide ) {
			physicalRef.current = 0;
			setPhysical( 0 );
			return;
		}
		const logical = logicalFromPhysical(
			physicalRef.current,
			cloneCount,
			slideCount,
			loopEnabled
		);
		const next = loopEnabled
			? cloneCount + Math.min( logical, slideCount - 1 )
			: Math.min( logical, maxLogical );
		physicalRef.current = next;
		setPhysical( next );
	}, [ slideCount, perView, maxLogical, cloneCount, loopEnabled, canSlide ] );

	// Jump to the slide being edited.
	useEffect( () => {
		if ( selectedSlideIndex < 0 || ! canSlide ) {
			return;
		}
		const target = loopEnabled
			? cloneCount + Math.min( selectedSlideIndex, slideCount - 1 )
			: Math.min( selectedSlideIndex, maxLogical );
		if ( target !== physicalRef.current ) {
			setNoTransition( true );
			physicalRef.current = target;
			setPhysical( target );
		}
	}, [
		selectedSlideIndex,
		canSlide,
		maxLogical,
		loopEnabled,
		cloneCount,
		slideCount,
	] );

	const slideIdsKey = slideClientIds.join( ',' );

	// Seamless loop: keep prefix/suffix clones on the track (React may strip them).
	useLayoutEffect( () => {
		const track = trackRef.current;
		const root = rootRef.current;
		if ( ! track || ! root ) {
			return;
		}

		root.style.setProperty( '--bc-per-view', String( perView ) );
		root.style.setProperty( '--bc-gap', `${ Number( gap ) || 0 }px` );
		root.style.setProperty(
			'--bc-transition',
			`${ Math.max( 100, Number( transitionSpeed ) || 450 ) }ms`
		);

		if ( loopEnabled && canSlide ) {
			const existing = track.querySelectorAll( ':scope > .is-clone' ).length;
			const expected = cloneCount * 2;
			if ( existing !== expected ) {
				const logical = logicalFromPhysical(
					physicalRef.current,
					cloneCount,
					slideCount,
					true
				);
				setupEditorClones( track, cloneCount );
				const next = cloneCount + Math.min( logical, slideCount - 1 );
				if ( next !== physicalRef.current ) {
					physicalRef.current = next;
					setNoTransition( true );
					setPhysical( next );
				}
			}
		} else {
			clearEditorClones( track );
		}

		track.style.transform = trackTransform( physical, perView, gap );
		if ( noTransition ) {
			void track.offsetHeight;
			setNoTransition( false );
		}
	}, [
		physical,
		perView,
		gap,
		transitionSpeed,
		noTransition,
		device,
		slideCount,
		loopEnabled,
		canSlide,
		cloneCount,
		slideIdsKey,
	] );

	// After wrap animation, snap to the matching real slide without a rewind.
	useEffect( () => {
		const track = trackRef.current;
		if ( ! track || ! loopEnabled ) {
			return undefined;
		}
		const onEnd = ( event ) => {
			if ( event.target !== track || event.propertyName !== 'transform' ) {
				return;
			}
			finishAnimation();
		};
		track.addEventListener( 'transitionend', onEnd );
		track.addEventListener( 'transitioncancel', onEnd );
		return () => {
			track.removeEventListener( 'transitionend', onEnd );
			track.removeEventListener( 'transitioncancel', onEnd );
			clearAnimGuard();
			animatingRef.current = false;
		};
	}, [ loopEnabled, finishAnimation, clearAnimGuard ] );

	useEffect( () => {
		if ( ! autoplay || ! canSlide || paused ) {
			return undefined;
		}
		const timer = setInterval(
			goNext,
			Math.max( 1500, Number( autoplaySpeed ) || 4000 )
		);
		return () => clearInterval( timer );
	}, [ autoplay, autoplaySpeed, canSlide, paused, goNext ] );

	const blockProps = useBlockProps( {
		ref: rootRef,
		className: clsx(
			'blockish-carousel',
			'is-editor-preview',
			getCarouselLayoutClasses( attributes )
		),
		style: getCarouselCssVars( attributes, perView ),
		onMouseEnter: () => {
			if ( pauseOnHover && autoplay ) {
				setPaused( true );
			}
		},
		onMouseLeave: () => {
			if ( pauseOnHover && autoplay ) {
				setPaused( false );
			}
		},
	} );

	const innerBlocksProps = useInnerBlocksProps(
		{
			ref: trackRef,
			className: clsx( 'blockish-carousel__track', {
				'is-no-transition': noTransition,
			} ),
			style: {
				transform: trackTransform( physical, perView, gap ),
			},
		},
		{
			allowedBlocks: ALLOWED_BLOCKS,
			template: TEMPLATE,
			renderAppender: false,
			orientation: 'horizontal',
		}
	);

	const stop = ( event ) => {
		event.preventDefault();
		event.stopPropagation();
	};

	const handleAddSlide = () => {
		const index = slideClientIds.length;
		insertBlock(
			createBlock(
				'blockish/carousel-slide',
				getDefaultSlideAttrs( index )
			),
			undefined,
			clientId
		);
	};

	const dotsCount = loopEnabled ? slideCount : maxLogical + 1;
	const activeDot = loopEnabled
		? logicalFromPhysical( physical, cloneCount, slideCount, true )
		: Math.min( physical, maxLogical );

	return (
		<>
			<Inspector
				attributes={ attributes }
				setAttributes={ setAttributes }
				advancedControls={ advancedControls }
			/>
			<div { ...blockProps }>
				<div className="blockish-carousel__viewport">
					<div { ...innerBlocksProps } />
				</div>
				{ showArrows && canSlide && (
					<>
						<button
							type="button"
							className="blockish-carousel__arrow is-prev"
							aria-label={ __( 'Previous slide', 'blockish' ) }
							disabled={ ! loopEnabled && physical <= 0 }
							onMouseDown={ stop }
							onClick={ ( event ) => {
								stop( event );
								goPrev();
							} }
						>
							‹
						</button>
						<button
							type="button"
							className="blockish-carousel__arrow is-next"
							aria-label={ __( 'Next slide', 'blockish' ) }
							disabled={ ! loopEnabled && physical >= maxLogical }
							onMouseDown={ stop }
							onClick={ ( event ) => {
								stop( event );
								goNext();
							} }
						>
							›
						</button>
					</>
				) }
				{ showDots && canSlide && dotsCount > 1 && (
					<div className="blockish-carousel__dots" role="tablist">
						{ Array.from( { length: dotsCount } ).map( ( _, i ) => (
							<button
								key={ i }
								type="button"
								className={ clsx( 'blockish-carousel__dot', {
									'is-active': i === activeDot,
								} ) }
								aria-label={
									__( 'Go to slide', 'blockish' ) + ` ${ i + 1 }`
								}
								onMouseDown={ stop }
								onClick={ ( event ) => {
									stop( event );
									goToLogical( i );
								} }
							/>
						) ) }
					</div>
				) }
				<div className="blockish-carousel-editor__appender">
					<Button
						variant="secondary"
						icon="plus-alt2"
						onClick={ handleAddSlide }
					>
						{ __( 'Add slide', 'blockish' ) }
					</Button>
				</div>
			</div>
		</>
	);
}
