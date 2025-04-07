import { InspectorControls } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';
import { memo } from '@wordpress/element';

const Inspector = ({ advancedControls }) => {
    const {
        BlockishControl,
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
                        title: __('Content', 'blockish')
                    },
                    {
                        name: 'style',
                        title: __('Style', 'blockish')
                    },
                    {
                        name: 'advanced',
                        title: __('Advanced', 'blockish')
                    }
                ]}
            >
                {({ name: tabName }) => (
                    <>
                        {
                            tabName === 'content' && (
                                <BlockishControl type="BlockishPanelBody" title={__('Content', 'blockish')}>
                                    <BlockishControl
                                        type="BlockishSelect"
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
                                    />
                                    <BlockishResponsiveControl
                                        type="BlockishToggleGroup"
                                        slug="alignment"
                                        label={__('Alignment', 'blockish')}
                                        options={[
                                            {
                                                label: __('Left', 'blockish'),
                                                value: 'left'
                                            },
                                            {
                                                label: __('Center', 'blockish'),
                                                value: 'center'
                                            },
                                            {
                                                label: __('Right', 'blockish'),
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