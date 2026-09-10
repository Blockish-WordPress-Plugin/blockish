export const LAYOUTS = [ 'boxes', 'inline', 'stacked', 'circular', 'flip' ];

export const UNIT_KEYS = [ 'days', 'hours', 'minutes', 'seconds' ];

const clampNumber = ( value, fallback = 0 ) => {
	const parsed = Number( value );
	return Number.isFinite( parsed ) ? parsed : fallback;
};

export const getDefaultDueDate = () => {
	const date = new Date();
	date.setDate( date.getDate() + 7 );
	date.setSeconds( 0, 0 );
	return toDatetimeLocalValue( date );
};

export const toDatetimeLocalValue = ( date ) => {
	if ( ! ( date instanceof Date ) || Number.isNaN( date.getTime() ) ) {
		return '';
	}

	const pad = ( value ) => String( value ).padStart( 2, '0' );

	return `${ date.getFullYear() }-${ pad( date.getMonth() + 1 ) }-${ pad(
		date.getDate()
	) }T${ pad( date.getHours() ) }:${ pad( date.getMinutes() ) }`;
};

export const parseDueDate = ( value ) => {
	if ( ! value || typeof value !== 'string' ) {
		return null;
	}

	const normalized = value.includes( 'T' ) ? value : value.replace( ' ', 'T' );
	const date = new Date( normalized );
	return Number.isNaN( date.getTime() ) ? null : date;
};

export const padUnitValue = ( value, padZeros = true ) => {
	const safe = Math.max( 0, Math.floor( clampNumber( value, 0 ) ) );
	if ( ! padZeros ) {
		return String( safe );
	}
	return String( safe ).padStart( 2, '0' );
};

/** Deterministic placeholders for save() — never use live clock in save markup. */
export const getStaticParts = () => ( {
	expired: false,
	totalMs: 0,
	days: 0,
	hours: 0,
	minutes: 0,
	seconds: 0,
} );

export const getRemainingParts = ( dueDate, now = Date.now() ) => {
	const target = parseDueDate( dueDate );
	if ( ! target ) {
		return getStaticParts();
	}

	const totalMs = target.getTime() - now;
	if ( totalMs <= 0 ) {
		return {
			expired: true,
			totalMs: 0,
			days: 0,
			hours: 0,
			minutes: 0,
			seconds: 0,
		};
	}

	const totalSeconds = Math.floor( totalMs / 1000 );
	const days = Math.floor( totalSeconds / 86400 );
	const hours = Math.floor( ( totalSeconds % 86400 ) / 3600 );
	const minutes = Math.floor( ( totalSeconds % 3600 ) / 60 );
	const seconds = totalSeconds % 60;

	return {
		expired: false,
		totalMs,
		days,
		hours,
		minutes,
		seconds,
	};
};

export const getVisibleUnits = ( attributes = {} ) => {
	const units = [];

	if ( attributes?.showDays !== false ) {
		units.push( {
			key: 'days',
			label: attributes?.daysLabel || 'Days',
			max: Math.max( 1, clampNumber( attributes?.circularDaysMax, 30 ) ),
		} );
	}
	if ( attributes?.showHours !== false ) {
		units.push( {
			key: 'hours',
			label: attributes?.hoursLabel || 'Hours',
			max: 24,
		} );
	}
	if ( attributes?.showMinutes !== false ) {
		units.push( {
			key: 'minutes',
			label: attributes?.minutesLabel || 'Minutes',
			max: 60,
		} );
	}
	if ( attributes?.showSeconds !== false ) {
		units.push( {
			key: 'seconds',
			label: attributes?.secondsLabel || 'Seconds',
			max: 60,
		} );
	}

	return units;
};

export const getUnitProgress = ( key, value, max ) => {
	const safeValue = Math.max( 0, clampNumber( value, 0 ) );
	const safeMax = Math.max( 1, clampNumber( max, 1 ) );

	if ( key === 'days' ) {
		return Math.min( 1, safeValue / safeMax );
	}

	return Math.min( 1, safeValue / safeMax );
};

export const getCountdownSettings = ( attributes = {} ) => {
	const layoutValue = attributes?.layout?.value || 'boxes';
	const layout = LAYOUTS.includes( layoutValue ) ? layoutValue : 'boxes';
	const separator = attributes?.separator?.value ?? ':';

	return {
		dueDate: attributes?.dueDate || '',
		layout,
		padZeros: attributes?.padZeros !== false,
		showLabels: attributes?.showLabels !== false,
		separator,
		circularDaysMax: Math.max(
			1,
			clampNumber( attributes?.circularDaysMax, 30 )
		),
		expiredMessage: attributes?.expiredMessage || '',
		showExpiredMessage: attributes?.showExpiredMessage !== false,
		units: getVisibleUnits( attributes ),
	};
};

export const getDatasetFromAttributes = ( attributes = {} ) => {
	const settings = getCountdownSettings( attributes );

	return {
		'data-blockish-countdown': 'true',
		'data-due-date': settings.dueDate,
		'data-layout': settings.layout,
		'data-pad-zeros': String( settings.padZeros ),
		'data-show-labels': String( settings.showLabels ),
		'data-separator': settings.separator,
		'data-circular-days-max': String( settings.circularDaysMax ),
		'data-show-expired-message': String( settings.showExpiredMessage ),
		'data-show-days': String( attributes?.showDays !== false ),
		'data-show-hours': String( attributes?.showHours !== false ),
		'data-show-minutes': String( attributes?.showMinutes !== false ),
		'data-show-seconds': String( attributes?.showSeconds !== false ),
		'data-days-label': attributes?.daysLabel || 'Days',
		'data-hours-label': attributes?.hoursLabel || 'Hours',
		'data-minutes-label': attributes?.minutesLabel || 'Minutes',
		'data-seconds-label': attributes?.secondsLabel || 'Seconds',
	};
};

export const getSettingsFromDataset = ( dataset = {} ) =>
	getCountdownSettings( {
		dueDate: dataset?.dueDate || '',
		layout: { value: dataset?.layout || 'boxes' },
		padZeros: dataset?.padZeros !== 'false',
		showLabels: dataset?.showLabels !== 'false',
		separator: { value: dataset?.separator ?? ':' },
		circularDaysMax: clampNumber( dataset?.circularDaysMax, 30 ),
		expiredMessage: '',
		showExpiredMessage: dataset?.showExpiredMessage !== 'false',
		showDays: dataset?.showDays !== 'false',
		showHours: dataset?.showHours !== 'false',
		showMinutes: dataset?.showMinutes !== 'false',
		showSeconds: dataset?.showSeconds !== 'false',
		daysLabel: dataset?.daysLabel || 'Days',
		hoursLabel: dataset?.hoursLabel || 'Hours',
		minutesLabel: dataset?.minutesLabel || 'Minutes',
		secondsLabel: dataset?.secondsLabel || 'Seconds',
	} );

const RING_RADIUS = 42;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

export const getRingGeometry = ( progress = 0 ) => {
	const safeProgress = Math.max( 0, Math.min( 1, progress ) );
	return {
		radius: RING_RADIUS,
		circumference: RING_CIRCUMFERENCE,
		offset: RING_CIRCUMFERENCE * ( 1 - safeProgress ),
	};
};
