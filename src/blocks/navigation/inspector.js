import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { attributes, advancedControls } ) => {
	const { BlockishControl, BlockishResponsiveControl } = window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: 'Content' },
					{ name: 'style', title: 'Style' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Navigation', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishControl
									type="BlockishToggleGroup"
									label={ __( 'Menu Breakpoint', 'blockish' ) }
									slug="menuBreakpoint"
									options={ [
										{ value: 'tablet', label: __( 'Tablet', 'blockish' ) },
										{ value: 'mobile', label: __( 'Mobile', 'blockish' ) },
										{ value: 'custom', label: __( 'Custom', 'blockish' ) },
									] }
									left="60px"
									help={ __(
										'Below this the desktop menu hides and the offcanvas hamburger shows.',
										'blockish'
									) }
								/>
								{ attributes?.menuBreakpoint === 'custom' && (
									<BlockishControl
										type="RangeControl"
										label={ __( 'Custom Breakpoint (Max Width, px)', 'blockish' ) }
										slug="menuCustomBreakpoint"
										min={ 400 }
										max={ 2000 }
										__nextHasNoMarginBottom={ true }
									/>
								) }
							</BlockishControl>
						) }
						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Layout', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishResponsiveControl
									type="BlockishSelect"
									label={ __( 'Justify Content', 'blockish' ) }
									slug="justifyContent"
									options={ [
										{ value: 'flex-start', label: __( 'Start', 'blockish' ) },
										{ value: 'center', label: __( 'Center', 'blockish' ) },
										{ value: 'flex-end', label: __( 'End', 'blockish' ) },
										{ value: 'space-between', label: __( 'Space Between', 'blockish' ) },
									] }
									__nextHasNoMarginBottom={ true }
									left="110px"
								/>
							</BlockishControl>
						) }
						{ tabName === 'advanced' && advancedControls }
					</>
				) }
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo( Inspector );
