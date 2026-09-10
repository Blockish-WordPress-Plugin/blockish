/**
 * Flip-digit countdown clock.
 * Animation/DOM approach adapted from FlipDown (Peter Butcher, MIT).
 */

const DEFAULT_HEADINGS = [ 'Days', 'Hours', 'Minutes', 'Seconds' ];
const FLIP_MS = 500;

const pad = ( value, length = 2 ) => {
	const text = String( value );
	return text.length >= length ? text : pad( `0${ text }`, length );
};

const appendChildren = ( parent, children ) => {
	children.forEach( ( child ) => parent.appendChild( child ) );
};

export default class FlipClock {
	/**
	 * @param {number} epochUnix Unix timestamp (seconds) to count down to.
	 * @param {HTMLElement} element Mount target.
	 * @param {{ headings?: string[], onEnded?: () => void }} [options]
	 */
	constructor( epochUnix, element, options = {} ) {
		if ( typeof epochUnix !== 'number' || Number.isNaN( epochUnix ) ) {
			throw new Error( 'FlipClock: epochUnix must be a number.' );
		}
		if ( ! element ) {
			throw new Error( 'FlipClock: element is required.' );
		}

		this.element = element;
		this.epoch = epochUnix;
		this.headings =
			options.headings?.length === 4
				? options.headings
				: [ ...DEFAULT_HEADINGS ];
		this.onEnded =
			typeof options.onEnded === 'function' ? options.onEnded : null;

		this.initialised = false;
		this.ended = false;
		this.timerId = null;
		this.now = Date.now() / 1000;

		this.rotors = [];
		this.rotorLeafFront = [];
		this.rotorLeafRear = [];
		this.rotorTop = [];
		this.rotorBottom = [];
		this.prevDigits = [];
	}

	start() {
		if ( ! this.initialised ) {
			this._init();
		}
		this.timerId = window.setInterval( () => this._tick( false ), 1000 );
		return this;
	}

	destroy() {
		if ( this.timerId ) {
			window.clearInterval( this.timerId );
			this.timerId = null;
		}
		this.element.innerHTML = '';
		this.element.classList.remove( 'blockish-flip' );
		this.initialised = false;
	}

	_init() {
		this.initialised = true;
		this.element.classList.add( 'blockish-flip' );

		const remaining = Math.max( 0, this.epoch - this.now );
		const dayDigits =
			remaining > 0
				? Math.floor( remaining / 86400 ).toString().length
				: 1;
		const dayRotorCount = Math.max( 2, dayDigits );

		for ( let i = 0; i < dayRotorCount + 6; i++ ) {
			this.rotors.push( this._createRotor( 0 ) );
		}

		this.element.appendChild(
			this._createRotorGroup( this.rotors.slice( 0, dayRotorCount ), 0 )
		);

		let offset = dayRotorCount;
		for ( let group = 1; group <= 3; group++ ) {
			this.element.appendChild(
				this._createRotorGroup(
					this.rotors.slice( offset, offset + 2 ),
					group
				)
			);
			offset += 2;
		}

		this.rotorLeafFront = [
			...this.element.getElementsByClassName( 'rotor-leaf-front' ),
		];
		this.rotorLeafRear = [
			...this.element.getElementsByClassName( 'rotor-leaf-rear' ),
		];
		this.rotorTop = [
			...this.element.getElementsByClassName( 'rotor-top' ),
		];
		this.rotorBottom = [
			...this.element.getElementsByClassName( 'rotor-bottom' ),
		];

		this._tick( true );
	}

	_createRotorGroup( rotors, headingIndex ) {
		const group = document.createElement( 'div' );
		group.className = 'rotor-group';

		const heading = document.createElement( 'div' );
		heading.className = 'rotor-group-heading';
		heading.setAttribute( 'data-before', this.headings[ headingIndex ] );
		group.appendChild( heading );
		appendChildren( group, rotors );
		return group;
	}

	_createRotor( value = 0 ) {
		const rotor = document.createElement( 'div' );
		const leaf = document.createElement( 'div' );
		const leafRear = document.createElement( 'figure' );
		const leafFront = document.createElement( 'figure' );
		const top = document.createElement( 'div' );
		const bottom = document.createElement( 'div' );

		rotor.className = 'rotor';
		leaf.className = 'rotor-leaf';
		leafRear.className = 'rotor-leaf-rear';
		leafFront.className = 'rotor-leaf-front';
		top.className = 'rotor-top';
		bottom.className = 'rotor-bottom';

		const text = String( value );
		leafRear.textContent = text;
		top.textContent = text;
		bottom.textContent = text;

		appendChildren( rotor, [ leaf, top, bottom ] );
		appendChildren( leaf, [ leafRear, leafFront ] );
		return rotor;
	}

	_tick( isInit = false ) {
		this.now = Date.now() / 1000;
		let diff = Math.max( 0, this.epoch - this.now );

		const days = Math.floor( diff / 86400 );
		diff -= days * 86400;
		const hours = Math.floor( diff / 3600 );
		diff -= hours * 3600;
		const minutes = Math.floor( diff / 60 );
		const seconds = Math.floor( diff - minutes * 60 );

		const dayWidth = Math.max( 2, this.rotors.length - 6 );
		const digits = (
			pad( days, dayWidth ) +
			pad( hours ) +
			pad( minutes ) +
			pad( seconds )
		).split( '' );

		this._paintDigits( isInit, digits );
		this._maybeEnd();
	}

	_paintDigits( isInit, digits ) {
		const prev = this.prevDigits.length
			? this.prevDigits
			: digits.map( () => '0' );

		this.rotorLeafFront.forEach( ( el, i ) => {
			el.textContent = prev[ i ] ?? '0';
		} );
		this.rotorBottom.forEach( ( el, i ) => {
			el.textContent = prev[ i ] ?? '0';
		} );

		const applyNext = () => {
			this.rotorTop.forEach( ( el, i ) => {
				const next = digits[ i ];
				if ( next != null && el.textContent !== next ) {
					el.textContent = next;
				}
			} );

			this.rotorLeafRear.forEach( ( el, i ) => {
				const next = digits[ i ];
				if ( next == null || el.textContent === next ) {
					return;
				}
				el.textContent = next;
				el.parentElement.classList.add( 'flipped' );
				window.setTimeout( () => {
					el.parentElement.classList.remove( 'flipped' );
				}, FLIP_MS );
			} );
		};

		if ( isInit ) {
			applyNext();
		} else {
			window.setTimeout( applyNext, FLIP_MS );
		}

		this.prevDigits = digits;
	}

	_maybeEnd() {
		if ( this.ended || this.epoch - this.now > 0 ) {
			return;
		}
		this.ended = true;
		this.onEnded?.();
		this.onEnded = null;
	}
}
