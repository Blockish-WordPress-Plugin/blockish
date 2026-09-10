import { getRingGeometry } from './utils';

const CircularRing = ( { progress } ) => {
	const { radius, circumference, offset } = getRingGeometry( progress );

	return (
		<svg
			className="blockish-countdown__ring"
			viewBox="0 0 100 100"
			aria-hidden="true"
			focusable="false"
		>
			<circle
				className="blockish-countdown__ring-track"
				cx="50"
				cy="50"
				r={ radius }
				fill="none"
			/>
			<circle
				className="blockish-countdown__ring-progress"
				cx="50"
				cy="50"
				r={ radius }
				fill="none"
				strokeDasharray={ circumference.toFixed( 4 ) }
				strokeDashoffset={ offset.toFixed( 4 ) }
				transform="rotate(-90 50 50)"
			/>
		</svg>
	);
};

export default CircularRing;
