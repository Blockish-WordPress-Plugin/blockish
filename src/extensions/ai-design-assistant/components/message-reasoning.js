import { useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

export default function MessageReasoning({ reasoning = [], summary = '' }) {
	const [ expanded, setExpanded ] = useState( false );
	const hasReasoning = reasoning.length > 0;

	if ( ! hasReasoning && ! summary ) {
		return null;
	}

	return (
		<div className="blockish-ai-reasoning">
			{ hasReasoning && (
				<button
					className="blockish-ai-reasoning-toggle"
					onClick={ () => setExpanded( ( v ) => ! v ) }
					aria-expanded={ expanded }
				>
					<span className="blockish-ai-reasoning-toggle-chevron">
						{ expanded ? '▾' : '▸' }
					</span>
					{ __( 'Reasoning', 'blockish' ) }
					{ ! expanded && (
						<span className="blockish-ai-reasoning-toggle-count">
							{ reasoning.length }
						</span>
					) }
				</button>
			) }
			{ hasReasoning && expanded && (
				<div className="blockish-ai-reasoning-steps">
					{ reasoning.map( ( step, index ) => (
						<div key={ index } className="blockish-ai-reasoning-step">
							<span className="blockish-ai-reasoning-step-dot" aria-hidden="true" />
							<span>{ step }</span>
						</div>
					) ) }
				</div>
			) }
			{ summary && (
				<p className="blockish-ai-summary">{ summary }</p>
			) }
		</div>
	);
}
