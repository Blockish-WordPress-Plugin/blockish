import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

const Inspector = ({ attributes, setAttributes, advancedControls }) => {
    const { 
        BlockishControl,
        BlockishGroupControl,
        BlockishResponsiveControl
    } = window?.blockish?.controls;

    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
                tabType="top-level"
                tabs={[
                    {
                        name: 'content',
                        title: 'Content'
                    },
                    {
                        name: 'style',
                        title: 'Style'
                    },
                    {
                        name: 'advanced',
                        title: 'Advanced'
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {tabName === 'content' && (
                            <>
                                <BlockishControl type="BlockishPanelBody" title={__('Images', 'blockish')} initialOpen={true}>
                                    <BlockishControl
                                        type="BlockishMediaUploader"
                                        label={__('Before Image', 'blockish')}
                                        slug="beforeImage"
                                    />
                                    <BlockishControl
                                        type="BlockishMediaUploader"
                                        label={__('After Image', 'blockish')}
                                        slug="afterImage"
                                    />
                                </BlockishControl>
                                <BlockishControl type="BlockishPanelBody" title={__('Settings', 'blockish')} initialOpen={false}>
                                    <BlockishControl
                                        type="TextControl"
                                        label={__('Before Label', 'blockish')}
                                        slug="beforeLabel"
                                        __next40pxDefaultSize
                                    />
                                    <BlockishControl
                                        type="TextControl"
                                        label={__('After Label', 'blockish')}
                                        slug="afterLabel"
                                        __next40pxDefaultSize
                                    />
                                    <BlockishControl
                                        type="BlockishRangeControl"
                                        label={__('Initial Slider Position (%)', 'blockish')}
                                        slug="sliderPosition"
                                        min={0}
                                        max={100}
                                    />
                                </BlockishControl>
                            </>
                        )}
                        {tabName === 'style' && (
                            <>
                                <BlockishControl type="BlockishPanelBody" title={__('Labels', 'blockish')} initialOpen={true}>
                                    <BlockishControl 
                                        type="BlockishColor"
                                        label={__('Color', 'blockish')}
                                        slug="labelColor"
                                    />
                                    <BlockishControl 
                                        type="BlockishColor"
                                        label={__('Background Color', 'blockish')}
                                        slug="labelBackgroundColor"
                                    />
                                    <BlockishGroupControl 
                                        type="BlockishTypography"
                                        label={__('Typography', 'blockish')}
                                        slug="labelTypography"
                                    />
                                    <BlockishResponsiveControl
                                        left="6ch"
                                        type="BlockishRangeUnit"
                                        label={__('Padding', 'blockish')}
                                        slug="labelPadding"
                                    />
                                    <BlockishResponsiveControl
                                        type="BlockishBorderRadius"
                                        label={__('Border Radius', 'blockish')}
                                        slug="labelBorderRadius"
                                        left="44px"
                                    />
                                </BlockishControl>

                                <BlockishControl type="BlockishPanelBody" title={__('Handle', 'blockish')} initialOpen={false}>
                                    <BlockishControl 
                                        type="BlockishColor"
                                        label={__('Line Color', 'blockish')}
                                        slug="handleColor"
                                    />
                                    <BlockishControl 
                                        type="BlockishColor"
                                        label={__('Arrow Color', 'blockish')}
                                        slug="handleArrowColor"
                                    />
                                    <BlockishControl 
                                        type="BlockishColor"
                                        label={__('Circle Background', 'blockish')}
                                        slug="handleArrowBackground"
                                    />
                                    <BlockishGroupControl 
                                        type="BlockishBoxShadow"
                                        label={__('Circle Shadow', 'blockish')}
                                        slug="handleArrowBoxShadow"
                                    />
                                </BlockishControl>
                            </>
                        )}
                        {tabName === 'advanced' && advancedControls}
                    </>
                )}
            </BlockishControl>
        </InspectorControls>
    );
};

export default memo(Inspector);
