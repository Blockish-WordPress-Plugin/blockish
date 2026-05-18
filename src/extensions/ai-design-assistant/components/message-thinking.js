import { __ } from '@wordpress/i18n';

export default function MessageThinking({ plan = [], status = [] }) {
	const completedByStatus = status.length;
	const hasSteps = plan.length > 0;

	return (
		<div className="blockish-ai-thinking">
			<div className="blockish-ai-thinking-header">
				<span className="blockish-ai-thinking-spinner" aria-hidden="true" />
				<span className="blockish-ai-thinking-label">
					{ __( 'Thinking', 'blockish' ) }
				</span>
			</div>
			{ hasSteps && (
				<div className="blockish-ai-thinking-steps">
					{ plan.map( ( step, index ) => {
						const isDone = index < completedByStatus;
						const isCurrent = index === completedByStatus;

						return (
							<div
								key={ step }
								className={ [
									'blockish-ai-thinking-step',
									isDone ? 'is-done' : '',
									isCurrent ? 'is-current' : '',
									! isDone && ! isCurrent ? 'is-upcoming' : '',
								].filter( Boolean ).join( ' ' ) }
							>
								<span className="blockish-ai-thinking-step-icon" aria-hidden="true">
									{ isDone ? '✓' : isCurrent ? '◌' : '○' }
								</span>
								<span className="blockish-ai-thinking-step-label">{ step }</span>
							</div>
						);
					} ) }
					{ status.map( ( step, index ) => (
						<div
							key={ `status-${ index }` }
							className="blockish-ai-thinking-step is-status"
						>
							<span className="blockish-ai-thinking-step-icon" aria-hidden="true">→</span>
							<span className="blockish-ai-thinking-step-label">{ step }</span>
						</div>
					) ) }
				</div>
			) }
		</div>
	);
}
