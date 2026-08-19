import { __ } from '@wordpress/i18n';
import {
	Button,
	Flex,
	FlexBlock,
	FlexItem,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';
import { rotateRight } from '@wordpress/icons';

const hasValue = ( usableValue ) => {
	if ( ! usableValue || typeof usableValue !== 'object' ) {
		return false;
	}

	const hasWidth = Object.values( usableValue?.width || {} ).some(
		( width ) => !! width
	);
	const hasColor = !! usableValue?.color;

	return hasWidth || hasColor;
};

const BlockishTextStroke = ( {
	label = __( 'Text Stroke', 'blockish' ),
	value,
	onChange,
	showReset = true,
} ) => {
	const { BlockishDropdown, BlockishRangeUnit, BlockishResponsive, BlockishColor } =
		window.blockish.components;
	const { useDeviceType } = window.blockish.helpers;
	const device = useDeviceType();
	const usableValue = value && typeof value === 'string' ? JSON.parse( value ) : value;

	const handleWidthChange = ( nextWidth ) => {
		const nextValue = {
			...usableValue,
			width: {
				...( usableValue?.width || {} ),
				[ device ]: nextWidth,
			},
		};

		onChange( JSON.stringify( nextValue ) );
	};

	const handleColorChange = ( nextColor ) => {
		const nextValue = {
			...usableValue,
			color: nextColor,
		};

		onChange( JSON.stringify( nextValue ) );
	};

	return (
		<div className="blockish-text-stroke blockish-control blockish-group-control">
			<BlockishDropdown
				renderToggle={ ( { isOpen, onToggle } ) => (
					<Flex>
						<FlexBlock>
							<Button
								className="blockish-text-stroke-button blockish-text-stroke-toggle"
								variant="secondary"
								onClick={ onToggle }
								aria-expanded={ isOpen }
							>
								<HStack justify="center" gap={ 2 }>
									<Text>{ label }</Text>
								</HStack>
							</Button>
						</FlexBlock>
						{ showReset && (
							<FlexItem>
								<Button
									className="blockish-text-stroke-button blockish-text-stroke-reset"
									variant="secondary"
									icon={ rotateRight }
									onClick={ () => onChange( '' ) }
									disabled={ ! hasValue( usableValue ) }
									label={ __( 'Reset Text Stroke', 'blockish' ) }
									showTooltip
								/>
							</FlexItem>
						) }
					</Flex>
				) }
			>
				<div className="blockish-text-stroke-content">
					<BlockishResponsive left="11ch">
						<BlockishRangeUnit
							label={ __( 'Stroke Width', 'blockish' ) }
							value={ usableValue?.width?.[ device ] }
							onChange={ handleWidthChange }
							showReset={ false }
						/>
					</BlockishResponsive>
					<BlockishColor
						label={ __( 'Stroke Color', 'blockish' ) }
						value={ usableValue?.color }
						onChange={ handleColorChange }
						showReset={ false }
					/>
				</div>
			</BlockishDropdown>
		</div>
	);
};

export default BlockishTextStroke;
