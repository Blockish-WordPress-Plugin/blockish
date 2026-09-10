import { useEffect, useRef } from '@wordpress/element';
import { mountFlipClock } from './flip-clock-mount';

/**
 * Editor mount for flip-clock countdown.
 */
export default function FlipClockEditor( { dueDate, headings } ) {
	const mountRef = useRef( null );

	useEffect( () => {
		const el = mountRef.current;
		if ( ! el ) {
			return undefined;
		}

		const instance = mountFlipClock( el, dueDate, {
			units: [
				{ key: 'days', label: headings?.[ 0 ] || 'Days' },
				{ key: 'hours', label: headings?.[ 1 ] || 'Hours' },
				{ key: 'minutes', label: headings?.[ 2 ] || 'Minutes' },
				{ key: 'seconds', label: headings?.[ 3 ] || 'Seconds' },
			],
		} );

		return () => {
			instance?.destroy();
		};
	}, [
		dueDate,
		headings?.[ 0 ],
		headings?.[ 1 ],
		headings?.[ 2 ],
		headings?.[ 3 ],
	] );

	return (
		<div ref={ mountRef } className="blockish-countdown__flipdown" />
	);
}
