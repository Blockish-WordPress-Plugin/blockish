import { useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const normalizeStatusSteps = ( status ) => {
	const seen = new Set();

	return status
		.map( ( step ) => ( typeof step === 'string' ? step.trim() : '' ) )
		.filter( Boolean )
		.filter( ( step ) => {
			const key = step.toLowerCase();

			if ( seen.has( key ) ) {
				return false;
			}

			seen.add( key );
			return true;
		} );
};

export default function MessageThinking({ status = [] }) {

	const [animatedStepCount, setAnimatedStepCount] = useState( 1 );
	const steps = useMemo( () => normalizeStatusSteps( [
		...status,
	] ), [ status, animatedStepCount ] );
	const hasStatus = steps.length > 0;
	const currentStep = steps.at( -1 ) || __( 'Thinking', 'blockish' );

	return (
		<div className="blockish-ai-thinking">
			<div className="blockish-ai-thinking-header">
				<span className="blockish-ai-thinking-spinner" aria-hidden="true" />
				<span className="blockish-ai-thinking-label">
					{ __( 'Thinking', 'blockish' ) }
				</span>
			</div>
			<p className="blockish-ai-thinking-live">
				{ currentStep }
			</p>
			{ hasStatus && (
				<div className="blockish-ai-thinking-steps">
					{ steps.map( ( step, index ) => {
						const isCurrent = index === steps.length - 1;

						return (
							<div
								key={ `status-${ index }` }
								className={ `blockish-ai-thinking-step ${ isCurrent ? 'is-current' : 'is-done' }` }
							>
								<span className="blockish-ai-thinking-step-marker" aria-hidden="true">
									{ isCurrent ? '' : '✓' }
								</span>
								<span className="blockish-ai-thinking-step-label">{ step }</span>
							</div>
						);
					} ) }
					<div className="blockish-ai-thinking-activity" aria-hidden="true">
						<span />
						<span />
						<span />
					</div>
				</div>
			) }
		</div>
	);
}
