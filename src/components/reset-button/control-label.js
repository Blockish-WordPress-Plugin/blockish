import { BaseControl } from '@wordpress/components';
import BlockishResetButton from './index';

const BlockishControlLabel = ( {
	label,
	as = 'legend',
	showReset = true,
	hasValue = false,
	onReset,
	resetLabel,
	children,
} ) => {
	return (
		<div className="blockish-control-label">
			<BaseControl.VisualLabel as={ as } __nextHasNoMarginBottom={ true }>
				{ children || label }
			</BaseControl.VisualLabel>
			{ showReset && (
				<BlockishResetButton
					onClick={ onReset }
					disabled={ ! hasValue }
					label={ resetLabel }
				/>
			) }
		</div>
	);
};

export default BlockishControlLabel;
