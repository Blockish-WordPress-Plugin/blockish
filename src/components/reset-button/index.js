import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { rotateRight } from '@wordpress/icons';
import clsx from 'clsx';

const BlockishResetButton = ( {
	onClick,
	disabled = false,
	label = __( 'Reset', 'blockish' ),
	className,
} ) => {
	return (
		<Button
			className={ clsx( 'blockish-reset-button', className ) }
			icon={ rotateRight }
			size="small"
			onClick={ onClick }
			disabled={ disabled }
			label={ label }
			showTooltip
		/>
	);
};

export default BlockishResetButton;
