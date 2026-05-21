import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function MessageReasoning({ reasoning = [], summary = '', todo = [] }) {
	const [ expanded, setExpanded ] = useState( false );
	const hasReasoning = reasoning.length > 0;
	const hasTodo = todo.length > 0;
	const count = reasoning.length + todo.length + ( summary ? 1 : 0 );

	if ( ! hasReasoning && ! hasTodo && ! summary ) {
		return null;
	}

	return (
		<div className="blockish-ai-reasoning">
			<button
				className="blockish-ai-reasoning-toggle"
				onClick={ () => setExpanded( ( v ) => ! v ) }
				aria-expanded={ expanded }
			>
				<span className="blockish-ai-reasoning-toggle-chevron">
					{ expanded ? '▾' : '▸' }
				</span>
				{ __( 'Reasoning', 'blockish' ) }
				<span className="blockish-ai-reasoning-toggle-count">
					{ count }
				</span>
			</button>
			{ expanded && (
				<div className="blockish-ai-reasoning-body">
					{ summary && (
						<p className="blockish-ai-summary">{ summary }</p>
					) }
					{ hasTodo && (
						<div className="blockish-ai-reasoning-group">
							<div className="blockish-ai-reasoning-title">
								{ __( 'Next Steps', 'blockish' ) }
							</div>
							<div className="blockish-ai-reasoning-steps">
								{ todo.map( ( step, index ) => (
									<div key={ index } className="blockish-ai-reasoning-step">
										<span className="blockish-ai-reasoning-step-dot" aria-hidden="true" />
										<span>{ step }</span>
									</div>
								) ) }
							</div>
						</div>
					) }
					{ hasReasoning && (
						<div className="blockish-ai-reasoning-group">
							<div className="blockish-ai-reasoning-title">
								{ __( 'Reasoning', 'blockish' ) }
							</div>
							<div className="blockish-ai-reasoning-steps">
								{ reasoning.map( ( step, index ) => (
									<div key={ index } className="blockish-ai-reasoning-step">
										<span className="blockish-ai-reasoning-step-dot" aria-hidden="true" />
										<span>{ step }</span>
									</div>
								) ) }
							</div>
						</div>
					) }
				</div>
			) }
		</div>
	);
}
