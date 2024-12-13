import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
const Inspector = ({ advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
    } = window?.blockish?.controls;

    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
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
                        {
                            tabName === 'content' && (
                                <BlockishControl type="BlockishPanelBody" title={__('Content', 'blockish')}>
                                    <BlockishControl
                                        type="BlockishTextareaControl"
                                        label={__('Content', 'blockish')}
                                        slug="content"
                                    />
                                    <BlockishControl
                                        type="BlockishRangeControl"
                                        label={__('Opacity', 'blockish')}
                                        slug="opacity"
                                        min={0}
                                        max={1}
                                        step={0.1}
                                    />
                                    <BlockishControl
                                        type="BlockishSelectControl"
                                        label={__('Overflow', 'blockish')}
                                        options={[
                                            {
                                                label: 'Visible',
                                                value: 'visible'
                                            },
                                            {
                                                label: 'Hidden',
                                                value: 'hidden'
                                            }
                                        ]}
                                        slug="overflow"
                                    />
                                    <BlockishControl
                                        type="SelectControl"
                                        label={__('Tag', 'blockish')}
                                        slug="tag"
                                        options={[
                                            {
                                                label: 'H1',
                                                value: 'h1'
                                            },
                                            {
                                                label: 'H2',
                                                value: 'h2'
                                            },
                                            {
                                                label: 'H3',
                                                value: 'h3'
                                            },
                                            {
                                                label: 'H4',
                                                value: 'h4'
                                            },
                                            {
                                                label: 'H5',
                                                value: 'h5'
                                            },
                                            {
                                                label: 'H6',
                                                value: 'h6'
                                            },
                                            {
                                                label: 'P',
                                                value: 'p'
                                            }
                                        ]}
                                        __nextHasNoMarginBottom={true}
                                    />
                                    <BlockishResponsiveControl
                                        type="BlockishToggleGroup"
                                        slug="alignment"
                                        label={__('Alignment', 'blockish')}
                                        options={[
                                            {
                                                label: 'Left',
                                                value: 'left'
                                            },
                                            {
                                                label: 'Center',
                                                value: 'center'
                                            },
                                            {
                                                label: 'Right',
                                                value: 'right'
                                            }
                                        ]}
                                    />
                                </BlockishControl>
                            )
                        }
                        {
                            tabName === 'style' && (
                                <BlockishControl type="BlockishPanelBody" title={__('Style', 'blockish')}>
                                    <BlockishControl
                                        type="BlockishColor"
                                        slug="textColor"
                                        label={__('Text Color', 'blockish')}
                                    />
                                    <BlockishControl
                                        type="BlockishFontSizePicker"
                                        slug="fontSize"
                                        label={__('Font Size', 'blockish')}
                                    />
                                </BlockishControl>
                            )
                        }
                         {
                            tabName === 'advanced' && (
                                advancedControls
                            )
                        }
                    </>
                )}
            </BlockishControl>
        </InspectorControls>
    )
}
export default memo(Inspector);