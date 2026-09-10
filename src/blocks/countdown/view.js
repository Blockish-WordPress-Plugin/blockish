import {
	applyDomDueDate,
	getRemainingParts,
	getRingGeometry,
	getSettingsFromDataset,
	getUnitProgress,
	padUnitValue,
} from './utils';
import { mountFlipClock } from './flip-clock-mount';

const updateRing = ( unitElement, progress ) => {
	const progressCircle = unitElement.querySelector(
		'.blockish-countdown__ring-progress'
	);
	if ( ! progressCircle ) {
		return;
	}

	const { circumference, offset } = getRingGeometry( progress );
	progressCircle.setAttribute( 'stroke-dasharray', circumference.toFixed( 4 ) );
	progressCircle.setAttribute( 'stroke-dashoffset', offset.toFixed( 4 ) );
};

const setExpiredState = ( element, settings, expired ) => {
	const unitsWrap = element.querySelector( '.blockish-countdown__units' );
	const flipWrap = element.querySelector( '.blockish-countdown__flipdown' );
	const expiredWrap = element.querySelector(
		'.blockish-countdown__expired-wrap'
	);

	element.classList.toggle( 'is-expired', expired );

	if ( unitsWrap ) {
		unitsWrap.classList.toggle( 'is-hidden', expired );
		unitsWrap.setAttribute( 'aria-hidden', expired ? 'true' : 'false' );
	}

	if ( flipWrap ) {
		flipWrap.classList.toggle( 'is-hidden', expired );
		flipWrap.setAttribute( 'aria-hidden', expired ? 'true' : 'false' );
	}

	if ( expiredWrap ) {
		const showExpired = settings.showExpiredMessage && expired;
		expiredWrap.classList.toggle( 'is-hidden', ! showExpired );
		expiredWrap.setAttribute(
			'aria-hidden',
			showExpired ? 'false' : 'true'
		);
	}
};

const renderCountdown = ( element, settings, now = Date.now() ) => {
	const parts = getRemainingParts( settings.dueDate, now );
	setExpiredState( element, settings, parts.expired );

	if ( parts.expired || settings.layout === 'flip' ) {
		return;
	}

	settings.units.forEach( ( unit ) => {
		const unitElement = element.querySelector(
			`.blockish-countdown__unit[data-unit="${ unit.key }"]`
		);
		if ( ! unitElement ) {
			return;
		}

		const rawValue = parts[ unit.key ] || 0;
		const display = padUnitValue( rawValue, settings.padZeros );
		const progress = getUnitProgress( unit.key, rawValue, unit.max );

		unitElement.setAttribute( 'data-progress', progress.toFixed( 4 ) );

		const valueElement = unitElement.querySelector(
			'[data-countdown-value]'
		);
		if ( valueElement ) {
			valueElement.textContent = display;
		}

		if ( settings.layout === 'circular' ) {
			updateRing( unitElement, progress );
		}

	} );
};

class BlockishCountdown {
	constructor( element ) {
		this.element = element;
		this.settings = applyDomDueDate(
			element,
			getSettingsFromDataset( element?.dataset || {} )
		);
		this.timerId = null;
		this.flipClock = null;
	}

	destroy() {
		if ( this.timerId ) {
			window.clearInterval( this.timerId );
			this.timerId = null;
		}
		this.flipClock?.destroy();
		this.flipClock = null;
	}

	tick() {
		renderCountdown( this.element, this.settings );
	}

	mount() {
		if ( this.settings.layout === 'flip' ) {
			const mountEl = this.element.querySelector(
				'.blockish-countdown__flipdown'
			);
			const parts = getRemainingParts( this.settings.dueDate );
			setExpiredState( this.element, this.settings, parts.expired );

			if ( ! parts.expired && mountEl ) {
				this.flipClock = mountFlipClock(
					mountEl,
					this.settings.dueDate,
					{
						...this.settings,
						onEnded: () => {
							setExpiredState(
								this.element,
								this.settings,
								true
							);
						},
					}
				);
			}
			return;
		}

		this.tick();
		this.timerId = window.setInterval( () => this.tick(), 1000 );
	}
}

const instances = new WeakMap();

const initCountdown = ( element ) => {
	instances.get( element )?.destroy();
	const countdown = new BlockishCountdown( element );
	instances.set( element, countdown );
	countdown.mount();
};

const initAllCountdowns = () => {
	document
		.querySelectorAll(
			'.wp-block-blockish-countdown[data-blockish-countdown="true"]'
		)
		.forEach( ( element ) => initCountdown( element ) );
};

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initAllCountdowns );
} else {
	initAllCountdowns();
}

window.addEventListener( 'pageshow', ( event ) => {
	if ( event.persisted ) {
		initAllCountdowns();
	}
} );
