import FlipClock from './flip-clock';
import { parseDueDate } from './utils';

export const dueDateToUnix = ( dueDate ) => {
	const date = parseDueDate( dueDate );
	if ( ! date ) {
		return Math.floor( Date.now() / 1000 );
	}
	return Math.floor( date.getTime() / 1000 );
};

export const getFlipClockHeadings = ( settings = {} ) => [
	settings?.units?.find( ( unit ) => unit.key === 'days' )?.label || 'Days',
	settings?.units?.find( ( unit ) => unit.key === 'hours' )?.label || 'Hours',
	settings?.units?.find( ( unit ) => unit.key === 'minutes' )?.label ||
		'Minutes',
	settings?.units?.find( ( unit ) => unit.key === 'seconds' )?.label ||
		'Seconds',
];

/**
 * Mount flip clock into an element. Returns instance (call .destroy() to cleanup).
 */
export const mountFlipClock = ( element, dueDate, settings = {} ) => {
	if ( ! element ) {
		return null;
	}

	element.innerHTML = '';

	const instance = new FlipClock( dueDateToUnix( dueDate ), element, {
		headings: getFlipClockHeadings( settings ),
		onEnded: settings?.onEnded,
	} );

	instance.start();
	return instance;
};
