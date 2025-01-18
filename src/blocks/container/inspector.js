import { InspectorControls } from '@wordpress/block-editor';
import { memo } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
const Inspector = ({ attributes, advancedControls }) => {
    const {
        BlockishControl,
        BlockishResponsiveControl,
    } = window?.blockish?.controls;

    return (
        <InspectorControls>
            <BlockishControl
                type="BlockishTab"
                tabType="top-level"
                tabs={[
                    {
                        name: 'layout',
                        title: 'Layout'
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
                            tabName === 'layout' && (
                                <>
                                    <BlockishControl type="BlockishPanelBody" title={__('Layout', 'blockish')}>
                                        <BlockishResponsiveControl
                                            type="BlockishToggleGroup"
                                            label={__('Display', 'blockish')}
                                            slug="display"
                                            options={[
                                                {
                                                    label: 'Flex',
                                                    value: 'flex'
                                                },
                                                {
                                                    label: 'Grid',
                                                    value: 'grid'
                                                },
                                                {
                                                    label: 'Block',
                                                    value: 'block'
                                                },
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                            left="48px"
                                            isDeselectable={false}
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishToggleGroup"
                                            label={__('Flex Wrap', 'blockish')}
                                            slug="flexWrap"
                                            options={[
                                                {
                                                    label: 'Wrap',
                                                    value: 'wrap'
                                                },
                                                {
                                                    label: 'No Wrap',
                                                    value: 'nowrap'
                                                },
                                                {
                                                    label: 'Reverse',
                                                    value: 'wrap-reverse'
                                                }
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                            left="66px"
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishSelect"
                                            label={__('Justify Content', 'blockish')}
                                            slug="justifyContent"
                                            options={[
                                                {
                                                    label: 'Start',
                                                    value: 'flex-start'
                                                },
                                                {
                                                    label: 'End',
                                                    value: 'flex-end'
                                                },
                                                {
                                                    label: 'Center',
                                                    value: 'center'
                                                },
                                                {
                                                    label: 'Space Between',
                                                    value: 'space-between'
                                                },
                                                {
                                                    label: 'Space Around',
                                                    value: 'space-around'
                                                },
                                                {
                                                    label: 'Space Evenly',
                                                    value: 'space-evenly'
                                                },
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                            left="105px"
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishSelect"
                                            label={__('Align Items', 'blockish')}
                                            slug="alignItems"
                                            options={[
                                                {
                                                    label: 'Start',
                                                    value: 'flex-start'
                                                },
                                                {
                                                    label: 'End',
                                                    value: 'flex-end'
                                                },
                                                {
                                                    label: 'Center',
                                                    value: 'center'
                                                },
                                                {
                                                    label: 'Stretch',
                                                    value: 'stretch'
                                                }
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                            left="75px"
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishRangeUnit"
                                            label={__('Column Gap', 'blockish')}
                                            slug="columnGap"
                                            left="77px"
                                        />
                                        <BlockishResponsiveControl
                                            type="BlockishRangeUnit"
                                            label={__('Row Gap', 'blockish')}
                                            slug="rowGap"
                                            left="54px"
                                        />
                                    </BlockishControl>
                                    <BlockishControl type="BlockishPanelBody" title={__('Additional', 'blockish')} initialOpen={false}>
                                        <BlockishControl
                                            type="BlockishSelect"
                                            label={__('Tag', 'blockish')}
                                            slug="tag"
                                            options={[
                                                {
                                                    label: 'Div',
                                                    value: 'div'
                                                },
                                                {
                                                    label: 'Section',
                                                    value: 'section'
                                                },
                                                {
                                                    label: 'Article',
                                                    value: 'article'
                                                },
                                                {
                                                    label: 'Main',
                                                    value: 'main'
                                                },
                                                {
                                                    label: 'a(Link)',
                                                    value: 'a'
                                                },
                                                {
                                                    label: 'Nav',
                                                    value: 'nav'
                                                },
                                                {
                                                    label: 'Header',
                                                    value: 'header'
                                                },
                                                {
                                                    label: 'Footer',
                                                    value: 'footer'
                                                },
                                                {
                                                    label: 'Ul(List)',
                                                    value: 'ul'
                                                },
                                                {
                                                    label: 'Ol(List)',
                                                    value: 'ol'
                                                },
                                                {
                                                    label: 'Li(List Item)',
                                                    value: 'li'
                                                },
                                                {
                                                    label: 'Figure',
                                                    value: 'figure'
                                                }
                                            ]}
                                            __nextHasNoMarginBottom={true}
                                        />
                                    </BlockishControl>
                                </>
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