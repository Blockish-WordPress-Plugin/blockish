import { __ } from '@wordpress/i18n';

const Grid = () => {
	const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;

	return (
		<BlockishControl type="BlockishPanelBody" title={ __( 'Grid', 'blockish' ) }>
			<BlockishResponsiveControl
				type="BlockishToggleGroup"
				label={ __( 'Align Self', 'blockish' ) }
				slug="alignSelf"
				left="64px"
				options={ [
					{ value: 'start', label: __( 'Start', 'blockish' ) },
					{ value: 'center', label: __( 'Center', 'blockish' ) },
					{ value: 'end', label: __( 'End', 'blockish' ) },
					{ value: 'stretch', label: __( 'Stretch', 'blockish' ) },
				] }
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
			<BlockishResponsiveControl
				type="BlockishToggleGroup"
				label={ __( 'Justify Self', 'blockish' ) }
				slug="justifySelf"
				left="77px"
				options={ [
					{ value: 'start', label: __( 'Start', 'blockish' ) },
					{ value: 'center', label: __( 'Center', 'blockish' ) },
					{ value: 'end', label: __( 'End', 'blockish' ) },
					{ value: 'stretch', label: __( 'Stretch', 'blockish' ) },
				] }
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
			<BlockishResponsiveControl
				type="BlockishNumber"
				label={ __( 'Column Start', 'blockish' ) }
				slug="gridColumnStart"
				left="88px"
				min="1"
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
			<BlockishResponsiveControl
				type="BlockishNumber"
				label={ __( 'Column End', 'blockish' ) }
				slug="gridColumnEnd"
				left="75px"
				min="1"
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
			<BlockishResponsiveControl
				type="BlockishNumber"
				label={ __( 'Row Start', 'blockish' ) }
				slug="gridRowStart"
				left="64px"
				min="1"
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
			<BlockishResponsiveControl
				type="BlockishNumber"
				label={ __( 'Row End', 'blockish' ) }
				slug="gridRowEnd"
				left="52px"
				min="1"
				help={ __( 'This control will affect contained elements only.', 'blockish' ) }
			/>
		</BlockishControl>
	);
};

export default Grid;
