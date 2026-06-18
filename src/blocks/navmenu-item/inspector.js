import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ( { advancedControls } ) => {
	const { BlockishControl, BlockishGroupControl } = window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'style', title: 'Style' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Item', 'blockish' ) }
								initialOpen={ true }
							>
								<BlockishGroupControl
									type="BlockishTypography"
									label={ __( 'Typography', 'blockish' ) }
									slug="itemTypography"
								/>
								<BlockishControl
									type="BlockishTab"
									tabs={ [
										{ name: 'item-normal', title: 'Normal' },
										{ name: 'item-hover', title: 'Hover' },
									] }
								>
									{ ( { name } ) => (
										<>
											{ name === 'item-normal' && (
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Color', 'blockish' ) }
													slug="itemColorNormal"
												/>
											) }
											{ name === 'item-hover' && (
												<BlockishControl
													type="BlockishColor"
													label={ __( 'Color', 'blockish' ) }
													slug="itemColorHover"
												/>
											) }
										</>
									) }
								</BlockishControl>
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
