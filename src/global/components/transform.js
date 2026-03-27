import { __ } from '@wordpress/i18n';
import { memo, useCallback } from '@wordpress/element';
import {
	Button,
	Dropdown,
	__experimentalHStack as HStack,
	__experimentalText as Text,
} from '@wordpress/components';

const ORIGIN_OPTIONS = [
	{ label: __( 'Top Left', 'blockish' ), value: 'top left' },
	{ label: __( 'Top Center', 'blockish' ), value: 'top center' },
	{ label: __( 'Top Right', 'blockish' ), value: 'top right' },
	{ label: __( 'Center Left', 'blockish' ), value: 'center left' },
	{ label: __( 'Center', 'blockish' ), value: 'center center' },
	{ label: __( 'Center Right', 'blockish' ), value: 'center right' },
	{ label: __( 'Bottom Left', 'blockish' ), value: 'bottom left' },
	{ label: __( 'Bottom Center', 'blockish' ), value: 'bottom center' },
	{ label: __( 'Bottom Right', 'blockish' ), value: 'bottom right' },
	{ label: __( 'Custom', 'blockish' ), value: 'custom' },
];

const suffixSlug = ( slug, isHover ) => ( isHover ? `${ slug }Hover` : slug );

const getTransformSlugs = ( isHover ) => {
	return {
		rotateZ: suffixSlug( 'rotateZ', isHover ),
		rotateX: suffixSlug( 'rotateX', isHover ),
		rotateY: suffixSlug( 'rotateY', isHover ),
		scaleX: suffixSlug( 'scaleX', isHover ),
		scaleY: suffixSlug( 'scaleY', isHover ),
		scale3DX: suffixSlug( 'scale3DX', isHover ),
		scale3DY: suffixSlug( 'scale3DY', isHover ),
		translateX: suffixSlug( 'translateX', isHover ),
		translateY: suffixSlug( 'translateY', isHover ),
		skewX: suffixSlug( 'skewX', isHover ),
		skewY: suffixSlug( 'skewY', isHover ),
		perspective: suffixSlug( 'perspective', isHover ),
	};
};

const getResetSlugs = ( isHover ) => {
	const slugs = getTransformSlugs( isHover );
	const resetSlugs = [
		slugs.rotateZ,
		slugs.rotateX,
		slugs.rotateY,
		slugs.scaleX,
		slugs.scaleY,
		slugs.scale3DX,
		slugs.scale3DY,
		slugs.translateX,
		slugs.translateY,
		slugs.skewX,
		slugs.skewY,
		slugs.perspective,
		'transformOrigin',
		'transformOriginX',
		'transformOriginY',
		suffixSlug( 'scale', isHover ),
		suffixSlug( 'rotate3D', isHover ),
		suffixSlug( 'scaleSeparate', isHover ),
		suffixSlug( 'translate3D', isHover ),
		suffixSlug( 'translateZ', isHover ),
	];

	if ( ! isHover ) {
		resetSlugs.push( 'transformTransitionDuration' );
	}

	return resetSlugs;
};

const hasAnyValueSet = ( attributes, slugs ) =>
	slugs.some(
		( slug ) => attributes?.[ slug ] !== undefined && attributes?.[ slug ] !== null
	);

const TransformDropdown = memo( function TransformDropdown( {
	isHover,
	BlockishResponsiveControl,
	onReset,
	canReset,
} ) {
	const slugs = getTransformSlugs( isHover );

	return (
		<div className="blockish-transform-panel">
			<div className="blockish-transform-toggle-row">
				<Dropdown
					className="blockish-dropdown blockish-transform-dropdown-trigger"
					contentClassName="blockish-dropdown-content"
					popoverProps={ { placement: 'left-start', shift: true, offset: 36 } }
					renderToggle={ ( { isOpen, onToggle } ) => (
						<Button variant="secondary" onClick={ onToggle } aria-expanded={ isOpen }>
							<HStack justify="flex-start" gap={ 4 }>
								<Text>{ __( 'Transform', 'blockish' ) }</Text>
							</HStack>
						</Button>
					) }
					renderContent={ () => (
						<div className="blockish-transform-dropdown">
							<BlockishResponsiveControl
								label={ __( 'Translate X', 'blockish' ) }
								left="77px"
								type="BlockishRangeUnit"
								slug={ slugs.translateX }
								units={ {
									px: { min: -1000, max: 1000, step: 1 },
									'%': { min: -100, max: 100, step: 1 },
									em: { min: -50, max: 50, step: 0.1 },
									rem: { min: -50, max: 50, step: 0.1 },
								} }
							/>
							<BlockishResponsiveControl
								label={ __( 'Translate Y', 'blockish' ) }
								left="77px"
								type="BlockishRangeUnit"
								slug={ slugs.translateY }
								units={ {
									px: { min: -1000, max: 1000, step: 1 },
									'%': { min: -100, max: 100, step: 1 },
									em: { min: -50, max: 50, step: 0.1 },
									rem: { min: -50, max: 50, step: 0.1 },
								} }
							/>
							<BlockishResponsiveControl label={ __( 'Scale X', 'blockish' ) } left="48px" type="RangeControl" slug={ slugs.scaleX } min={ 0.1 } max={ 3 } step={ 0.1 } />
							<BlockishResponsiveControl label={ __( 'Scale Y', 'blockish' ) } left="48px" type="RangeControl" slug={ slugs.scaleY } min={ 0.1 } max={ 3 } step={ 0.1 } />
							<BlockishResponsiveControl label={ __( 'Scale X (3D)', 'blockish' ) } left="80px" type="RangeControl" slug={ slugs.scale3DX } min={ 0.1 } max={ 3 } step={ 0.1 } />
							<BlockishResponsiveControl label={ __( 'Scale Y (3D)', 'blockish' ) } left="80px" type="RangeControl" slug={ slugs.scale3DY } min={ 0.1 } max={ 3 } step={ 0.1 } />
							<BlockishResponsiveControl
								label={ __( 'Perspective', 'blockish' ) }
								left="76px"
								type="BlockishRangeUnit"
								slug={ slugs.perspective }
								units={ { px: { min: 0, max: 2000, step: 10 } } }
								help={ __( 'Adds depth to 3D transforms', 'blockish' ) }
							/>
							<BlockishResponsiveControl label={ __( 'Rotate X', 'blockish' ) } left="55px" type="RangeControl" slug={ slugs.rotateX } min={ -360 } max={ 360 } step={ 1 } />
							<BlockishResponsiveControl label={ __( 'Rotate Y', 'blockish' ) } left="55px" type="RangeControl" slug={ slugs.rotateY } min={ -360 } max={ 360 } step={ 1 } />
							<BlockishResponsiveControl label={ __( 'Rotate Z', 'blockish' ) } left="44px" type="RangeControl" slug={ slugs.rotateZ } min={ -360 } max={ 360 } step={ 1 } />
							<BlockishResponsiveControl label={ __( 'Skew X', 'blockish' ) } left="45px" type="RangeControl" slug={ slugs.skewX } min={ -60 } max={ 60 } step={ 1 } />
							<BlockishResponsiveControl label={ __( 'Skew Y', 'blockish' ) } left="45px" type="RangeControl" slug={ slugs.skewY } min={ -60 } max={ 60 } step={ 1 } />
						</div>
					) }
				/>
				<Button
					className="blockish-transform-reset-icon"
					variant="secondary"
					icon="image-rotate"
					label={ __( 'Reset Transform', 'blockish' ) }
					onClick={ onReset }
					disabled={ ! canReset }
				/>
			</div>
		</div>
	);
} );

const TransformOriginControls = memo( function TransformOriginControls( {
	attributes,
	BlockishControl,
	BlockishResponsiveControl,
} ) {
	const selectedOrigin = attributes?.transformOrigin;

	return (
		<div className="blockish-transform-origin-after-tab">
			<BlockishControl
				label={ __( 'Transform Origin', 'blockish' ) }
				type="SelectControl"
				slug="transformOrigin"
				options={ ORIGIN_OPTIONS }
			/>
			{ selectedOrigin === 'custom' && (
				<>
					<BlockishResponsiveControl
						label={ __( 'Origin X', 'blockish' ) }
						left="52px"
						type="BlockishRangeUnit"
						slug="transformOriginX"
						units={ {
							px: { min: -1000, max: 1000, step: 1 },
							'%': { min: -100, max: 100, step: 1 },
							em: { min: -50, max: 50, step: 0.1 },
							rem: { min: -50, max: 50, step: 0.1 },
						} }
					/>
					<BlockishResponsiveControl
						label={ __( 'Origin Y', 'blockish' ) }
						left="52px"
						type="BlockishRangeUnit"
						slug="transformOriginY"
						units={ {
							px: { min: -1000, max: 1000, step: 1 },
							'%': { min: -100, max: 100, step: 1 },
							em: { min: -50, max: 50, step: 0.1 },
							rem: { min: -50, max: 50, step: 0.1 },
						} }
					/>
				</>
			) }
		</div>
	);
} );

const Transform = ( { attributes, setAttributes } ) => {
	const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;

	const handleReset = useCallback(
		( isHover ) => {
			const slugs = getResetSlugs( isHover );
			const nextValues = {};
			slugs.forEach( ( slug ) => {
				nextValues[ slug ] = undefined;
			} );
			setAttributes( nextValues );
		},
		[ setAttributes ]
	);

	return (
		<BlockishControl type="BlockishPanelBody" title={ __( 'Transform', 'blockish' ) }>
			<BlockishControl
				type="BlockishTab"
				tabs={ [
					{ name: 'transform-normal', title: __( 'Normal', 'blockish' ) },
					{ name: 'transform-hover', title: __( 'Hover', 'blockish' ) },
				] }
			>
				{ ( { name: tabName } ) => {
					const isHover = tabName === 'transform-hover';
					const resetSlugs = getResetSlugs( isHover );
					const canReset = hasAnyValueSet( attributes, resetSlugs );
					return (
						<>
							<TransformDropdown
								isHover={ isHover }
								BlockishResponsiveControl={ BlockishResponsiveControl }
								onReset={ () => handleReset( isHover ) }
								canReset={ canReset }
							/>
						</>
					);
				} }
			</BlockishControl>
			<TransformOriginControls
				attributes={ attributes }
				BlockishControl={ BlockishControl }
				BlockishResponsiveControl={ BlockishResponsiveControl }
			/>
		</BlockishControl>
	);
};

export default memo( Transform );
