import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ advancedControls }) => {
	const { BlockishControl, BlockishResponsiveControl } =
		window?.blockish?.controls || {};

	if (!BlockishControl) {
		return null;
	}

	return (
		<InspectorControls>
			<BlockishControl
				type="BlockishTab"
				tabType="top-level"
				tabs={[
					{ name: 'content', title: __('Content', 'blockish') },
					{ name: 'style', title: __('Style', 'blockish') },
					{ name: 'advanced', title: __('Advanced', 'blockish') },
				]}
			>
				{({ name: tabName }) => (
					<>
						{tabName === 'content' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={__('Post Content', 'blockish')}
								initialOpen={true}
							>
								<BlockishControl
									type="BlockishSelect"
									label={__('HTML Tag', 'blockish')}
									slug="tag"
									options={[
										{
											value: 'div',
											label: __('Div', 'blockish'),
										},
										{
											value: 'section',
											label: __('Section', 'blockish'),
										},
										{
											value: 'article',
											label: __('Article', 'blockish'),
										},
										{
											value: 'main',
											label: __('Main', 'blockish'),
										},
									]}
								/>
								<BlockishResponsiveControl
									type="BlockishToggleGroup"
									label={__('Alignment', 'blockish')}
									slug="alignment"
									left="65px"
									options={[
										{
											value: 'left',
											label: __('Left', 'blockish'),
										},
										{
											value: 'center',
											label: __('Center', 'blockish'),
										},
										{
											value: 'right',
											label: __('Right', 'blockish'),
										},
									]}
								/>
							</BlockishControl>
						)}
						{tabName === 'style' && (
							<BlockishControl
								type="BlockishPanelBody"
								title={__('Content', 'blockish')}
								initialOpen={true}
							>
								<BlockishControl
									type="BlockishTypography"
									label={__('Typography', 'blockish')}
									slug="typography"
								/>
								<BlockishControl
									type="BlockishColor"
									label={__('Text Color', 'blockish')}
									slug="color"
								/>
								<BlockishControl
									type="BlockishColor"
									label={__('Link Color', 'blockish')}
									slug="linkColor"
								/>
								<BlockishControl
									type="BlockishColor"
									label={__(
										'Link Hover Color',
										'blockish'
									)}
									slug="linkHoverColor"
								/>
							</BlockishControl>
						)}
						{tabName === 'advanced' && advancedControls}
					</>
				)}
			</BlockishControl>
		</InspectorControls>
	);
};

export default memo(Inspector);
