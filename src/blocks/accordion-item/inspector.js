import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { TITLE_TAG_OPTIONS } from '../accordion/shared';

const Inspector = ( { advancedControls } ) => {
	const { BlockishControl } = window?.blockish?.controls;

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={ [
					{ name: 'content', title: 'Content' },
					{ name: 'advanced', title: 'Advanced' },
				] }
			>
				{ ( { name: tabName } ) => (
					<>
						{ tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={ __( 'Item', 'blockish' ) }
								initialOpen={ true }
							indicatorSlugs={['defaultOpen', 'expandIcon', 'collapseIcon', 'titleTag']}>
								<BlockishControl
									type="ToggleControl"
									label={ __(
										'Enable Default Open',
										'blockish'
									) }
									slug="defaultOpen"
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Expand Icon', 'blockish' ) }
									slug="expandIcon"
								/>
								<BlockishControl
									type="BlockishIconPicker"
									label={ __( 'Collapse Icon', 'blockish' ) }
									slug="collapseIcon"
								/>
								<BlockishControl
									type="BlockishSelect"
									label={ __( 'Title Tag', 'blockish' ) }
									slug="titleTag"
									options={ TITLE_TAG_OPTIONS }
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
